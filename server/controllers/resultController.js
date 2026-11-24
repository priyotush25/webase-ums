import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Result from "../models/Result.js";
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
            status: "active",
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Assigned active course not found",
            });
        }

        const [enrollments, results] = await Promise.all([
            Enrollment.find({ course: courseId, status: "approved" })
                .populate("student", "name email photoURL")
                .sort({ createdAt: 1 }),
            Result.find({ course: courseId }),
        ]);

        const resultMap = new Map(results.map((item) => [String(item.student), item]));

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
                    published: Boolean(result),
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
            status: "active",
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Assigned active course not found",
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
                        },
                    },
                    upsert: true,
                },
            });
        }

        await Result.bulkWrite(operations);

        return res.status(200).json({
            success: true,
            message: "Results saved successfully",
            saved: operations.length,
        });
    } catch (error) {
        console.error("Save Course Results Error:", error);
        return res.status(500).json({ success: false, message: "Failed to save results" });
    }
};

// Student: own results with GPA / CGPA
export const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user._id })
            .populate("course", "title code credit semester")
            .populate("teacher", "name")
            .sort({ updatedAt: -1 });

        let credits = 0;
        let points = 0;

        for (const item of results) {
            const credit = Number(item.course?.credit || 0);
            credits += credit;
            points += credit * item.gradePoint;
        }

        const cgpa = credits ? Number((points / credits).toFixed(2)) : 0;

        return res.status(200).json({
            success: true,
            total: results.length,
            totalCredits: credits,
            cgpa,
            results,
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
