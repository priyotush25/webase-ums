import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: [true, "Assignment title is required"],
            trim: true,
            maxlength: 160,
        },

        description: {
            type: String,
            trim: true,
            default: "",
            maxlength: 5000,
        },

        totalMarks: {
            type: Number,
            default: 10,
            min: 1,
            max: 1000,
        },

        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
    },
    { timestamps: true }
);

assignmentSchema.index({ course: 1, dueDate: -1 });

export default mongoose.model("Assignment", assignmentSchema);
