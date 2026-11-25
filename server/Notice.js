import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Notice title is required"],
            trim: true,
            maxlength: 160,
        },

        body: {
            type: String,
            required: [true, "Notice body is required"],
            trim: true,
            maxlength: 5000,
        },

        // Who can see this notice
        audience: {
            type: String,
            enum: ["all", "student", "teacher"],
            default: "all",
        },

        priority: {
            type: String,
            enum: ["normal", "important", "urgent"],
            default: "normal",
        },

        pinned: {
            type: Boolean,
            default: false,
        },

        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

noticeSchema.index({ pinned: -1, createdAt: -1 });

export default mongoose.model("Notice", noticeSchema);
