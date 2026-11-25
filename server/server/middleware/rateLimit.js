// Small in-memory rate limiter (per IP). Enough for public forms on a single server.
const rateLimit = ({ windowMs, max, message }) => {
    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits) if (entry.reset <= now) hits.delete(key);
    }, windowMs).unref();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip;
        const entry = hits.get(key);

        if (!entry || entry.reset <= now) {
            hits.set(key, { count: 1, reset: now + windowMs });
            return next();
        }

        entry.count += 1;

        if (entry.count > max) {
            return res.status(429).json({
                success: false,
                message: message || "Too many requests. Please try again later.",
            });
        }

        next();
    };
};

export default rateLimit;
