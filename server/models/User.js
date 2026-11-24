
import mongoose from "mongoose";

import Admission from "./Admission.js";
import { nextSequence } from "./Counter.js";

const userSchema = new mongoose.Schema(
    {
        // Firebase UID
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },

        // User Name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // User Email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // User Role
        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student",
            required: true,
        },

        // ImgBB Image URL
        photoURL: {
            type: String,
            default: "",
        },

        // Student ID (e.g. S26-0001) or employee ID (e.g. T-0001)
        universityId: { type: String, unique: true, sparse: true },

        phone: { type: String, trim: true, default: "" },
        dob: { type: Date, default: null },
        gender: { type: String, enum: ["", "male", "female", "other"], default: "" },
        address: { type: String, trim: true, default: "" },
        bio: { type: String, trim: true, default: "", maxlength: 600 },

        guardianName: { type: String, trim: true, default: "" },
        guardianPhone: { type: String, trim: true, default: "" },

        // Academic information (managed by admin)
        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
        program: { type: String, trim: true, default: "" },
        semester: { type: String, trim: true, default: "" },
        batch: { type: String, trim: true, default: "" },
        designation: { type: String, trim: true, default: "" },
    },
    {
        timestamps: true,
    }
);

// Generates the next university ID for a user (students and teachers only)
export const generateUniversityId = async (role) => {
    if (role === "student") {
        const year = String(new Date().getFullYear()).slice(2);
        const seq = await nextSequence(`student-${year}`);
        return `S${year}-${String(seq).padStart(4, "0")}`;
    }

    if (role === "teacher") {
        const seq = await nextSequence("teacher");
        return `T-${String(seq).padStart(4, "0")}`;
    }

    return undefined;
};

// New accounts get an ID, and inherit department from an approved admission
userSchema.pre("save", async function () {
    if (!this.universityId && ["student", "teacher"].includes(this.role)) {
        this.universityId = await generateUniversityId(this.role);
    }

    if (this.isNew && this.role === "student") {
        const admission = await Admission.findOne({
            email: this.email,
            status: "approved",
        }).sort({ createdAt: -1 });

        if (admission) {
            this.department = admission.department;
            this.program = admission.program;
            this.semester = this.semester || "1st Semester";
            this.batch = this.batch || String(new Date().getFullYear());
            this.phone = this.phone || admission.phone;
            this.dob = this.dob || admission.dob;
            this.gender = this.gender || admission.gender;
            this.address = this.address || admission.address;
            this.guardianName = this.guardianName || admission.guardianName;
            this.guardianPhone = this.guardianPhone || admission.guardianPhone;
        }
    }
});

// Existing users (created before IDs existed) get one on server start or role change
export const backfillUniversityIds = async () => {
    const users = await mongoose
        .model("User")
        .find({ role: { $in: ["student", "teacher"] }, universityId: { $exists: false } })
        .sort({ createdAt: 1 });

    for (const user of users) {
        user.universityId = await generateUniversityId(user.role);
        await user.save();
    }

    return users.length;
};

const User = mongoose.model("User", userSchema);

export default User;
