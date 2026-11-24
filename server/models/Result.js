import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Marks distribution: assignment 20 + midterm 30 + final 50 = 100
        assignment: { type: Number, min: 0, max: 20, default: 0 },
        midterm: { type: Number, min: 0, max: 30, default: 0 },
        final: { type: Number, min: 0, max: 50, default: 0 },

        total: { type: Number, default: 0 },
        letterGrade: { type: String, default: "F" },
        gradePoint: { type: Number, default: 0 },

        remarks: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

resultSchema.index({ course: 1, student: 1 }, { unique: true });

export default mongoose.model("Result", resultSchema);
