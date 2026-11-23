
import mongoose from "mongoose";

import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Normalize date to UTC midnight
const normalizeDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate()
        )
    );
};

// Validate date range
const getDateRange = (from, to) => {
    const start = from ? normalizeDate(from) : null;
    const end = to ? normalizeDate(to) : null;

    if ((from && !start) || (to && !end)) {
        return null;
    }

    if (start && end && start > end) {
        return null;
    }

    const range = {};

    if (start) {
        range.$gte = start;
    }

    if (end) {
        range.$lte = new Date(
            end.getTime() + 24 * 60 * 60 * 1000 - 1
        );
    }

    return range;
};

const allowedStatuses = [
    "present",
    "absent",
    "late",
    "excused"
];


// ==========================================
// TEACHER: GET APPROVED COURSE STUDENTS
// ==========================================

export const getCourseStudentsForAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id,
            status: "active"
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Assigned active course not found"
            });
        }

        const enrollments = await Enrollment.find({
            course: courseId,
            status: "approved"
        })
            .populate("student", "name email photoURL")
            .sort({ createdAt: 1 });

        const students = enrollments
            .filter((item) => item.student)
            .map((item) => item.student);

        return res.status(200).json({
            success: true,
            message: "Course students fetched successfully",
            course,
            total: students.length,
            students
        });

    } catch (error) {
        console.error("Get Attendance Students Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch course students"
        });
    }
};


// ==========================================
// TEACHER: GET COURSE ATTENDANCE BY DATE
// ==========================================

export const getCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const date = normalizeDate(req.query.date);

        if (!mongoose.isValidObjectId(courseId) || !date) {
            return res.status(400).json({
                success: false,
                message: "Valid course ID and date are required"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id
        });

        if (!course) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this course"
            });
        }

        const attendance = await Attendance.find({
            course: courseId,
            teacher: req.user._id,
            date
        })
            .populate("student", "name email photoURL")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Attendance fetched successfully",
            total: attendance.length,
            attendance
        });

    } catch (error) {
        console.error("Get Course Attendance Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance"
        });
    }
};


// ==========================================
// TEACHER: SAVE / UPDATE COURSE ATTENDANCE
// ==========================================

export const saveCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { date: dateValue, records } = req.body;

        const date = normalizeDate(dateValue);

        if (!mongoose.isValidObjectId(courseId) || !date) {
            return res.status(400).json({
                success: false,
                message: "Valid course ID and date are required"
            });
        }

        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Attendance records are required"
            });
        }

        if (records.length > 500) {
            return res.status(400).json({
                success: false,
                message: "Maximum 500 students allowed per request"
            });
        }

        const course = await Course.findOne({
            _id: courseId,
            teacher: req.user._id,
            status: "active"
        });

        if (!course) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this active course"
            });
        }

        // Validate record structure
        if (
            records.some(
                (item) =>
                    !item ||
                    typeof item !== "object" ||
                    !item.studentId ||
                    typeof item.status !== "string" ||
                    (item.remarks !== undefined &&
                        typeof item.remarks !== "string")
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance record format"
            });
        }

        const studentIds = records.map((item) => item.studentId);

        // Validate ObjectIds and duplicates
        if (
            studentIds.some(
                (id) => !mongoose.isValidObjectId(id)
            ) ||
            new Set(studentIds.map(String)).size !== studentIds.length
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid or duplicate student IDs"
            });
        }

        // Validate attendance statuses
        if (
            records.some(
                (item) => !allowedStatuses.includes(item.status)
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid attendance status"
            });
        }

        // Only approved students can receive attendance
        const approvedEnrollments = await Enrollment.find({
            course: courseId,
            student: { $in: studentIds },
            status: "approved"
        }).select("student");

        const approvedStudentIds = new Set(
            approvedEnrollments.map(
                (item) => String(item.student)
            )
        );

        const invalidStudents = studentIds.filter(
            (id) => !approvedStudentIds.has(String(id))
        );

        if (invalidStudents.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Some students are not approved for this course"
            });
        }

        // Save or update attendance
        const operations = records.map((item) => ({
            updateOne: {
                filter: {
                    course: courseId,
                    student: item.studentId,
                    date
                },

                update: {
                    $set: {
                        teacher: req.user._id,
                        status: item.status,
                        remarks: item.remarks?.trim() || ""
                    }
                },

                upsert: true
            }
        }));

        await Attendance.bulkWrite(operations);

        const attendance = await Attendance.find({
            course: courseId,
            date
        })
            .populate("student", "name email photoURL")
            .populate("teacher", "name email")
            .sort({ createdAt: 1 });

        return res.status(200).json({
            success: true,
            message: "Attendance saved successfully",
            total: attendance.length,
            attendance
        });

    } catch (error) {
        console.error("Save Attendance Error:", error);

        // MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Duplicate attendance record detected. Please retry."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to save attendance"
        });
    }
};


// ==========================================
// STUDENT: GET OWN ATTENDANCE
// ==========================================

export const getMyAttendance = async (req, res) => {
    try {
        const { courseId, from, to } = req.query;

        const filter = {
            student: req.user._id
        };

        if (courseId) {
            if (!mongoose.isValidObjectId(courseId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            filter.course = courseId;
        }

        if (from || to) {
            const dateRange = getDateRange(from, to);

            if (!dateRange) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date range"
                });
            }

            filter.date = dateRange;
        }

        const attendance = await Attendance.find(filter)
            .populate("course", "title code credit semester")
            .populate("teacher", "name email")
            .sort({ date: -1 });

        const total = attendance.length;

        const present = attendance.filter(
            (item) => item.status === "present"
        ).length;

        const absent = attendance.filter(
            (item) => item.status === "absent"
        ).length;

        const late = attendance.filter(
            (item) => item.status === "late"
        ).length;

        const excused = attendance.filter(
            (item) => item.status === "excused"
        ).length;

        // Excused classes are excluded from the percentage denominator
        const countableClasses = total - excused;

        const percentage = countableClasses
            ? Number(
                (
                    ((present + late) / countableClasses) * 100
                ).toFixed(2)
            )
            : 0;

        return res.status(200).json({
            success: true,
            total,
            countableClasses,
            present,
            absent,
            late,
            excused,
            percentage,
            attendance
        });

    } catch (error) {
        console.error("Get My Attendance Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch your attendance"
        });
    }
};


// ==========================================
// ADMIN: GET ALL ATTENDANCE
// ==========================================

export const getAllAttendance = async (req, res) => {
    try {
        const {
            courseId,
            studentId,
            status,
            from,
            to
        } = req.query;

        const filter = {};

        if (courseId) {
            if (!mongoose.isValidObjectId(courseId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            filter.course = courseId;
        }

        if (studentId) {
            if (!mongoose.isValidObjectId(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid student ID"
                });
            }

            filter.student = studentId;
        }

        if (status) {
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid attendance status"
                });
            }

            filter.status = status;
        }

        if (from || to) {
            const dateRange = getDateRange(from, to);

            if (!dateRange) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date range"
                });
            }

            filter.date = dateRange;
        }

        const attendance = await Attendance.find(filter)
            .populate("student", "name email")
            .populate("course", "title code")
            .populate("teacher", "name email")
            .sort({ date: -1 })
            .limit(500);

        return res.status(200).json({
            success: true,
            message: "Attendance records fetched successfully",
            total: attendance.length,
            attendance
        });

    } catch (error) {
        console.error("Get All Attendance Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch attendance records"
        });
    }
};
