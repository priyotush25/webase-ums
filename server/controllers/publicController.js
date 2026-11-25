import Course from "../models/Course.js";
import Department from "../models/Department.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Home page data (no login required)
export const getOverview = async (req, res) => {
    try {
        const [students, teachers, courses, departments, notices, departmentList, faculty] =
            await Promise.all([
                User.countDocuments({ role: "student" }),
                User.countDocuments({ role: "teacher" }),
                Course.countDocuments({ status: "active" }),
                Department.countDocuments({ status: "active" }),
                Notice.find({ audience: "all" })
                    .select("title body priority pinned createdAt")
                    .sort({ pinned: -1, createdAt: -1 })
                    .limit(6),
                Department.find({ status: "active" }).select("name code description").sort({ name: 1 }),
                User.find({ role: "teacher" })
                    .select("name photoURL designation department")
                    .populate("department", "name code")
                    .sort({ createdAt: 1 })
                    .limit(8),
            ]);

        return res.status(200).json({
            success: true,
            stats: { students, teachers, courses, departments },
            notices,
            departments: departmentList,
            faculty,
        });
    } catch (error) {
        console.error("Public Overview Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load overview" });
    }
};

// Departments with course and teacher counts
export const getDepartments = async (req, res) => {
    try {
        const [departments, courseCounts, teacherCounts] = await Promise.all([
            Department.find({ status: "active" }).select("name code description").sort({ name: 1 }),
            Course.aggregate([{ $match: { status: "active" } }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
            User.aggregate([{ $match: { role: "teacher", department: { $ne: null } } }, { $group: { _id: "$department", count: { $sum: 1 } } }]),
        ]);

        const courses = Object.fromEntries(courseCounts.map((item) => [String(item._id), item.count]));
        const teachers = Object.fromEntries(teacherCounts.map((item) => [String(item._id), item.count]));

        return res.status(200).json({
            success: true,
            departments: departments.map((dept) => ({
                ...dept.toObject(),
                courseCount: courses[String(dept._id)] || 0,
                teacherCount: teachers[String(dept._id)] || 0,
            })),
        });
    } catch (error) {
        console.error("Public Departments Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load departments" });
    }
};

// One department: courses grouped by semester + faculty
export const getDepartmentByCode = async (req, res) => {
    try {
        const department = await Department.findOne({
            code: String(req.params.code).toUpperCase(),
            status: "active",
        }).select("name code description");

        if (!department) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }

        const [courses, faculty] = await Promise.all([
            Course.find({ department: department._id, status: "active" })
                .select("title code credit semester description")
                .populate("teacher", "name")
                .sort({ semester: 1, code: 1 }),
            User.find({ role: "teacher", department: department._id })
                .select("name photoURL designation bio")
                .sort({ createdAt: 1 }),
        ]);

        return res.status(200).json({ success: true, department, courses, faculty });
    } catch (error) {
        console.error("Public Department Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load department" });
    }
};

// Faculty directory
export const getFaculty = async (req, res) => {
    try {
        const filter = { role: "teacher" };

        if (req.query.search?.trim()) {
            filter.name = new RegExp(escapeRegex(req.query.search.trim()), "i");
        }

        const faculty = await User.find(filter)
            .select("name photoURL designation bio department")
            .populate("department", "name code")
            .sort({ name: 1 })
            .limit(200);

        return res.status(200).json({ success: true, total: faculty.length, faculty });
    } catch (error) {
        console.error("Public Faculty Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load faculty" });
    }
};

// Public notice board (notices meant for everyone)
export const getPublicNotices = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 10));

        const filter = { audience: "all" };

        if (req.query.search?.trim()) {
            const rx = new RegExp(escapeRegex(req.query.search.trim()), "i");
            filter.$or = [{ title: rx }, { body: rx }];
        }

        const [notices, total] = await Promise.all([
            Notice.find(filter)
                .select("title body priority pinned createdAt")
                .sort({ pinned: -1, createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Notice.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            notices,
            pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total },
        });
    } catch (error) {
        console.error("Public Notices Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load notices" });
    }
};
