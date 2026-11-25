import mongoose from "mongoose";

import Admission, { ADMISSION_STATUSES } from "../models/Admission.js";
import Department from "../models/Department.js";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import { nextSequence } from "../models/Counter.js";

const clean = (value) => String(value ?? "").trim();

// Student: apply for admission from the dashboard (account first, then admission)
export const submitApplication = async (req, res) => {
    try {
        const b = req.body;

        if (req.user.admission) {
            return res.status(409).json({ success: false, message: "Your admission is already approved." });
        }

        const data = {
            name: clean(b.name) || req.user.name,
            // The application always belongs to the signed-in account's email
            email: req.user.email,
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

        // One open application at a time (a rejected one can be re-applied)
        const open = await Admission.exists({
            $or: [{ user: req.user._id }, { email: data.email }],
            status: { $in: ["pending", "under_review", "waitlisted"] },
        });

        if (open) {
            return res.status(409).json({
                success: false,
                message: "You already have an open application. Wait for the admin's decision.",
            });
        }

        const year = new Date().getFullYear();
        const seq = await nextSequence(`admission-${year}`);
        const applicationNo = `APP-${year}-${String(seq).padStart(4, "0")}`;

        const admission = await Admission.create({ ...data, applicationNo, user: req.user._id });

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

// Student: my admission status
export const getMyApplication = async (req, res) => {
    try {
        const applications = await Admission.find({ $or: [{ user: req.user._id }, { email: req.user.email }] })
            .populate("department", "name code")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            admitted: Boolean(req.user.admission && req.user.department),
            application: applications[0] || null,
            history: applications,
        });
    } catch (error) {
        console.error("Get My Application Error:", error);
        return res.status(500).json({ success: false, message: "Failed to load your application" });
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

// Admin: decide on an application.
// Approving admits the student: department, program and 1st semester are set on the account,
// which is what unlocks course viewing and enrollment.
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

        const admission = await Admission.findById(applicationId);

        if (!admission) return res.status(404).json({ success: false, message: "Application not found" });

        const student =
            (admission.user && (await User.findById(admission.user))) ||
            (await User.findOne({ email: admission.email, role: "student" }));

        const wasApproved = admission.status === "approved";

        if (status === "approved" && !wasApproved) {
            if (!(await Department.exists({ _id: admission.department, status: "active" }))) {
                return res.status(409).json({ success: false, message: "The applied department is not active" });
            }

            if (student?.admission && String(student.admission) !== String(admission._id)) {
                return res.status(409).json({ success: false, message: "This student already has an approved admission" });
            }
        }

        if (wasApproved && status !== "approved" && student) {
            const hasEnrollments = await Enrollment.exists({
                student: student._id,
                status: { $in: ["pending", "approved"] },
            });

            if (hasEnrollments) {
                return res.status(409).json({
                    success: false,
                    message: "This student already has enrollments. Reject or drop them before changing an approved admission.",
                });
            }
        }

        admission.status = status;
        admission.adminNote = clean(note);
        admission.reviewedBy = req.user._id;
        admission.reviewedAt = new Date();
        if (student && !admission.user) admission.user = student._id;
        await admission.save();

        if (student) {
            if (status === "approved") {
                student.admission = admission._id;
                student.department = admission.department;
                student.program = admission.program;
                student.semester = student.semester || "1st Semester";
                student.batch = student.batch || String(new Date().getFullYear());
                student.phone = student.phone || admission.phone;
                student.dob = student.dob || admission.dob;
                student.gender = student.gender || admission.gender;
                student.address = student.address || admission.address;
                student.guardianName = student.guardianName || admission.guardianName;
                student.guardianPhone = student.guardianPhone || admission.guardianPhone;
                await student.save();
            } else if (wasApproved) {
                student.admission = null;
                student.department = null;
                student.semester = "";
                student.batch = "";
                student.program = "";
                await student.save();
            }
        }

        await admission.populate("department", "name code");

        return res.status(200).json({ success: true, message: "Application updated", application: admission });
    } catch (error) {
        console.error("Review Application Error:", error);
        return res.status(500).json({ success: false, message: "Failed to update application" });
    }
};
