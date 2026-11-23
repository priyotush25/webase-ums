
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {

    const { user, role, loading } = useAuth();

    const location = useLocation();

    // Authentication Loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-blue-900 font-semibold">
                    Checking authentication...
                </p>
            </div>
        );
    }

    // Check User Authentication
    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // Check User Role
    if (!allowedRoles.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // Authorized User
    return <Outlet />;

};

export default ProtectedRoute;
