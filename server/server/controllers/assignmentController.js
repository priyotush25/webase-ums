import mongoose from "mongoose";

import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const parseAssignment = (body, partial = false) => {
    const data = {};

    if (!partial || body.title !== undefined) {
        const title = String(body.title ?? "").trim();
        if (title.length < 3) return { error: "Title must be at least 3 characters" };
        data.title = title;
    }

    if (body.description !== undefined) {
        data.description = String(body.description).trim();
    }

    if (body.totalMarks !== undefined) {
        const marks = Number(body.totalMarks);
        if (!Number.isFinite(marks) || marks < 1 || marks > 1000) {
            return { error: "Total marks must be between 1 and 1000" };
        }
        data.totalMarks = marks;
    }

    if (!partial || body.dueDate !== undefined) {
        const due = new Date(body.dueDate);
        if (Number.isNaN(due.getTime())) return { error: "A valid due date is required" };
        data.dueDate = due;
    }

    return { data };
};

const populateAssignment = (query) =>
    query
        .populate("course", "title code semester")
        .populate("teacher", "name email");

// Teacher: own assignments
export const getMyAssignments = async (req, res) => {
    try {
        const assignments = await populateAssignment(
            Assignment.find({ teacher: req.user._id }).sort({ dueDate: -1 })
        );

        return res.status(200).json({ success: true, total: assignments.length, assignments });
    } catch (error) {
        console.error("Get Teacher Assignments Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch assignments" });
    }
};

// Teacher: create for an assigned course
export const createAssignment = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ success: false, message: "Valid course is required" });
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

        const { data, error } = parseAssignment(req.body);

        if (error) return res.status(400).json({ success: false, message: error });

        const created = await Assignment.create({
            ...data,
            course: course._id,
            teacher: req.user._id,
        });

        const assignment = await populateAssignment(Assignment.findById(created._id));

        return res.status(201).json({
            success: true,
            message: "Assignment created successfully",
            assignment,
        });
    } catch (error) {
        console.error("Create Assignment Error:", error);
        return res.status(500).json({ success: false, message: "Failed to create assignment" });
    }
};

// Teacher: update own assignment
export const updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!mongoose.isValidObjectId(assignmentId)) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID" });
        }

        const { data, error } = parseAssignment(req.body, true);

        if (error) return res.status(400).json({ success: false, message: error });

        const updated = await Assignment.findOneAndUpdate(
            { _id: assignmentId, teacher: req.user._id },
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const assignment = await populateAssignment(Assignment.findById(updated._id));

        return res.status(200).json({ success: true, message: "Assignment updated", assignment });
    } catch (error) {
        console.error("Update Assignment Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update assignment" });
    }
};

// Teacher: delete own assignment
export const deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!mongoose.isValidObjectId(assignmentId)) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID" });
        }

        const deleted = await Assignment.findOneAndDelete({
            _id: assignmentId,
            teacher: req.user._id,
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        return res.status(200).json({ success: true, message: "Assignment deleted" });
    } catch (error) {
        console.error("Delete Assignment Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete assignment" });
    }
};

// Student: assignments for approved courses
export const getStudentAssignments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id,
            status: "approved",
        }).select("course");

        const courseIds = enrollments.map((item) => item.course);

        const assignments = await populateAssignment(
            Assignment.find({ course: { $in: courseIds } }).sort({ dueDate: 1 })
        );

        return res.status(200).json({ success: true, total: assignments.length, assignments });
    } catch (error) {
        console.error("Get Student Assignments Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch assignments" });
    }
};

// Admin: all assignments
export const getAllAssignments = async (req, res) => {
    try {
        const assignments = await populateAssignment(
            Assignment.find().sort({ dueDate: -1 }).limit(500)
        );

        return res.status(200).json({ success: true, total: assignments.length, assignments });
    } catch (error) {
        console.error("Get All Assignments Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch assignments" });
    }
};
