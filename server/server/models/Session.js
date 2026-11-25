import mongoose from "mongoose";

// One document per logged-in browser/device.
// The refresh secret itself is never stored, only its bcrypt hash.
const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        // Public identifier, also embedded in the access JWT as `sid`
        sessionId: { type: String, required: true, unique: true },

        // bcrypt hash of the refresh secret kept in the httpOnly cookie
        secretHash: { type: String, required: true },

        userAgent: { type: String, default: "" },
        ip: { type: String, default: "" },

        // MongoDB removes expired sessions automatically (TTL index)
        expiresAt: { type: Date, required: true, expires: 0 },
    },
    { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
