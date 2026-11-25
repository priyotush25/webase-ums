import mongoose from "mongoose";

import Admission, { ADMISSION_STATUSES } from "../models/Admission.js";
import Department from "../models/Department.js";
import { nextSequence } from "../models/Counter.js";

const clean = (value) => String(value ?? "").trim();

// Public: submit an application
export const submitApplication = async (req, res) => {
    try {
        const b = req.body;

        const data = {
            name: clean(b.name),
            email: clean(b.email).toLowerCase(),
            phone: clean(b.phone),
            dob: new Date(b.dob),
            gender: clean(b.gender),
            address: clean(b.address),
            department: b.department,
            program: clean(b.program) || "Bachelor",
            sscGpa: Number(b.sscGpa),
            hscGpa: Number(b.hscGpa),
            passingYear: Number(b.passingYear),
            guardianName: clean(b.guardianName),
            guardianPhone: clean(b.guardianPhone),
            statement: clean(b.statement),
        };

        if (data.name.length < 3) return res.status(400).json({ success: false, message: "Enter your full name" });
        if (!/^\S+@\S+\.\S+$/.test(data.email)) return res.status(400).json({ success: false, message: "Enter a valid email address" });
        if (!/^[0-9+\-\s]{7,20}$/.test(data.phone)) return res.status(400).json({ success: false, message: "Enter a valid phone number" });
        if (Number.isNaN(data.dob.getTime()) || data.dob > new Date()) return res.status(400).json({ success: false, message: "Enter a valid date of birth" });
        if (!["male", "female", "other"].includes(data.gender)) return res.status(400).json({ success: false, message: "Select your gender" });
        if (data.address.length < 5) return res.status(400).json({ success: false, message: "Enter your address" });
        if (!["Bachelor", "Masters"].includes(data.program)) return res.status(400).json({ success: false, message: "Select a program level" });

        for (const field of ["sscGpa", "hscGpa"]) {
            if (!Number.isFinite(data[field]) || data[field] < 1 || data[field] > 5) {
                return res.status(400).json({ success: false, message: "GPA must be between 1.00 and 5.00" });
            }
        }

        if (!Number.isInteger(data.passingYear) || data.passingYear < 1990 || data.passingYear > new Date().getFullYear() + 1) {
            return res.status(400).json({ success: false, message: "Enter a valid passing year" });
        }

        if (data.guardianName.length < 3 || !/^[0-9+\-\s]{7,20}$/.test(data.guardianPhone)) {
            return res.status(400).json({ success: false, message: "Guardian name and phone are required" });
        }

        if (!mongoose.isValidObjectId(data.department) || !(await Department.exists({ _id: data.department, status: "active" }))) {
            return res.status(400).json({ success: false, message: "Select a department" });
        }

        const open = await Admission.exists({
            email: data.email,
            department: data.department,
            status: { $in: ["pending", "under_review", "waitlisted"] },
        });

        if (open) {
            return res.status(409).json({
                success: false,
                message: "You already have an open application for this department. Use Track application to see its status.",
            });
        }

        const year = new Date().getFullYear();
        const seq = await nextSequence(`admission-${year}`);
        const applicationNo = `APP-${year}-${String(seq).padStart(4, "0")}`;

        const admission = await Admission.create({ ...data, applicationNo });

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            applicationNo: admission.applicationNo,
        });
    } catch (error) {
        console.error("Submit Application Error:", error);
        return res.status(500).json({ success: false, message: "Failed to submit application" });
    }
};

// Public: check application status (needs application number + email)
export const trackApplication = async (req, res) => {
    try {
        const applicationNo = clean(req.query.applicationNo).toUpperCase();
        const email = clean(req.query.email).toLowerCase();

        const admission = await Admission.findOne({ applicationNo, email }).populate("department", "name code");

        if (!admission) {
            return res.status(404).json({
                success: false,
                message: "No application found. Check the application number and email.",
            });
        }

        return res.status(200).json({
            success: true,
            application: {
                applicationNo: admission.applicationNo,
                name: admission.name,
                department: admission.department,
                program: admission.program,
                status: admission.status,
                note: admission.adminNote,
                submittedAt: admission.createdAt,
                reviewedAt: admission.reviewedAt,
            },
        });
    } catch (error) {
        console.error("Track Application Error:", error);
        return res.status(500).json({ success: false, message: "Failed to look up application" });
    }
};

// Admin: list with search, status filter and paging
export const getApplications = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

        const filter = {};

        if (ADMISSION_STATUSES.includes(req.query.status)) filter.status = req.query.status;

        if (req.query.search?.trim()) {
            const rx = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$or = [{ name: rx }, { email: rx }, { applicationNo: rx }, { phone: rx }];
        }

        const [applications, total, counts] = await Promise.all([
            Admission.find(filter)
                .populate("department", "name code")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Admission.countDocuments(filter),
            Admission.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        ]);

        return res.status(200).json({
            success: true,
            applications,
            counts: Object.fromEntries(counts.map((item) => [item._id, item.count])),
            pagination: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total },
        });
    } catch (error) {
        console.error("Get Applications Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch applications" });
    }
};

// Admin: decide on an application
export const reviewApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status, note } = req.body;

        if (!mongoose.isValidObjectId(applicationId)) {
            return res.status(400).json({ success: false, message: "Invalid application ID" });
        }

        if (!ADMISSION_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const admission = await Admission.findByIdAndUpdate(
            applicationId,
            {
                $set: {
                    status,
                    adminNote: clean(note),
                    reviewedBy: req.user._id,
                    reviewedAt: new Date(),
                },
            },
            { new: true }
        ).populate("department", "name code");

        if (!admission) return res.status(404).json({ success: false, message: "Application not found" });

        return res.status(200).json({ success: true, message: "Application updated", application: admission });
    } catch (error) {
        console.error("Review Application Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update application" });
    }
};
