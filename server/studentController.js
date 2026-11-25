import Admission from "../models/Admission.js";
import Enrollment from "../models/Enrollment.js";
import Result from "../models/Result.js";
import { isAdmitted } from "../middleware/requireAdmission.js";
import { getCurrentSemesterCourses, summarizeResults } from "../utils/academics.js";

// Statuses a subject can have on the student's dashboard
//  not_enrolled -> pending -> active (approved) -> completed | failed
const courseStatusOf = (enrollment, result) => {
    if (result?.published) return result.gradePoint > 0 ? "completed" : "failed";
    if (enrollment?.status === "approved") return "active";
    if (enrollment?.status === "pending") return "pending";
    if (enrollment?.status === "rejected") return "rejected";
    if (enrollment?.status === "dropped") return "dropped";
    return "not_enrolled";
};

// Student dashboard data in one call
// GET /api/student/overview
export const getMyOverview = async (req, res) => {
    try {
        const user = req.user;

        const admission = await Admission.findOne({ $or: [{ user: user._id }, { email: user.email }] })
            .sort({ createdAt: -1 })
            .populate("department", "name code");

        const profile = {
            name: user.name,
            email: user.email,
            universityId: user.universityId,
            phone: user.phone,
            photoURL: user.photoURL,
            semester: user.semester,
            program: user.program,
            batch: user.batch,
            department: null,
        };

        if (!isAdmitted(user)) {
            return res.status(200).json({
                success: true,
                admitted: false,
                profile,
                admission: admission
                    ? {
                          _id: admission._id,
                          applicationNo: admission.applicationNo,
                          status: admission.status,
                          note: admission.adminNote,
                          department: admission.department,
                          program: admission.program,
                          submittedAt: admission.createdAt,
                          reviewedAt: admission.reviewedAt,
                      }
                    : null,
            });
        }

        await user.populate("department", "name code");
        profile.department = user.department;

        const [courses, enrollments, results] = await Promise.all([
            getCurrentSemesterCourses(user),
            Enrollment.find({ student: user._id }).select("course status"),
            Result.find({ student: user._id, published: true }).populate("course", "title code credit semester"),
        ]);

        const enrollmentMap = new Map(enrollments.map((item) => [String(item.course), item]));
        const resultMap = new Map(results.map((item) => [String(item.course?._id ?? item.course), item]));

        const subjects = courses.map((course) => {
            const enrollment = enrollmentMap.get(String(course._id));
            const result = resultMap.get(String(course._id));

            return {
                _id: course._id,
                code: course.code,
                title: course.title,
                credit: course.credit,
                teacher: course.teacher?.name || "",
                enrollmentStatus: enrollment?.status || null,
                status: courseStatusOf(enrollment, result),
                result: result
                    ? { total: result.total, letterGrade: result.letterGrade, gradePoint: result.gradePoint }
                    : null,
            };
        });

        const totalCredit = subjects.reduce((sum, s) => sum + s.credit, 0);
        const completedCredit = subjects.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.credit, 0);

        const summary = summarizeResults(results);

        return res.status(200).json({
            success: true,
            admitted: true,
            profile,
            admission: admission
                ? { applicationNo: admission.applicationNo, status: admission.status, reviewedAt: admission.reviewedAt }
                : null,
            semester: {
                name: user.semester,
                subjects,
                totalCredit,
                completedCredit,
                pendingCredit: totalCredit - completedCredit,
                activeCourses: subjects.filter((s) => s.status === "active").length,
            },
            cgpa: summary.cgpa,
            earnedCredits: summary.earnedCredits,
            gradedCourses: summary.totalCourses,
        });
    } catch (error) {
        console.error("Student Overview Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load your dashboard" });
    }
};
