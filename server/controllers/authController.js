
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import uploadToImgBB from "../utils/uploadToImgBB.js";


// ========================================
// SIGNUP CONTROLLER
// ========================================

export const signup = async (req, res) => {
    try {
        const { uid, email, name } = req.firebaseUser;

        const userName = req.body.name?.trim() || name;

        // Validate Firebase information
        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: "Firebase user information is incomplete."
            });
        }

        // Validate name
        if (!userName || userName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Valid user name is required."
            });
        }

        // Image is required
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Profile image is required."
            });
        }

        const normalizedEmail = email.toLowerCase();

        // Check existing Firebase UID
        const existingUser = await User.findOne({
            firebaseUid: uid
        });

        if (existingUser) {
            generateToken(existingUser._id, existingUser.role, res);

            return res.status(200).json({
                success: true,
                message: "User profile already exists.",
                user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    role: existingUser.role,
                    photoURL: existingUser.photoURL
                }
            });
        }

        // Check existing email
        const existingEmail = await User.findOne({
            email: normalizedEmail
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered."
            });
        }

        // Upload image to ImgBB
        const photoURL = await uploadToImgBB(req.file);

        // Create MongoDB user
        const newUser = await User.create({
            firebaseUid: uid,
            name: userName,
            email: normalizedEmail,
            role: "student",
            photoURL
        });

        // Generate Backend JWT
        generateToken(newUser._id, newUser.role, res);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                photoURL: newUser.photoURL
            }
        });

    } catch (error) {
        console.error("Signup Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create user profile."
        });
    }
};


// ========================================
// LOGIN CONTROLLER
// ========================================

export const login = async (req, res) => {
    try {
        // Firebase verified user information
        const { uid, email, name } = req.firebaseUser;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: "Firebase user information is incomplete",
            });
        }

        const normalizedEmail = email.toLowerCase();

        // Find existing MongoDB user
        let user = await User.findOne({
            firebaseUid: uid,
        });

        // If MongoDB profile does not exist
        // Automatically create a new student profile
        if (!user) {

            // Check duplicate email
            const existingEmail = await User.findOne({
                email: normalizedEmail,
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already linked to another account",
                });
            }

            const userName =
                name?.trim() || normalizedEmail.split("@")[0];

            user = await User.create({
                firebaseUid: uid,
                name: userName,
                email: normalizedEmail,
                role: "student",
                photoURL: "",
            });
        }

        // Generate Backend JWT
        generateToken(user._id, user.role, res);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                photoURL: user.photoURL,
            },
        });

    } catch (error) {
        console.error("Login Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};


// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================

export const getMe = async (req, res) => {
    try {
        // User comes from verifyJWT middleware
        return res.status(200).json({
            success: true,
            message: "Current user fetched successfully",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                photoURL: req.user.photoURL,
            },
        });

    } catch (error) {
        console.error("Get Current User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch current user",
        });
    }
};


// ========================================
// LOGOUT CONTROLLER
// ========================================

export const logout = async (req, res) => {
    try {
        // Clear Backend JWT Cookie
        res.clearCookie("ums_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successful",
        });

    } catch (error) {
        console.error("Logout Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: "Logout failed",
        });
    }
};



// ========================================
// UPDATE USER PROFILE
// ========================================

export const updateUserProfile = async (req, res) => {
    try {

        const { name } = req.body;

        const updateData = {};

        // Validate and update name
        if (name !== undefined) {

            const trimmedName = name.trim();

            if (trimmedName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters."
                });
            }

            updateData.name = trimmedName;
        }

        // Upload new profile image if provided
        if (req.file) {

            const photoURL = await uploadToImgBB(req.file);

            updateData.photoURL = photoURL;
        }

        // Check whether any field was provided
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No profile information provided."
            });
        }

        // Update only the logged-in user's profile
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-__v");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User profile not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                photoURL: updatedUser.photoURL
            }
        });

    } catch (error) {

        console.error("Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update profile."
        });
    }
};
