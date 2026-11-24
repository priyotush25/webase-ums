import Course from "../models/Course.js";
import Department from "../models/Department.js";
import Event from "../models/Event.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";

// Public data for the home page (no login required)
export const getOverview = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [students, teachers, courses, departments, notices, events, departmentList] =
            await Promise.all([
                User.countDocuments({ role: "student" }),
                User.countDocuments({ role: "teacher" }),
                Course.countDocuments({ status: "active" }),
                Department.countDocuments({ status: "active" }),
                Notice.find({ audience: "all" })
                    .select("title body priority pinned createdAt")
                    .sort({ pinned: -1, createdAt: -1 })
                    .limit(4),
                Event.find({
                    $or: [{ endDate: { $gte: today } }, { endDate: null, startDate: { $gte: today } }],
                })
                    .select("title type startDate endDate location")
                    .sort({ startDate: 1 })
                    .limit(4),
                Department.find({ status: "active" }).select("name code description").sort({ name: 1 }),
            ]);

        return res.status(200).json({
            success: true,
            stats: { students, teachers, courses, departments },
            notices,
            events,
            departments: departmentList,
        });
    } catch (error) {
        console.error("Public Overview Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load overview" });
    }
};
