
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyJWT = async (req, res, next) => {
    try {
        // 1. Get token from cookie
        const token = req.cookies?.ums_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication token missing."
            });
        }

        // 2. Check JWT secret
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Internal server configuration error."
            });
        }

        // 3. Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 4. Validate decoded user ID
        if (!decoded.id) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token."
            });
        }

        // 5. Find user in MongoDB
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again."
            });
        }

        // 6. Attach authenticated user
        req.user = user;

        // 7. Continue
        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token. Please login again."
        });
    }
};
