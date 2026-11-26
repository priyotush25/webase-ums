
import mongoose from "mongoose";
import Admission from "../models/Admission.js";
import Assignment from "../models/Assignment.js";
import Attendance from "../models/Attendance.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Fee from "../models/Fee.js";
import Result from "../models/Result.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { revokeAllSessions } from "../utils/authSession.js";
import { getFirebaseAuth } from "../utils/firebaseAdmin.js";

// ========================================
// GET ALL USERS
// ========================================

export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const search = req.query.search?.trim() || "";
        const role = req.query.role || "all";

        const skip = (page - 1) * limit;

        // Search Filter
        const filter = {};

        if (search) {
            const escapedSearch = search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } },
                { universityId: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        // Role Filter
        if (["student", "teacher", "admin"].includes(role)) {
            filter.role = role;
        }

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .select("-__v -firebaseUid")
                .populate("department", "name code")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),

            User.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    limit,
                },
            },
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};


// ========================================
// GET SINGLE USER
// ========================================

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const user = await User.findById(userId).select("-__v");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user,
        });

    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
};


// ========================================
// UPDATE USER ROLE
// ========================================

export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID",
            });
        }

        const allowedRoles = ["student", "teacher", "admin"];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role",
            });
        }

        // Prevent admin from changing their own role
        if (req.user._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot change your own role",
            });
        }

        const user = await User.findById(userId);

        if (user) {
            user.role = role;
            // IDs belong to a role: clear a stale one so the hook issues the right prefix
            const prefix = role === "student" ? "S" : role === "teacher" ? "T" : null;
            if (user.universityId && (!prefix || !user.universityId.startsWith(prefix))) {
                user.universityId = undefined;
            }
            await user.save();
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: user,
        });

    } catch (error) {
        console.error("Update User Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role",
        });
    }
};


// ========================================
// GET USER STATISTICS
// ========================================

export const getUserStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalStudents,
            totalTeachers,
            totalAdmins,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: "student" }),
            User.countDocuments({ role: "teacher" }),
            User.countDocuments({ role: "admin" }),
        ]);

        res.status(200).json({
            success: true,
            message: "User statistics fetched successfully",
            data: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalAdmins,
            },
        });

    } catch (error) {
        console.error("Get User Stats Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user statistics",
        });
    }
};


// ========================================
// ACTIVATE / DEACTIVATE USER
// ========================================

export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({ success: false, message: "isActive must be true or false" });
        }

        if (req.user._id.toString() === userId) {
            return res.status(403).json({ success: false, message: "You cannot deactivate your own account" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { isActive } },
            { new: true }
        ).select("-__v -firebaseUid");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Deactivated users are signed out of every device immediately
        if (!isActive) await revokeAllSessions(user._id);

        res.status(200).json({
            success: true,
            message: isActive ? "User activated" : "User deactivated",
            data: user,
        });
    } catch (error) {
        console.error("Update User Status Error:", error);
        res.status(500).json({ success: false, message: "Failed to update user status" });
    }
};


// ========================================
// DELETE USER
// ========================================

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        if (req.user._id.toString() === userId) {
            return res.status(403).json({ success: false, message: "You cannot delete your own account" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.role === "admin") {
            const admins = await User.countDocuments({ role: "admin" });

            if (admins <= 1) {
                return res.status(403).json({ success: false, message: "The last administrator cannot be deleted" });
            }
        }

        // A teacher who authored records cannot be removed without breaking
        // those records: ask the admin to deactivate the account instead.
        if (user.role === "teacher") {
            const [assignments, results, attendance] = await Promise.all([
                Assignment.countDocuments({ teacher: user._id }),
                Result.countDocuments({ teacher: user._id }),
                Attendance.countDocuments({ teacher: user._id }),
            ]);

            if (assignments + results + attendance > 0) {
                return res.status(409).json({
                    success: false,
                    message: "This teacher has assignments, results or attendance on record. Deactivate the account instead of deleting it.",
                });
            }

            await Course.updateMany({ teacher: user._id }, { $set: { teacher: null } });
        }

        // Student data belongs to the student: remove it together with the account
        if (user.role === "student") {
            await Promise.all([
                Enrollment.deleteMany({ student: user._id }),
                Attendance.deleteMany({ student: user._id }),
                Result.deleteMany({ student: user._id }),
                Submission.deleteMany({ student: user._id }),
                Fee.deleteMany({ student: user._id }),
            ]);
        }

        await revokeAllSessions(user._id);
        await Admission.updateMany({ user: user._id }, { $set: { user: null } });
        await User.deleteOne({ _id: user._id });

        // Remove the login too (best effort: the database record is already gone)
        try {
            if (user.firebaseUid) await getFirebaseAuth().deleteUser(user.firebaseUid);
        } catch (firebaseError) {
            console.warn("Firebase user delete skipped:", firebaseError.message);
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: { _id: user._id },
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};
