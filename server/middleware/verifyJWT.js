
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyJWT = async (req, res, next) => {
    try {
        // Step 1: Read JWT from HttpOnly Cookie
        const token = req.cookies?.ums_token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login.",
            });
        }

        // Step 2: Verify Backend JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Step 3: Find User in MongoDB
        const user = await User.findById(decoded.userId).select(
            "-__v"
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User account not found.",
            });
        }

        // Step 4: Attach User to Request
        req.user = user;

        next();

    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session. Please login again.",
        });
    }
};

export default verifyJWT;
