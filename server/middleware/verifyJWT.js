import User from "../models/User.js";
import {
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    clearAuthCookies,
    findRefreshSession,
    renewAccessToken,
    verifyAccessToken,
} from "../utils/authSession.js";

const unauthorized = (res, message) =>
    res.status(401).json({ success: false, message });

/**
 * Authenticates a request with the httpOnly JWT cookie.
 * - Valid access token + live session  -> continue
 * - Expired access token + valid refresh cookie -> silently issue a new access token
 * - Otherwise -> 401
 */
export const verifyJWT = async (req, res, next) => {
    try {
        let userId = null;
        const decoded = await verifyAccessToken(req.cookies?.[ACCESS_COOKIE]);

        if (decoded) {
            userId = decoded.id;
            // Make sessionId available on the normal path too (logout, etc.)
            req.sessionId = decoded.sessionId ?? decoded.sid ?? null;
        } else {
            const session = await findRefreshSession(req.cookies?.[REFRESH_COOKIE]);

            if (!session) {
                clearAuthCookies(res);
                return unauthorized(res, "Session expired. Please login again.");
            }

            userId = session.user.toString();
            req.sessionId = session.sessionId;
        }

        // Never load the password hash into req.user
        const user = await User.findById(userId).select("-password");

        if (!user) {
            clearAuthCookies(res);
            return unauthorized(res, "User not found. Please login again.");
        }

        if (user.isActive === false) {
            clearAuthCookies(res);
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Contact the administrator.",
            });
        }

        // Access token was refreshed from the refresh cookie: issue a fresh one
        if (!decoded) renewAccessToken(res, user, req.sessionId);

        req.user = user;
        return next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        // Token problems -> 401, anything else (DB down, etc.) -> 500
        const isTokenError = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
            error.name
        );

        if (isTokenError) {
            clearAuthCookies(res);
            return unauthorized(res, "Invalid or expired token. Please login again.");
        }

        return res.status(500).json({
            success: false,
            message: "Authentication failed due to a server error. Please try again.",
        });
    }
};

export default verifyJWT;