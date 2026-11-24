import mongoose from "mongoose";

import Notice from "../models/Notice.js";

const AUDIENCES = ["all", "student", "teacher"];
const PRIORITIES = ["normal", "important", "urgent"];

const validate = (body, partial = false) => {
    const data = {};

    if (!partial || body.title !== undefined) {
        const title = String(body.title ?? "").trim();
        if (title.length < 3) return { error: "Title must be at least 3 characters" };
        data.title = title;
    }

    if (!partial || body.body !== undefined) {
        const text = String(body.body ?? "").trim();
        if (text.length < 5) return { error: "Notice body must be at least 5 characters" };
        data.body = text;
    }

    if (body.audience !== undefined) {
        if (!AUDIENCES.includes(body.audience)) return { error: "Invalid audience" };
        data.audience = body.audience;
    }

    if (body.priority !== undefined) {
        if (!PRIORITIES.includes(body.priority)) return { error: "Invalid priority" };
        data.priority = body.priority;
    }

    if (body.pinned !== undefined) data.pinned = Boolean(body.pinned);

    return { data };
};

// All roles: notices visible to the logged-in user
export const getNotices = async (req, res) => {
    try {
        const { role } = req.user;
        const limit = Math.min(Number(req.query.limit) || 50, 100);

        const filter =
            role === "admin"
                ? {}
                : { audience: { $in: ["all", role] } };

        const notices = await Notice.find(filter)
            .populate("author", "name")
            .sort({ pinned: -1, createdAt: -1 })
            .limit(limit);

        return res.status(200).json({
            success: true,
            total: notices.length,
            notices,
        });
    } catch (error) {
        console.error("Get Notices Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch notices" });
    }
};

export const createNotice = async (req, res) => {
    try {
        const { data, error } = validate(req.body);

        if (error) return res.status(400).json({ success: false, message: error });

        const notice = await Notice.create({ ...data, author: req.user._id });

        return res.status(201).json({
            success: true,
            message: "Notice published successfully",
            notice,
        });
    } catch (error) {
        console.error("Create Notice Error:", error);
        return res.status(500).json({ success: false, message: "Failed to create notice" });
    }
};

export const updateNotice = async (req, res) => {
    try {
        const { noticeId } = req.params;

        if (!mongoose.isValidObjectId(noticeId)) {
            return res.status(400).json({ success: false, message: "Invalid notice ID" });
        }

        const { data, error } = validate(req.body, true);

        if (error) return res.status(400).json({ success: false, message: error });

        const notice = await Notice.findByIdAndUpdate(
            noticeId,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        return res.status(200).json({ success: true, message: "Notice updated", notice });
    } catch (error) {
        console.error("Update Notice Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update notice" });
    }
};

export const deleteNotice = async (req, res) => {
    try {
        const { noticeId } = req.params;

        if (!mongoose.isValidObjectId(noticeId)) {
            return res.status(400).json({ success: false, message: "Invalid notice ID" });
        }

        const notice = await Notice.findByIdAndDelete(noticeId);

        if (!notice) {
            return res.status(404).json({ success: false, message: "Notice not found" });
        }

        return res.status(200).json({ success: true, message: "Notice deleted" });
    } catch (error) {
        console.error("Delete Notice Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete notice" });
    }
};
