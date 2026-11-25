import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

        answer: { type: String, trim: true, default: "", maxlength: 10000 },
        link: { type: String, trim: true, default: "", maxlength: 500 },
        submittedAt: { type: Date, default: Date.now },

        // Filled by the course teacher
        status: { type: String, enum: ["submitted", "checked"], default: "submitted" },
        marks: { type: Number, default: null, min: 0 },
        feedback: { type: String, trim: true, default: "", maxlength: 1000 },
        checkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        checkedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

// One submission per student per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ course: 1, student: 1 });

export default mongoose.model("Submission", submissionSchema);
