
import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
        },

        code: {
            type: String,
            required: [true, "Course code is required"],
            trim: true,
            uppercase: true,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        credit: {
            type: Number,
            required: [true, "Course credit is required"],
            min: [0.5, "Credit must be at least 0.5"],
            max: [10, "Credit cannot exceed 10"],
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"],
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        semester: {
            type: String,
            required: [true, "Semester is required"],
            trim: true,
        },

        // Maximum number of approved students
        capacity: {
            type: Number,
            default: 60,
            min: [1, "Capacity must be at least 1"],
            max: [500, "Capacity cannot exceed 500"],
        },

        // Students only see subjects the admin has published for their semester
        isPublished: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            // active = running this semester, completed = finished (results published)
            enum: ["active", "inactive", "completed"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
