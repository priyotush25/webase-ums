// Verifies Firebase ID tokens using only Node's built-in crypto and Google's public
// certificates (the procedure described in Firebase's "verify ID tokens" guide).
// No firebase-admin needed, so there is no service account key to manage.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CERT_URL =
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

const CLOCK_SKEW_SECONDS = 60;

let certCache = { certs: null, expires: 0 };

const getProjectId = () => {
    if (process.env.FIREBASE_PROJECT_ID?.trim()) return process.env.FIREBASE_PROJECT_ID.trim();

    // Local fallback: project_id inside the old serviceAccountKey.json, if present
    try {
        const file = path.join(path.dirname(fileURLToPath(import.meta.url)), "../serviceAccountKey.json");
        return JSON.parse(fs.readFileSync(file, "utf8")).project_id;
    } catch {
        return undefined;
    }
};

const fetchCerts = async () => {
    const response = await fetch(CERT_URL);

    if (!response.ok) throw new Error(`Could not fetch Firebase certificates (${response.status})`);

    const maxAge = /max-age=(\d+)/.exec(response.headers.get("cache-control") || "");

    certCache = {
        certs: await response.json(),
        expires: Date.now() + (maxAge ? Number(maxAge[1]) : 3600) * 1000,
    };

    return certCache.certs;
};

const getCert = async (kid) => {
    let certs = certCache.certs && Date.now() < certCache.expires ? certCache.certs : await fetchCerts();

    // Keys rotate: if the key id is unknown, refresh once
    if (!certs[kid]) certs = await fetchCerts();

    return certs[kid];
};

const parsePart = (part) => JSON.parse(Buffer.from(part, "base64url").toString("utf8"));

/**
 * @param {string} token Firebase ID token
 * @param {{ projectId?: string, now?: number, getCertificate?: (kid: string) => Promise<string> }} [options]
 * @returns decoded claims with `uid`
 */
export const verifyFirebaseIdToken = async (token, options = {}) => {
    const projectId = options.projectId ?? getProjectId();

    if (!projectId) {
        throw new Error("FIREBASE_PROJECT_ID is not set on the server");
    }

    const parts = typeof token === "string" ? token.split(".") : [];

    if (parts.length !== 3) throw new Error("Malformed token");

    let header;
    let payload;

    try {
        header = parsePart(parts[0]);
        payload = parsePart(parts[1]);
    } catch {
        throw new Error("Malformed token");
    }

    if (header.alg !== "RS256") throw new Error("Unexpected token algorithm");
    if (typeof header.kid !== "string") throw new Error("Token has no key id");

    const pem = await (options.getCertificate ?? getCert)(header.kid);

    if (!pem) throw new Error("Unknown signing key");

    const publicKey = new crypto.X509Certificate(pem).publicKey;

    const validSignature = crypto.verify(
        "RSA-SHA256",
        Buffer.from(`${parts[0]}.${parts[1]}`),
        publicKey,
        Buffer.from(parts[2], "base64url")
    );

    if (!validSignature) throw new Error("Invalid token signature");

    const now = options.now ?? Math.floor(Date.now() / 1000);

    if (payload.aud !== projectId) throw new Error("Token audience does not match this project");
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) throw new Error("Invalid token issuer");
    if (typeof payload.sub !== "string" || !payload.sub) throw new Error("Token has no subject");
    if (typeof payload.exp !== "number" || payload.exp + CLOCK_SKEW_SECONDS < now) throw new Error("Token has expired");
    if (typeof payload.iat !== "number" || payload.iat - CLOCK_SKEW_SECONDS > now) throw new Error("Token issued in the future");
    if (typeof payload.auth_time === "number" && payload.auth_time - CLOCK_SKEW_SECONDS > now) throw new Error("Invalid auth time");

    return { ...payload, uid: payload.sub };
};

export default verifyFirebaseIdToken;
