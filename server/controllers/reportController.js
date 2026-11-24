import Admission from "../models/Admission.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Department from "../models/Department.js";
import Enrollment from "../models/Enrollment.js";
import Fee from "../models/Fee.js";
import Result from "../models/Result.js";
import User from "../models/User.js";

// Admin: one-call summary for the reports page
export const getSummary = async (req, res) => {
    try {
        const [
            users, departments, courses, enrollments, fees, admissions, results, attendance,
        ] = await Promise.all([
            User.find().select("role department"),
            Department.find().select("name code"),
            Course.find().select("title code department capacity status"),
            Enrollment.find({ status: "approved" }).select("course"),
            Fee.find().select("amount status"),
            Admission.find().select("status"),
            Result.find().select("letterGrade"),
            Attendance.find().select("status"),
        ]);

        const countBy = (list, key) =>
            list.reduce((map, item) => ((map[item[key]] = (map[item[key]] || 0) + 1), map), {});

        // Students per department
        const deptStudents = {};
        for (const user of users) {
            if (user.role === "student" && user.department) {
                deptStudents[user.department] = (deptStudents[user.department] || 0) + 1;
            }
        }

        // Seats per course
        const taken = {};
        for (const item of enrollments) taken[item.course] = (taken[item.course] || 0) + 1;

        const courseLoad = courses
            .map((course) => ({
                _id: course._id,
                code: course.code,
                title: course.title,
                capacity: course.capacity ?? 60,
                enrolled: taken[course._id] || 0,
            }))
            .sort((a, b) => b.enrolled - a.enrolled)
            .slice(0, 8);

        const sumFees = (status) =>
            fees.filter((fee) => fee.status === status).reduce((total, fee) => total + fee.amount, 0);

        const present = attendance.filter((a) => ["present", "late"].includes(a.status)).length;
        const countable = attendance.filter((a) => a.status !== "excused").length;

        return res.status(200).json({
            success: true,
            people: countBy(users, "role"),
            departments: departments.map((dept) => ({
                _id: dept._id,
                code: dept.code,
                name: dept.name,
                students: deptStudents[dept._id] || 0,
            })),
            courseLoad,
            fees: { collected: sumFees("paid"), outstanding: sumFees("unpaid") },
            admissions: countBy(admissions, "status"),
            grades: countBy(results, "letterGrade"),
            attendanceRate: countable ? Number(((present / countable) * 100).toFixed(1)) : null,
            totals: { courses: courses.length, enrollments: enrollments.length },
        });
    } catch (error) {
        console.error("Report Summary Error:", error);
        return res.status(500).json({ success: false, message: "Failed to build report" });
    }
};
