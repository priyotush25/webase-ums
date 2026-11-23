
export const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized. Please login first."
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You do not have permission."
                });
            }

            next();

        } catch (error) {
            console.error("Authorization Error:", error);

            return res.status(500).json({
                success: false,
                message: "Authorization failed."
            });
        }
    };
};
