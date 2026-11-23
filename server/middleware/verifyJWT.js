
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.ums_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // JWT থেকে MongoDB User ID নেওয়া
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // Authenticated user
        req.user = user;

        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        });
    }
};
