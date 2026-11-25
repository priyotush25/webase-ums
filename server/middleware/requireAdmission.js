// A student can use the academic system only after an admin approves the admission.
export const isAdmitted = (user) => Boolean(user?.admission && user?.department);

export const requireAdmission = (req, res, next) => {
    if (req.user?.role !== "student" || isAdmitted(req.user)) return next();

    return res.status(403).json({
        success: false,
        code: "ADMISSION_REQUIRED",
        message: "Your admission is not approved yet. Apply for admission and wait for the admin's approval.",
    });
};

export default requireAdmission;
