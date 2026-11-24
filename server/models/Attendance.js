
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["present", "absent", "late", "excused"],
            required: true,
            default: "present"
        },

        remarks: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// One student can have only one attendance per course per day
attendanceSchema.index(
    { course: 1, student: 1, date: 1 },
    { unique: true }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;
