import mongoose from "mongoose";

import Fee from "../models/Fee.js";
import User from "../models/User.js";

const METHODS = ["cash", "bkash", "nagad", "bank"];

// Student: own fees with totals
export const getMyFees = async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.user._id }).sort({ dueDate: -1 });

        const sum = (list) => list.reduce((total, fee) => total + fee.amount, 0);

        const paid = fees.filter((fee) => fee.status === "paid");
        const unpaid = fees.filter((fee) => fee.status === "unpaid");
        const now = new Date();

        return res.status(200).json({
            success: true,
            totalPaid: sum(paid),
            totalDue: sum(unpaid),
            overdueCount: unpaid.filter((fee) => fee.dueDate < now).length,
            fees,
        });
    } catch (error) {
        console.error("Get My Fees Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch fees" });
    }
};

// Admin: all fees (optional ?status=paid|unpaid)
export const getAllFees = async (req, res) => {
    try {
        const filter = {};
        if (["paid", "unpaid"].includes(req.query.status)) filter.status = req.query.status;

        const fees = await Fee.find(filter)
            .populate("student", "name email photoURL")
            .sort({ createdAt: -1 })
            .limit(1000);

        const sum = (status) =>
            fees.filter((fee) => fee.status === status).reduce((total, fee) => total + fee.amount, 0);

        return res.status(200).json({
            success: true,
            total: fees.length,
            collected: sum("paid"),
            outstanding: sum("unpaid"),
            fees,
        });
    } catch (error) {
        console.error("Get All Fees Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch fees" });
    }
};

// Admin: charge one student, or every student when studentId is "all"
export const createFee = async (req, res) => {
    try {
        const { studentId, title, amount, dueDate } = req.body;

        const cleanTitle = String(title ?? "").trim();
        const cleanAmount = Number(amount);
        const due = new Date(dueDate);

        if (cleanTitle.length < 3) {
            return res.status(400).json({ success: false, message: "Fee title must be at least 3 characters" });
        }

        if (!Number.isFinite(cleanAmount) || cleanAmount < 1) {
            return res.status(400).json({ success: false, message: "Amount must be at least 1" });
        }

        if (Number.isNaN(due.getTime())) {
            return res.status(400).json({ success: false, message: "A valid due date is required" });
        }

        let studentIds;

        if (studentId === "all") {
            studentIds = (await User.find({ role: "student" }).select("_id")).map((u) => u._id);
        } else {
            if (!mongoose.isValidObjectId(studentId)) {
                return res.status(400).json({ success: false, message: "Select a valid student" });
            }

            if (!(await User.exists({ _id: studentId, role: "student" }))) {
                return res.status(404).json({ success: false, message: "Student not found" });
            }

            studentIds = [studentId];
        }

        if (studentIds.length === 0) {
            return res.status(400).json({ success: false, message: "There are no students to charge" });
        }

        await Fee.insertMany(
            studentIds.map((student) => ({
                student,
                title: cleanTitle,
                amount: cleanAmount,
                dueDate: due,
            }))
        );

        return res.status(201).json({
            success: true,
            message: `Fee added for ${studentIds.length} student${studentIds.length > 1 ? "s" : ""}`,
            count: studentIds.length,
        });
    } catch (error) {
        console.error("Create Fee Error:", error);
        return res.status(500).json({ success: false, message: "Failed to add fee" });
    }
};

// Admin: record a payment
export const markFeePaid = async (req, res) => {
    try {
        const { feeId } = req.params;
        const { method, reference } = req.body;

        if (!mongoose.isValidObjectId(feeId)) {
            return res.status(400).json({ success: false, message: "Invalid fee ID" });
        }

        if (!METHODS.includes(method)) {
            return res.status(400).json({ success: false, message: "Choose a payment method" });
        }

        const fee = await Fee.findOneAndUpdate(
            { _id: feeId, status: "unpaid" },
            {
                $set: {
                    status: "paid",
                    paidAt: new Date(),
                    method,
                    reference: String(reference ?? "").trim(),
                    recordedBy: req.user._id,
                },
            },
            { new: true }
        );

        if (!fee) {
            return res.status(404).json({ success: false, message: "Unpaid fee not found" });
        }

        return res.status(200).json({ success: true, message: "Payment recorded", fee });
    } catch (error) {
        console.error("Mark Fee Paid Error:", error);
        return res.status(500).json({ success: false, message: "Failed to record payment" });
    }
};

export const deleteFee = async (req, res) => {
    try {
        const { feeId } = req.params;

        if (!mongoose.isValidObjectId(feeId)) {
            return res.status(400).json({ success: false, message: "Invalid fee ID" });
        }

        const fee = await Fee.findByIdAndDelete(feeId);
        if (!fee) return res.status(404).json({ success: false, message: "Fee not found" });

        return res.status(200).json({ success: true, message: "Fee deleted" });
    } catch (error) {
        console.error("Delete Fee Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete fee" });
    }
};
