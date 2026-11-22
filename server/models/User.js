
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

    {
        // Firebase Authentication UID
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },

        // User Full Name
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

        // Profile Picture
        photoURL: {
            type: String,
            default: "",
        },

    },

    {
        timestamps: true,
    }

);

// Create User Model
const User = mongoose.model("User", userSchema);

export default User;
