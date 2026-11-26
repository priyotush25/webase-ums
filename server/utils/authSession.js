import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import Session from "../models/Session.js";

export const ACCESS_COOKIE = "ums_token";
export const REFRESH_COOKIE = "ums_refresh";

const BCRYPT_ROUNDS = 10;
const MAX_SESSIONS_PER_USER = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

// Environment is read lazily: dotenv runs after the ES module imports are evaluated.
const isProd = () => process.env.NODE_ENV === "production";
const refreshDays = () => Number(process.env.REFRESH_EXPIRES_DAYS) || 7;
const accessExpiresIn = () => process.env.JWT_EXPIRES_IN || "15m";

const cookieOptions = () => ({
    httpOnly: true,
    // Frontend and API are usually on different domains in production
    secure: isProd(),
    sameSite: isProd() ? "none" : "lax",
    path: "/",
});

// ---------- cookies ----------

const setAccessCookie = (res, user, sessionId) => {
    const token = jwt.sign(
        { id: user._id.toString(), role: user.role, sid: sessionId },
        process.env.JWT_SECRET,
        { expiresIn: accessExpiresIn() }
    );

    res.cookie(ACCESS_COOKIE, token, {
        ...cookieOptions(),
        maxAge: refreshDays() * DAY_MS,
    });
};

const setRefreshCookie = (res, sessionId, secret) => {
    res.cookie(REFRESH_COOKIE, `${sessionId}.${secret}`, {
        ...cookieOptions(),
        maxAge: refreshDays() * DAY_MS,
    });
};

export const clearAuthCookies = (res) => {
    res.clearCookie(ACCESS_COOKIE, cookieOptions());
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
};

// ---------- sessions ----------

// Called after a successful Firebase sign-in / sign-up
export const createSession = async (user, req, res) => {
    const sessionId = crypto.randomBytes(16).toString("hex");
    const secret = crypto.randomBytes(32).toString("hex");

    await Session.create({
        user: user._id,
        sessionId,
        secretHash: await bcrypt.hash(secret, BCRYPT_ROUNDS),
        userAgent: (req.get("user-agent") || "").slice(0, 200),
        ip: req.ip || "",
        expiresAt: new Date(Date.now() + refreshDays() * DAY_MS),
    });

    // Keep only the newest sessions per user
    const stale = await Session.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(MAX_SESSIONS_PER_USER)
        .select("_id");

    if (stale.length) {
        await Session.deleteMany({ _id: { $in: stale.map((session) => session._id) } });
    }

    setAccessCookie(res, user, sessionId);
    setRefreshCookie(res, sessionId, secret);
};

// Validates the refresh cookie (bcrypt) and returns its session, or null
export const findRefreshSession = async (cookieValue) => {
    const [sessionId, secret] = String(cookieValue || "").split(".");

    if (!sessionId || !secret) return null;

    const session = await Session.findOne({
        sessionId,
        expiresAt: { $gt: new Date() },
    });

    if (!session) return null;

    const valid = await bcrypt.compare(secret, session.secretHash);

    return valid ? session : null;
};

// Valid access token whose session still exists (so logout takes effect at once)
export const verifyAccessToken = async (token) => {
    if (!token || !process.env.JWT_SECRET) return null;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.sid) return null;

        const alive = await Session.exists({
            sessionId: decoded.sid,
            expiresAt: { $gt: new Date() },
        });

        return alive ? decoded : null;
    } catch {
        // expired or tampered: caller falls back to the refresh cookie
        return null;
    }
};

export const renewAccessToken = setAccessCookie;

export const revokeSessionFromRequest = async (req) => {
    const [sessionId] = String(req.cookies?.[REFRESH_COOKIE] || "").split(".");

    if (sessionId) await Session.deleteOne({ sessionId });
};

export const revokeAllSessions = (userId) => Session.deleteMany({ user: userId });
