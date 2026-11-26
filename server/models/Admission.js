import mongoose from "mongoose";

export const ADMISSION_STATUSES = ["pending", "under_review", "approved", "waitlisted", "rejected"];

const admissionSchema = new mongoose.Schema(
    {
        applicationNo: { type: String, unique: true, index: true },

        // The student account that applied (admission is applied from the student dashboard)
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        phone: { type: String, required: true, trim: true, maxlength: 20 },
        dob: { type: Date, required: true },
        gender: { type: String, enum: ["male", "female", "other"], required: true },
        address: { type: String, required: true, trim: true, maxlength: 300 },

        department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
        program: { type: String, enum: ["Bachelor", "Masters"], default: "Bachelor" },

        sscGpa: { type: Number, required: true, min: 0, max: 5 },
        hscGpa: { type: Number, required: true, min: 0, max: 5 },
        passingYear: { type: Number, required: true, min: 1990, max: 2100 },

        guardianName: { type: String, required: true, trim: true, maxlength: 120 },
        guardianPhone: { type: String, required: true, trim: true, maxlength: 20 },

        statement: { type: String, trim: true, default: "", maxlength: 1500 },

        status: { type: String, enum: ADMISSION_STATUSES, default: "pending" },
        adminNote: { type: String, trim: true, default: "" },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        reviewedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("Admission", admissionSchema);
