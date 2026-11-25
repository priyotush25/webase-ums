import mongoose from "mongoose";

import User from "../models/User.js";
import uploadToImgBB from "../utils/uploadToImgBB.js";

const PROFILE_SELECT = "-__v -firebaseUid";

// Own profile with department details
export const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select(PROFILE_SELECT)
            .populate("department", "name code");

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load profile" });
    }
};

// What each role may edit on their own profile.
// Everything else (name, date of birth, gender, guardian name, department,
// semester...) is recorded at admission and changed by the admin only.
const EDITABLE_FIELDS = {
    student: ["phone", "address", "guardianPhone"],
    teacher: ["phone", "address", "bio"],
    admin: ["phone", "address", "bio", "guardianName", "guardianPhone"],
};

// Own profile: limited contact details and photo (the rest is admin-managed)
export const updateMyProfile = async (req, res) => {
    try {
        const update = {};
        const role = req.user.role;
        const editable = EDITABLE_FIELDS[role] || [];
        const isAdmin = role === "admin";

        if (isAdmin && req.body.name !== undefined) {
            const name = String(req.body.name).trim();
            if (name.length < 2) {
                return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
            }
            update.name = name;
        }

        for (const field of editable) {
            if (req.body[field] !== undefined) update[field] = String(req.body[field]).trim();
        }

        if (update.phone && !/^[0-9+\-\s]{7,20}$/.test(update.phone)) {
            return res.status(400).json({ success: false, message: "Enter a valid phone number" });
        }

        if (isAdmin && req.body.gender !== undefined) {
            if (!["", "male", "female", "other"].includes(req.body.gender)) {
                return res.status(400).json({ success: false, message: "Invalid gender" });
            }
            update.gender = req.body.gender;
        }

        if (isAdmin && req.body.dob !== undefined) {
            if (req.body.dob === "") update.dob = null;
            else {
                const dob = new Date(req.body.dob);
                if (Number.isNaN(dob.getTime()) || dob > new Date()) {
                    return res.status(400).json({ success: false, message: "Enter a valid date of birth" });
                }
                update.dob = dob;
            }
        }

        if (req.file) update.photoURL = await uploadToImgBB(req.file);

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ success: false, message: "Nothing to update" });
        }

        const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true, runValidators: true })
            .select(PROFILE_SELECT)
            .populate("department", "name code");

        return res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
    }
};

// Admin: set department, semester, batch, designation
export const updateAcademicRecord = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const update = {};

        if (req.body.department !== undefined) {
            if (req.body.department === "" || req.body.department === null) update.department = null;
            else if (mongoose.isValidObjectId(req.body.department)) update.department = req.body.department;
            else return res.status(400).json({ success: false, message: "Invalid department" });
        }

        for (const field of ["program", "semester", "batch", "designation"]) {
            if (req.body[field] !== undefined) update[field] = String(req.body[field]).trim();
        }

        const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true })
            .select(PROFILE_SELECT)
            .populate("department", "name code");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        return res.status(200).json({ success: true, message: "Academic record updated", user });
    } catch (error) {
        console.error("Update Academic Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update academic record" });
    }
};
