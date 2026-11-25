import mongoose from "mongoose";

import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Result from "../models/Result.js";
import Submission from "../models/Submission.js";
import { courseSnapshot, summarizeResults } from "../utils/academics.js";
import { calculateGrade } from "../utils/grade.js";

const LIMITS = { assignment: 20, midterm: 30, final: 50 };

// Teacher: approved students with their current marks
export const getCourseResults = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id,
            status: { $in: ["active", "completed"] },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Assigned course not found",
            });
        }

        const [enrollments, results, assignments, submissions] = await Promise.all([
            Enrollment.find({ course: courseId, status: "approved" })
                .populate("student", "name email photoURL")
                .sort({ createdAt: 1 }),
            Result.find({ course: courseId }),
            Assignment.find({ course: courseId }).select("totalMarks"),
            Submission.find({ course: courseId, status: "checked" }).select("student marks"),
        ]);

        const resultMap = new Map(results.map((item) => [String(item.student), item]));

        // Assignment marks (out of 20) worked out from the checked assignments
        const possible = assignments.reduce((sum, a) => sum + a.totalMarks, 0);
        const earned = new Map();
        for (const item of submissions) {
            earned.set(String(item.student), (earned.get(String(item.student)) || 0) + (item.marks || 0));
        }

        const rows = enrollments
            .filter((item) => item.student)
            .map((item) => {
                const result = resultMap.get(String(item.student._id));

                return {
                    student: item.student,
                    assignment: result?.assignment ?? 0,
                    midterm: result?.midterm ?? 0,
                    final: result?.final ?? 0,
                    total: result?.total ?? 0,
                    letterGrade: result?.letterGrade ?? "-",
                    gradePoint: result?.gradePoint ?? 0,
                    remarks: result?.remarks ?? "",
                    saved: Boolean(result),
                    published: Boolean(result?.published),
                    suggestedAssignment: possible
                        ? Number(Math.min(20, ((earned.get(String(item.student._id)) || 0) / possible) * LIMITS.assignment).toFixed(1))
                        : null,
                };
            });

        return res.status(200).json({ success: true, course, total: rows.length, rows });
    } catch (error) {
        console.error("Get Course Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch results" });
    }
};

// Teacher: save marks for many students at once
export const saveCourseResults = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { results } = req.body;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        if (!Array.isArray(results) || results.length === 0) {
            return res.status(400).json({ success: false, message: "Results are required" });
        }

        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id,
            status: { $in: ["active", "completed"] },
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Assigned course not found",
            });
        }

        const enrollments = await Enrollment.find({
            course: courseId,
            status: "approved",
        }).select("student");

        const allowed = new Set(enrollments.map((item) => String(item.student)));

        const operations = [];

        for (const item of results) {
            if (!allowed.has(String(item.student))) {
                return res.status(400).json({
                    success: false,
                    message: "One or more students are not approved for this course",
                });
            }

            const marks = {};

            for (const [field, max] of Object.entries(LIMITS)) {
                const value = Number(item[field] ?? 0);

                if (!Number.isFinite(value) || value < 0 || value > max) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} marks must be between 0 and ${max}`,
                    });
                }

                marks[field] = value;
            }

            const total = Number(
                (marks.assignment + marks.midterm + marks.final).toFixed(2)
            );

            operations.push({
                updateOne: {
                    filter: { course: course._id, student: item.student },
                    update: {
                        $set: {
                            ...marks,
                            total,
                            ...calculateGrade(total),
                            remarks: String(item.remarks ?? "").trim(),
                            teacher: req.user._id,
                            snapshot: courseSnapshot(course),
                        },
                        // New results stay hidden from the student until the teacher publishes them
                        $setOnInsert: { published: false },
                    },
                    upsert: true,
                },
            });
        }

        await Result.bulkWrite(operations);

        return res.status(200).json({
            success: true,
            message: "Results saved. Publish them when you want students to see them.",
            saved: operations.length,
        });
    } catch (error) {
        console.error("Save Course Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to save results" });
    }
};

// Teacher: publish saved results of the course (students see them only after this)
export const publishCourseResults = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ success: false, message: "Invalid course ID" });
        }

        // Only the assigned teacher can publish
        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id,
            status: { $in: ["active", "completed"] },
        });

        if (!course) {
            return res.status(404).json({ success: false, message: "Assigned course not found" });
        }

        const approved = await Enrollment.find({ course: courseId, status: "approved" }).select("student");
        const studentIds = approved.map((item) => item.student);

        const saved = await Result.countDocuments({ course: courseId, student: { $in: studentIds } });

        if (saved === 0) {
            return res.status(400).json({ success: false, message: "Save the students' marks before publishing" });
        }

        const outcome = await Result.updateMany(
            { course: courseId, student: { $in: studentIds }, published: false },
            { $set: { published: true, publishedAt: new Date(), snapshot: courseSnapshot(course) } }
        );

        return res.status(200).json({
            success: true,
            message: outcome.modifiedCount
                ? `Published ${outcome.modifiedCount} result(s)`
                : "All saved results are already published",
            published: outcome.modifiedCount,
            withoutMarks: studentIds.length - saved,
        });
    } catch (error) {
        console.error("Publish Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to publish results" });
    }
};

// Student: own PUBLISHED results with semester-wise history and CGPA
export const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id, published: true })
            .populate("course", "title code credit semester")
            .populate("teacher", "name")
            .sort({ updatedAt: -1 });

        const summary = summarizeResults(results);

        return res.status(200).json({
            success: true,
            total: summary.totalCourses,
            totalCredits: summary.earnedCredits,
            gradedCredits: summary.gradedCredits,
            cgpa: summary.cgpa,
            history: summary.history,
        });
    } catch (error) {
        console.error("Get My Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch your results" });
    }
};

// Admin: all results
export const getAllResults = async (req, res) => {
    try {
        const filter = {};

        if (req.query.courseId) {
            if (!mongoose.isValidObjectId(req.query.courseId)) {
                return res.status(400).json({ success: false, message: "Invalid course ID" });
            }
            filter.course = req.query.courseId;
        }

        const results = await Result.find(filter)
            .populate("course", "title code credit semester")
            .populate("student", "name email photoURL")
            .populate("teacher", "name")
            .sort({ updatedAt: -1 })
            .limit(1000);

        return res.status(200).json({ success: true, total: results.length, results });
    } catch (error) {
        console.error("Get All Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch results" });
    }
};
