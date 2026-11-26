
import { Navigate, Outlet } from "react-router";

import { useAuth } from "../context/AuthContext";

const GuestRoute = () => {

    const { user, role, loading } = useAuth();

    // Wait for authentication checking
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-blue-900 font-semibold">
                    Checking authentication...
                </p>
            </div>
        );
    }

    // If user is already logged in,
    // redirect according to database role
    if (user) {

        const dashboardPaths = {
            student: "/student/dashboard",
            teacher: "/teacher/dashboard",
            admin: "/admin/dashboard"
        };

        const destination = dashboardPaths[
            role?.toString().trim().toLowerCase()
        ];

        return (
            <Navigate
                to={destination || "/"}
                replace
            />
        );
    }

    // Allow guests to access Login and Signup
    return <Outlet />;
};

export default GuestRoute;
