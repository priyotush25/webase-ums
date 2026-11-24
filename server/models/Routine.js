import mongoose from "mongoose";

export const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const routineSchema = new mongoose.Schema(
    {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        day: { type: String, enum: DAYS, required: true },
        startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
        endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
        room: { type: String, trim: true, required: true, maxlength: 40 },
    },
    { timestamps: true }
);

routineSchema.index({ course: 1, day: 1, startTime: 1 });

export default mongoose.model("Routine", routineSchema);
