import mongoose from "mongoose";

const feeSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true, maxlength: 160 },
        amount: { type: Number, required: true, min: 1 },
        dueDate: { type: Date, required: true },
        status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
        paidAt: { type: Date, default: null },
        method: { type: String, enum: ["", "cash", "bkash", "nagad", "bank"], default: "" },
        reference: { type: String, trim: true, default: "" },
        recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

feeSchema.index({ student: 1, status: 1 });

export default mongoose.model("Fee", feeSchema);
