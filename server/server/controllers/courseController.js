
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Department from "../models/Department.js";
import User from "../models/User.js";

const populateCourse = (query) => {
    return query
        .populate("department", "name code")
        .populate("teacher", "name email photoURL");
};

const validateCourseReferences = async (departmentId, teacherId) => {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return "Invalid department ID";
    }

    const department = await Department.findOne({
        _id: departmentId,
        status: "active",
    });

    if (!department) {
        return "Active department not found";
    }

    if (teacherId) {
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return "Invalid teacher ID";
        }

        const teacher = await User.findOne({
            _id: teacherId,
            role: "teacher",
        });

        if (!teacher) {
            return "Selected teacher not found";
        }
    }

    return null;
};


// ========================================
// CREATE COURSE
// ========================================

export const createCourse = async (req, res) => {
    try {
        const {
            title,
            code,
            description,
            credit,
            department,
            teacher,
            semester,
            capacity,
        } = req.body;

        if (
            !title?.trim() ||
            !code?.trim() ||
            !credit ||
            !department ||
            !semester?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, code, credit, department and semester are required",
            });
        }

        const referenceError = await validateCourseReferences(
            department,
            teacher
        );

        if (referenceError) {
            return res.status(400).json({
                success: false,
                message: referenceError,
            });
        }

        const course = await Course.create({
            title,
            code,
            description,
            credit,
            department,
            teacher: teacher || null,
            semester,
            ...(capacity ? { capacity: Number(capacity) } : {}),
        });

        const populatedCourse = await populateCourse(
            Course.findById(course._id)
        );

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: populatedCourse,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Course code already exists",
            });
        }

        console.error("Create Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create course",
        });
    }
};


// ========================================
// GET ALL COURSES
// ========================================

export const getAllCourses = async (req, res) => {
    try {
        const {
            search = "",
            department = "all",
            status = "all",
        } = req.query;

        const filter = {};

        if (search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { title: { $regex: escapedSearch, $options: "i" } },
                { code: { $regex: escapedSearch, $options: "i" } },
                { semester: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        if (
            department !== "all" &&
            mongoose.Types.ObjectId.isValid(department)
        ) {
            filter.department = department;
        }

        if (["active", "inactive"].includes(status)) {
            filter.status = status;
        }

        const courses = await populateCourse(
            Course.find(filter).sort({ createdAt: -1 })
        );

        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: courses,
        });

    } catch (error) {
        console.error("Get Courses Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
        });
    }
};


// ========================================
// GET SINGLE COURSE
// ========================================

export const getCourseById = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await populateCourse(
            Course.findById(courseId)
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        res.status(200).json({
            success: true,
            data: course,
        });

    } catch (error) {
        console.error("Get Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch course",
        });
    }
};


// ========================================
// UPDATE COURSE
// ========================================

export const updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const {
            title,
            code,
            description,
            credit,
            department,
            teacher,
            semester,
            status,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const existingCourse = await Course.findById(courseId);

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const nextDepartment = department ?? existingCourse.department.toString();
        const nextTeacher = teacher === undefined
            ? existingCourse.teacher?.toString() || ""
            : teacher;

        const referenceError = await validateCourseReferences(
            nextDepartment,
            nextTeacher
        );

        if (referenceError) {
            return res.status(400).json({
                success: false,
                message: referenceError,
            });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                ...(title !== undefined && { title }),
                ...(code !== undefined && { code }),
                ...(description !== undefined && { description }),
                ...(credit !== undefined && { credit }),
                ...(req.body.capacity ? { capacity: Number(req.body.capacity) } : {}),
                ...(department !== undefined && { department }),
                ...(teacher !== undefined && { teacher: teacher || null }),
                ...(semester !== undefined && { semester }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        const populatedCourse = await populateCourse(
            Course.findById(updatedCourse._id)
        );

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: populatedCourse,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Course code already exists",
            });
        }

        console.error("Update Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update course",
        });
    }
};


// ========================================
// DELETE COURSE
// ========================================

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        await Course.findByIdAndDelete(courseId);

        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });

    } catch (error) {
        console.error("Delete Course Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete course",
        });
    }
};




export const getMyTeachingCourses = async (req, res) => {
    try {
        const courses = await Course.find({
            teacher: req.user._id,
        })
            .populate("department", "name code")
            .populate("teacher", "name email photoURL")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Teaching courses fetched successfully",
            total: courses.length,
            courses,
        });
    } catch (error) {
        console.error("Get My Teaching Courses Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch teaching courses",
        });
    }
};

