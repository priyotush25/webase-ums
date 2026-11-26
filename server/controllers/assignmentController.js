import mongoose from "mongoose";

import Assignment from "../models/Assignment.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Submission from "../models/Submission.js";

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
        const list = await populateAssignment(
            Assignment.find({ teacher: req.user._id }).sort({ dueDate: -1 })
        );

        const counts = await Submission.aggregate([
            { $match: { assignment: { $in: list.map((a) => a._id) } } },
            {
                $group: {
                    _id: "$assignment",
                    submitted: { $sum: 1 },
                    checked: { $sum: { $cond: [{ $eq: ["$status", "checked"] }, 1, 0] } },
                },
            },
        ]);

        const countMap = new Map(counts.map((c) => [String(c._id), c]));

        const assignments = list.map((item) => {
            const row = item.toObject();
            row.submittedCount = countMap.get(String(item._id))?.submitted || 0;
            row.checkedCount = countMap.get(String(item._id))?.checked || 0;
            return row;
        });

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

        await Submission.deleteMany({ assignment: deleted._id });

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

        const list = await populateAssignment(
            Assignment.find({ course: { $in: courseIds } }).sort({ dueDate: 1 })
        );

        const submissions = await Submission.find({
            student: req.user._id,
            assignment: { $in: list.map((a) => a._id) },
        });

        const submissionMap = new Map(submissions.map((item) => [String(item.assignment), item]));

        const assignments = list.map((item) => {
            const row = item.toObject();
            const mine = submissionMap.get(String(item._id)) || null;
            row.mySubmission = mine;
            row.canSubmit =
                new Date(item.dueDate) >= new Date() && (!mine || mine.status !== "checked");
            return row;
        });

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

// Student: submit (or update before it is checked) an assignment
export const submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!mongoose.isValidObjectId(assignmentId)) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID" });
        }

        const assignment = await Assignment.findById(assignmentId);

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        // Only students with an approved enrollment in a currently ACTIVE course can submit
        const [enrollment, course] = await Promise.all([
            Enrollment.exists({ student: req.user._id, course: assignment.course, status: "approved" }),
            Course.findOne({ _id: assignment.course, status: "active" }),
        ]);

        if (!enrollment || !course) {
            return res.status(403).json({
                success: false,
                message: "You can submit only for courses where your enrollment is approved and active",
            });
        }

        if (new Date(assignment.dueDate) < new Date()) {
            return res.status(400).json({ success: false, message: "The due date has passed" });
        }

        const answer = String(req.body.answer ?? "").trim();
        const link = String(req.body.link ?? "").trim();

        if (!answer && !link) {
            return res.status(400).json({ success: false, message: "Write your answer or add a link to your work" });
        }

        if (link && !/^https?:\/\/\S+$/i.test(link)) {
            return res.status(400).json({ success: false, message: "The link must start with http:// or https://" });
        }

        const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });

        if (existing?.status === "checked") {
            return res.status(409).json({ success: false, message: "This submission is already checked" });
        }

        const submission = await Submission.findOneAndUpdate(
            { assignment: assignment._id, student: req.user._id },
            {
                $set: { answer, link, submittedAt: new Date(), status: "submitted" },
                $setOnInsert: { course: assignment.course },
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(existing ? 200 : 201).json({
            success: true,
            message: existing ? "Submission updated" : "Assignment submitted",
            submission,
        });
    } catch (error) {
        console.error("Submit Assignment Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit assignment" });
    }
};

// Teacher: every approved student of the course with their submission
export const getAssignmentSubmissions = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        if (!mongoose.isValidObjectId(assignmentId)) {
            return res.status(400).json({ success: false, message: "Invalid assignment ID" });
        }

        const assignment = await populateAssignment(
            Assignment.findOne({ _id: assignmentId, teacher: req.user._id })
        );

        if (!assignment) {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        const [enrollments, submissions] = await Promise.all([
            Enrollment.find({ course: assignment.course._id, status: "approved" })
                .populate("student", "name email photoURL universityId")
                .sort({ createdAt: 1 }),
            Submission.find({ assignment: assignment._id }),
        ]);

        const submissionMap = new Map(submissions.map((item) => [String(item.student), item]));

        const rows = enrollments
            .filter((item) => item.student)
            .map((item) => ({
                student: item.student,
                submission: submissionMap.get(String(item.student._id)) || null,
            }));

        return res.status(200).json({ success: true, assignment, rows });
    } catch (error) {
        console.error("Get Submissions Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch submissions" });
    }
};

// Teacher: check a submission and give marks
export const markSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;

        if (!mongoose.isValidObjectId(submissionId)) {
            return res.status(400).json({ success: false, message: "Invalid submission ID" });
        }

        const submission = await Submission.findById(submissionId);

        if (!submission) {
            return res.status(404).json({ success: false, message: "Submission not found" });
        }

        // Only the teacher who owns this assignment can give marks
        const assignment = await Assignment.findOne({ _id: submission.assignment, teacher: req.user._id });

        if (!assignment) {
            return res.status(403).json({ success: false, message: "Only the course teacher can mark this submission" });
        }

        const marks = Number(req.body.marks);

        if (req.body.marks === "" || req.body.marks === null || !Number.isFinite(marks) || marks < 0 || marks > assignment.totalMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks must be between 0 and ${assignment.totalMarks}`,
            });
        }

        submission.marks = marks;
        submission.feedback = String(req.body.feedback ?? "").trim().slice(0, 1000);
        submission.status = "checked";
        submission.checkedBy = req.user._id;
        submission.checkedAt = new Date();
        await submission.save();

        return res.status(200).json({ success: true, message: "Marks saved", submission });
    } catch (error) {
        console.error("Mark Submission Error:", error);
        return res.status(500).json({ success: false, message: "Failed to save marks" });
    }
};
