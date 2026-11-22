
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Firebase UID
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },

        // User Name
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // User Email
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        // User Role
        role: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student",
            required: true,
        },

        // ImgBB Image URL
        photoURL: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);

export default User;
