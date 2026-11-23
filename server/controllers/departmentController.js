
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Department from "../models/Department.js";

// ========================================
// CREATE DEPARTMENT
// ========================================

export const createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name?.trim() || !code?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name and code are required",
            });
        }

        const department = await Department.create({
            name,
            code,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Department name or code already exists",
            });
        }

        console.error("Create Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create department",
        });
    }
};


// ========================================
// GET ALL DEPARTMENTS
// ========================================

export const getAllDepartments = async (req, res) => {
    try {
        const { search = "", status = "all" } = req.query;

        const filter = {};

        if (search.trim()) {
            const escapedSearch = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: escapedSearch, $options: "i" } },
                { code: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        if (["active", "inactive"].includes(status)) {
            filter.status = status;
        }

        const departments = await Department.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        const departmentIds = departments.map((item) => item._id);

        const courseCounts = await Course.aggregate([
            {
                $match: {
                    department: { $in: departmentIds },
                },
            },
            {
                $group: {
                    _id: "$department",
                    total: { $sum: 1 },
                },
            },
        ]);

        const countMap = new Map(
            courseCounts.map((item) => [
                item._id.toString(),
                item.total,
            ])
        );

        const result = departments.map((department) => ({
            ...department,
            courseCount: countMap.get(department._id.toString()) || 0,
        }));

        res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            data: result,
        });

    } catch (error) {
        console.error("Get Departments Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch departments",
        });
    }
};


// ========================================
// GET SINGLE DEPARTMENT
// ========================================

export const getDepartmentById = async (req, res) => {
    try {
        const { departmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        const department = await Department.findById(departmentId);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        res.status(200).json({
            success: true,
            data: department,
        });

    } catch (error) {
        console.error("Get Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch department",
        });
    }
};


// ========================================
// UPDATE DEPARTMENT
// ========================================

export const updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { name, code, description, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name cannot be empty",
            });
        }

        if (code !== undefined && !code.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department code cannot be empty",
            });
        }

        const department = await Department.findByIdAndUpdate(
            departmentId,
            {
                ...(name !== undefined && { name }),
                ...(code !== undefined && { code }),
                ...(description !== undefined && { description }),
                ...(status !== undefined && { status }),
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: department,
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Department name or code already exists",
            });
        }

        console.error("Update Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update department",
        });
    }
};


// ========================================
// DELETE DEPARTMENT
// ========================================

export const deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(departmentId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID",
            });
        }

        const department = await Department.findById(departmentId);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        const existingCourses = await Course.exists({
            department: departmentId,
        });

        if (existingCourses) {
            return res.status(409).json({
                success: false,
                message: "Cannot delete department. Remove or reassign its courses first.",
            });
        }

        await Department.findByIdAndDelete(departmentId);

        res.status(200).json({
            success: true,
            message: "Department deleted successfully",
        });

    } catch (error) {
        console.error("Delete Department Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete department",
        });
    }
};
