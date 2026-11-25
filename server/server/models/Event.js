import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true, maxlength: 160 },
        description: { type: String, trim: true, default: "", maxlength: 2000 },
        type: { type: String, enum: ["academic", "exam", "holiday", "event"], default: "event" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        location: { type: String, trim: true, default: "" },
    },
    { timestamps: true }
);

eventSchema.index({ startDate: 1 });

export default mongoose.model("Event", eventSchema);
