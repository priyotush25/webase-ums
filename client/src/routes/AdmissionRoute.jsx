import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

// Academic pages open only after the admin approves the student's admission.
const AdmissionRoute = () => {
    const { user } = useAuth();

    if (user && user.admissionApproved === false) {
        return <Navigate to="/student/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdmissionRoute;
