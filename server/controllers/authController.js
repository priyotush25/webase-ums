
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
// Signup Controller
export const signup = async (req, res) => {
    try {
        // Firebase verified user information
        const { uid, email, name } = req.firebaseUser;

        // Signup form থেকে Name
        const userName = req.body.name || name;

        // Check required information
        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: "Firebase user information is incomplete",
            });
        }

        if (!userName) {
            return res.status(400).json({
                success: false,
                message: "User name is required",
            });
        }

        // Check existing Firebase UID
        const existingUser = await User.findOne({
            firebaseUid: uid,
        });

        if (existingUser) {
            generateToken(existingUser._id, existingUser.role, res);

            return res.status(200).json({
                success: true,
                message: "User profile already exists",
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    photoURL: existingUser.photoURL,
                },
            });
        }

        // Check duplicate email
        const existingEmail = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered",
            });
        }

        // Create MongoDB user
        const newUser = await User.create({
            firebaseUid: uid,
            name: userName,
            email: email.toLowerCase(),
            role: "student",
            photoURL: "",
        });

        generateToken(newUser._id, newUser.role, res);

        return res.status(201).json({
            success: true,
            message: "User profile created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                photoURL: newUser.photoURL,
            },
        });

    } catch (error) {
        console.error("Signup Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create user profile",
        });
    }
};
