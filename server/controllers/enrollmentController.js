
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// ========================================
// STUDENT: APPLY FOR COURSE
// POST /api/enrollments
// ========================================

export const createEnrollment = async (req, res) => {
    try {
        const { courseId } = req.body;

        const studentId = req.user._id;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        // Check active course
        const course = await Course.findOne({
            _id: courseId,
            status: "active",
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Active course not found",
            });
        }

        // Check existing enrollment
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
        });

        if (existingEnrollment) {
            if (
                existingEnrollment.status === "pending" ||
                existingEnrollment.status === "approved"
            ) {
                return res.status(409).json({
                    success: false,
                    message: "You already have an enrollment for this course",
                });
            }

            // Reapply after rejected or dropped
            existingEnrollment.status = "pending";
            existingEnrollment.enrolledAt = null;
            existingEnrollment.reviewedBy = null;
            existingEnrollment.reviewedAt = null;
            existingEnrollment.remarks = "";

            await existingEnrollment.save();

            const populatedEnrollment = await Enrollment.findById(
                existingEnrollment._id
            )
                .populate("course", "title code credit semester")
                .populate("student", "name email");

            return res.status(200).json({
                success: true,
                message: "Enrollment application submitted again",
                data: populatedEnrollment,
            });
        }

        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
        });

        const populatedEnrollment = await Enrollment.findById(
            enrollment._id
        )
            .populate("course", "title code credit semester")
            .populate("student", "name email");

        res.status(201).json({
            success: true,
            message: "Enrollment application submitted successfully",
            data: populatedEnrollment,
        });
    } catch (error) {
        console.error("Create Enrollment Error:", error);

        res.status(error.code === 11000 ? 409 : 500).json({
            success: false,
            message:
                error.code === 11000
                    ? "Enrollment already exists"
                    : "Failed to submit enrollment",
        });
    }
};

// ========================================
// STUDENT: GET MY ENROLLMENTS
// GET /api/enrollments/my
// ========================================

export const getMyEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id,
        })
            .populate("course", "title code credit semester status")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Your enrollments fetched successfully",
            data: enrollments,
        });
    } catch (error) {
        console.error("Get My Enrollments Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch your enrollments",
        });
    }
};

// ========================================
// ADMIN: GET ALL ENROLLMENTS
// GET /api/enrollments
// ========================================

export const getAllEnrollments = async (req, res) => {
    try {
        const {
            search = "",
            status = "all",
            course = "all",
        } = req.query;

        const filter = {};

        if (
            ["pending", "approved", "rejected", "dropped"].includes(status)
        ) {
            filter.status = status;
        }

        if (course !== "all") {
            if (!mongoose.isValidObjectId(course)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID",
                });
            }

            filter.course = course;
        }

        // Search by student name/email or course title/code
        if (search.trim()) {
            const safeSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            const [students, courses] = await Promise.all([
                mongoose.model("User").find({
                    role: "student",
                    $or: [
                        {
                            name: {
                                $regex: safeSearch,
                                $options: "i",
                            },
                        },
                        {
                            email: {
                                $regex: safeSearch,
                                $options: "i",
                            },
                        },
                    ],
                }).select("_id"),

                Course.find({
                    $or: [
                        {
                            title: {
                                $regex: safeSearch,
                                $options: "i",
                            },
                        },
                        {
                            code: {
                                $regex: safeSearch,
                                $options: "i",
                            },
                        },
                    ],
                }).select("_id"),
            ]);

            filter.$or = [
                { student: { $in: students.map((item) => item._id) } },
                { course: { $in: courses.map((item) => item._id) } },
            ];
        }

        const enrollments = await Enrollment.find(filter)
            .populate("student", "name email photoURL")
            .populate("course", "title code credit semester")
            .populate("reviewedBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Enrollments fetched successfully",
            data: enrollments,
        });
    } catch (error) {
        console.error("Get All Enrollments Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch enrollments",
        });
    }
};

// ========================================
// ADMIN: UPDATE ENROLLMENT STATUS
// PATCH /api/enrollments/:enrollmentId/status
// ========================================

export const updateEnrollmentStatus = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status, remarks = "" } = req.body;

        if (!mongoose.isValidObjectId(enrollmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enrollment ID",
            });
        }

        const allowedStatuses = [
            "pending",
            "approved",
            "rejected",
            "dropped",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enrollment status",
            });
        }

        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found",
            });
        }

        enrollment.status = status;
        enrollment.remarks = remarks;

        if (status === "approved") {
            enrollment.enrolledAt = new Date();
        } else {
            enrollment.enrolledAt = null;
        }

        enrollment.reviewedBy = req.user._id;
        enrollment.reviewedAt = new Date();

        await enrollment.save();

        const updatedEnrollment = await Enrollment.findById(
            enrollmentId
        )
            .populate("student", "name email photoURL")
            .populate("course", "title code credit semester")
            .populate("reviewedBy", "name email");

        res.status(200).json({
            success: true,
            message: `Enrollment ${status} successfully`,
            data: updatedEnrollment,
        });
    } catch (error) {
        console.error("Update Enrollment Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update enrollment status",
        });
    }
};

// ========================================
// ADMIN: DELETE ENROLLMENT
// DELETE /api/enrollments/:enrollmentId
// ========================================

export const deleteEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        if (!mongoose.isValidObjectId(enrollmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enrollment ID",
            });
        }

        const enrollment = await Enrollment.findById(enrollmentId);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found",
            });
        }

        await Enrollment.findByIdAndDelete(enrollmentId);

        res.status(200).json({
            success: true,
            message: "Enrollment deleted successfully",
        });
    } catch (error) {
        console.error("Delete Enrollment Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete enrollment",
        });
    }
};


// ========================================
// TEACHER: STUDENTS OF MY COURSES
// ========================================

export const getMyTeachingStudents = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user._id }).select(
            "title code semester"
        );

        const courseIds = courses.map((course) => course._id);

        const enrollments = await Enrollment.find({
            course: { $in: courseIds },
            status: "approved",
        })
            .populate("student", "name email photoURL")
            .populate("course", "title code semester")
            .sort({ createdAt: -1 });

        const rows = enrollments.filter((item) => item.student && item.course);

        return res.status(200).json({
            success: true,
            total: rows.length,
            courses,
            enrollments: rows,
        });
    } catch (error) {
        console.error("Get Teaching Students Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch students",
        });
    }
};
