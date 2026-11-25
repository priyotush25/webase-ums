import mongoose from "mongoose";

import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Routine, { DAYS } from "../models/Routine.js";

const populate = (query) =>
    query.populate({
        path: "course",
        select: "title code semester teacher",
        populate: { path: "teacher", select: "name" },
    });

const toMinutes = (value) => {
    const [h, m] = value.split(":").map(Number);
    return h * 60 + m;
};

const overlaps = (a, b) =>
    toMinutes(a.startTime) < toMinutes(b.endTime) &&
    toMinutes(b.startTime) < toMinutes(a.endTime);

// Checks room and teacher clashes on the same day
const findConflict = async (data, ignoreId = null) => {
    const course = await Course.findById(data.course).select("teacher");

    const sameDay = await Routine.find({
        day: data.day,
        ...(ignoreId ? { _id: { $ne: ignoreId } } : {}),
    }).populate("course", "teacher code");

    for (const item of sameDay) {
        if (!overlaps(data, item)) continue;

        if (item.room.toLowerCase() === data.room.toLowerCase()) {
            return `Room ${item.room} is already used by ${item.course?.code} at that time`;
        }

        if (
            course?.teacher &&
            item.course?.teacher &&
            String(course.teacher) === String(item.course.teacher)
        ) {
            return "This teacher already has a class at that time";
        }
    }

    return null;
};

const parse = (body, partial = false) => {
    const data = {};

    for (const key of ["course", "day", "startTime", "endTime", "room"]) {
        if (body[key] !== undefined) data[key] = String(body[key]).trim();
        else if (!partial) return { error: `${key} is required` };
    }

    if (data.course && !mongoose.isValidObjectId(data.course)) return { error: "Invalid course" };
    if (data.day && !DAYS.includes(data.day)) return { error: "Invalid day" };

    return { data };
};

// Student / Teacher: weekly routine
export const getMyRoutine = async (req, res) => {
    try {
        let courseIds;

        if (req.user.role === "teacher") {
            courseIds = (await Course.find({ teacher: req.user._id }).select("_id")).map((c) => c._id);
        } else {
            courseIds = (
                await Enrollment.find({ student: req.user._id, status: "approved" }).select("course")
            ).map((e) => e.course);
        }

        const routines = await populate(
            Routine.find({ course: { $in: courseIds } }).sort({ startTime: 1 })
        );

        return res.status(200).json({ success: true, total: routines.length, routines });
    } catch (error) {
        console.error("Get Routine Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch routine" });
    }
};

export const getAllRoutines = async (req, res) => {
    try {
        const routines = await populate(Routine.find().sort({ startTime: 1 }));
        return res.status(200).json({ success: true, total: routines.length, routines });
    } catch (error) {
        console.error("Get All Routines Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch routines" });
    }
};

export const createRoutine = async (req, res) => {
    try {
        const { data, error } = parse(req.body);
        if (error) return res.status(400).json({ success: false, message: error });

        if (toMinutes(data.endTime) <= toMinutes(data.startTime)) {
            return res.status(400).json({ success: false, message: "End time must be after start time" });
        }

        if (!(await Course.exists({ _id: data.course }))) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        const conflict = await findConflict(data);
        if (conflict) return res.status(409).json({ success: false, message: conflict });

        const created = await Routine.create(data);
        const routine = await populate(Routine.findById(created._id));

        return res.status(201).json({ success: true, message: "Class added to routine", routine });
    } catch (error) {
        console.error("Create Routine Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add class" });
    }
};

export const updateRoutine = async (req, res) => {
    try {
        const { routineId } = req.params;
        if (!mongoose.isValidObjectId(routineId)) {
            return res.status(400).json({ success: false, message: "Invalid routine ID" });
        }

        const existing = await Routine.findById(routineId);
        if (!existing) return res.status(404).json({ success: false, message: "Class not found" });

        const { data, error } = parse(req.body, true);
        if (error) return res.status(400).json({ success: false, message: error });

        const merged = { ...existing.toObject(), ...data };

        if (toMinutes(merged.endTime) <= toMinutes(merged.startTime)) {
            return res.status(400).json({ success: false, message: "End time must be after start time" });
        }

        const conflict = await findConflict(merged, routineId);
        if (conflict) return res.status(409).json({ success: false, message: conflict });

        Object.assign(existing, data);
        await existing.save();

        const routine = await populate(Routine.findById(routineId));

        return res.status(200).json({ success: true, message: "Class updated", routine });
    } catch (error) {
        console.error("Update Routine Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update class" });
    }
};

export const deleteRoutine = async (req, res) => {
    try {
        const { routineId } = req.params;
        if (!mongoose.isValidObjectId(routineId)) {
            return res.status(400).json({ success: false, message: "Invalid routine ID" });
        }

        const deleted = await Routine.findByIdAndDelete(routineId);
        if (!deleted) return res.status(404).json({ success: false, message: "Class not found" });

        return res.status(200).json({ success: true, message: "Class removed" });
    } catch (error) {
        console.error("Delete Routine Error:", error);
        return res.status(500).json({ success: false, message: "Failed to remove class" });
    }
};
