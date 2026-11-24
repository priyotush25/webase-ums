
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CERT_URL =
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

const CLOCK_SKEW_SECONDS = 60;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let certCache = {
    certs: null,
    expires: 0,
};

const getProjectId = () => {
    const envProjectId = process.env.FIREBASE_PROJECT_ID?.trim();

    if (envProjectId) {
        return envProjectId;
    }

    // Local development fallback
    try {
        const file = path.join(
            __dirname,
            "../serviceAccountKey.json"
        );

        const serviceAccount = JSON.parse(
            fs.readFileSync(file, "utf8")
        );

        return serviceAccount.project_id;
    } catch {
        return undefined;
    }
};

// Fetch Google's public certificates
const fetchCerts = async () => {
    const response = await fetch(CERT_URL);

    if (!response.ok) {
        throw new Error(
            `Firebase certificate fetch failed: ${response.status}`
        );
    }

    const certs = await response.json();

    const cacheControl =
        response.headers.get("cache-control") || "";

    const maxAge = /max-age=(\d+)/i.exec(cacheControl);

    const cacheSeconds = maxAge
        ? Number(maxAge[1])
        : 3600;

    certCache = {
        certs,
        expires: Date.now() + cacheSeconds * 1000,
    };

    return certs;
};

// Get certificate using key ID
const getCert = async (kid) => {
    let certs =
        certCache.certs &&
        Date.now() < certCache.expires
            ? certCache.certs
            : await fetchCerts();

    // Refresh once if signing key is unknown
    if (!certs[kid]) {
        certs = await fetchCerts();
    }

    return certs[kid];
};

// Decode Base64URL JWT parts
const parsePart = (part) => {
    return JSON.parse(
        Buffer.from(part, "base64url").toString("utf8")
    );
};

// Verify Firebase ID Token
export const verifyFirebaseIdToken = async (
    token,
    options = {}
) => {
    const projectId =
        options.projectId ?? getProjectId();

    if (!projectId) {
        throw new Error(
            "FIREBASE_PROJECT_ID is not set on the server"
        );
    }

    if (typeof token !== "string") {
        throw new Error("Invalid token format");
    }

    const parts = token.split(".");

    if (parts.length !== 3 || parts.some(part => !part)) {
        throw new Error("Malformed Firebase ID token");
    }

    let header;
    let payload;

    try {
        header = parsePart(parts[0]);
        payload = parsePart(parts[1]);
    } catch {
        throw new Error("Malformed Firebase ID token");
    }

    // Validate JWT header
    if (header.alg !== "RS256") {
        throw new Error("Unexpected token algorithm");
    }

    if (typeof header.kid !== "string" || !header.kid) {
        throw new Error("Token has no key ID");
    }

    // Get Google's signing certificate
    const pem = await (
        options.getCertificate ?? getCert
    )(header.kid);

    if (!pem) {
        throw new Error("Unknown Firebase signing key");
    }

    // Verify RSA signature
    let validSignature;

    try {
        const publicKey =
            new crypto.X509Certificate(pem).publicKey;

        validSignature = crypto.verify(
            "RSA-SHA256",
            Buffer.from(`${parts[0]}.${parts[1]}`),
            publicKey,
            Buffer.from(parts[2], "base64url")
        );
    } catch {
        throw new Error("Firebase signature verification failed");
    }

    if (!validSignature) {
        throw new Error("Invalid Firebase token signature");
    }

    // Validate Firebase claims
    const now =
        options.now ?? Math.floor(Date.now() / 1000);

    if (payload.aud !== projectId) {
        throw new Error("Invalid Firebase token audience");
    }

    if (
        payload.iss !==
        `https://securetoken.google.com/${projectId}`
    ) {
        throw new Error("Invalid Firebase token issuer");
    }

    if (
        typeof payload.sub !== "string" ||
        !payload.sub ||
        payload.sub.length > 128
    ) {
        throw new Error("Invalid Firebase UID");
    }

    if (
        typeof payload.exp !== "number" ||
        payload.exp <= 0 ||
        payload.exp + CLOCK_SKEW_SECONDS < now
    ) {
        throw new Error("Firebase token expired");
    }

    if (
        typeof payload.iat !== "number" ||
        payload.iat <= 0 ||
        payload.iat - CLOCK_SKEW_SECONDS > now
    ) {
        throw new Error("Invalid Firebase issued-at time");
    }

    if (
        typeof payload.auth_time !== "number" ||
        payload.auth_time <= 0 ||
        payload.auth_time - CLOCK_SKEW_SECONDS > now
    ) {
        throw new Error("Invalid Firebase authentication time");
    }

    if (
        payload.exp <= payload.iat ||
        payload.auth_time > payload.iat + CLOCK_SKEW_SECONDS
    ) {
        throw new Error("Invalid Firebase token time claims");
    }

    // Return verified Firebase user information
    return {
        ...payload,
        uid: payload.sub,
    };
};

export default verifyFirebaseIdToken;
