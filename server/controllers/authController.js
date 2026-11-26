import User from "../models/User.js";
import {
    clearAuthCookies,
    createSession,
    revokeAllSessions,
    revokeSessionFromRequest,
} from "../utils/authSession.js";
import uploadToImgBB from "../utils/uploadToImgBB.js";

const publicUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    photoURL: user.photoURL,
    universityId: user.universityId,
    // Students unlock courses and enrollment only after the admin approves the admission
    admissionApproved: user.role !== "student" || Boolean(user.admission && user.department),
});

const deactivated = (res) =>
    res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact the administrator.",
    });

// ========================================
// SIGNUP  (Firebase account already created by the client)
// ========================================

export const signup = async (req, res) => {
    try {
        const { uid, email, name } = req.firebaseUser;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: "Firebase user information is incomplete.",
            });
        }

        const userName = req.body?.name?.trim() || name?.trim();

        if (!userName || userName.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Valid user name is required.",
            });
        }

        const normalizedEmail = email.toLowerCase();

        // Profile already exists for this Firebase account: just sign in
        const existingUser = await User.findOne({ firebaseUid: uid });

        if (existingUser) {
            if (existingUser.isActive === false) return deactivated(res);

            await createSession(existingUser, req, res);

            return res.status(200).json({
                success: true,
                message: "User profile already exists.",
                user: publicUser(existingUser),
            });
        }

        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered.",
            });
        }

        // Profile photo is optional: a failed upload must not block registration
        let photoURL = "";
        let warning;

        if (req.file) {
            try {
                photoURL = await uploadToImgBB(req.file);
            } catch (uploadError) {
                console.error("Signup photo upload failed:", uploadError.message);
                warning = "Account created, but the profile photo could not be uploaded. You can add it from your profile.";
            }
        }

        const newUser = await User.create({
            firebaseUid: uid,
            name: userName,
            email: normalizedEmail,
            role: "student",
            photoURL,
        });

        await createSession(newUser, req, res);

        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            warning,
            user: publicUser(newUser),
        });
    } catch (error) {
        console.error("Signup Controller Error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "This email is already registered.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to create user profile.",
        });
    }
};

// ========================================
// LOGIN  (Firebase ID token -> JWT + refresh session cookies)
// ========================================

export const login = async (req, res) => {
    try {
        const { uid, email, name } = req.firebaseUser;

        if (!uid || !email) {
            return res.status(400).json({
                success: false,
                message: "Firebase user information is incomplete.",
            });
        }

        const normalizedEmail = email.toLowerCase();

        let user = await User.findOne({ firebaseUid: uid });

        // Firebase account without a MongoDB profile: create a student profile
        if (!user) {
            if (await User.exists({ email: normalizedEmail })) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already linked to another account.",
                });
            }

            user = await User.create({
                firebaseUid: uid,
                name: name?.trim() || normalizedEmail.split("@")[0],
                email: normalizedEmail,
                role: "student",
                photoURL: "",
            });
        }

        if (user.isActive === false) return deactivated(res);

        await createSession(user, req, res);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: publicUser(user),
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
// CURRENT USER  (verifyJWT has already refreshed the token if needed)
// ========================================

export const getMe = (req, res) =>
    res.status(200).json({
        success: true,
        message: "Current user fetched successfully",
        user: publicUser(req.user),
    });

// ========================================
// LOGOUT  (revokes this device's session on the server)
// ========================================

export const logout = async (req, res) => {
    try {
        await revokeSessionFromRequest(req);
    } catch (error) {
        console.error("Logout Controller Error:", error);
    }

    clearAuthCookies(res);

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });
};

// ========================================
// LOGOUT FROM ALL DEVICES
// ========================================

export const logoutAll = async (req, res) => {
    try {
        await revokeAllSessions(req.user._id);
        clearAuthCookies(res);

        return res.status(200).json({
            success: true,
            message: "Logged out from all devices",
        });
    } catch (error) {
        console.error("Logout All Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to log out from all devices",
        });
    }
};
