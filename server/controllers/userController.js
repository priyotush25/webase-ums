
import mongoose from "mongoose";
import User from "../models/User.js";

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(
            100,
            Math.max(1, Number(req.query.limit) || 10)
        );

        const skip = (page - 1) * limit;

        const { search = "", role = "all" } = req.query;

        const filter = {};

        // Search by name or email
        if (search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { email: { $regex: escapedSearch, $options: "i" } }
            ];
        }

        // Filter by role
        if (["student", "teacher", "admin"].includes(role)) {
            filter.role = role;
        }

        const [users, totalUsers] = await Promise.all([
            User.find(filter)
                .select("name email role photoURL createdAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            User.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: {
                users,
                pagination: {
                    currentPage: page,
                    limit,
                    totalUsers,
                    totalPages: Math.ceil(totalUsers / limit)
                }
            }
        });

    } catch (error) {
        console.error("Get All Users Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


// Get Single User
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId)
            .select("name email role photoURL createdAt")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Get User Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};


// Update User Role
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        if (!["student", "teacher", "admin"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role"
            });
        }

        if (req.user._id.toString() === userId) {
            return res.status(403).json({
                success: false,
                message: "You cannot change your own role"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            {
                new: true,
                runValidators: true
            }
        ).select("name email role photoURL createdAt");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update User Role Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};
