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
 * - Expired access token + valid refresh cookie (bcrypt-checked) -> silently issue a new access token
 * - Otherwise -> 401
 */
export const verifyJWT = async (req, res, next) => {
    try {
        let userId = null;
        const decoded = await verifyAccessToken(req.cookies?.[ACCESS_COOKIE]);

        if (decoded) {
            userId = decoded.id;
        } else {
            const session = await findRefreshSession(req.cookies?.[REFRESH_COOKIE]);

            if (!session) {
                clearAuthCookies(res);
                return unauthorized(res, "Session expired. Please login again.");
            }

            userId = session.user.toString();
            req.sessionId = session.sessionId;
        }

        const user = await User.findById(userId);

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
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return unauthorized(res, "Invalid or expired token. Please login again.");
    }
};

export default verifyJWT;
