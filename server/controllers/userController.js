
import mongoose from "mongoose";
import User from "../models/User.js";

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
