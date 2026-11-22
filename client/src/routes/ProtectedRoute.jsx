
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {

    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-blue-900 font-semibold">
                    Checking authentication...
                </p>
            </div>
        );
    }

    return user
        ? <Outlet />
        : <Navigate to="/login" replace />;

};

export default ProtectedRoute;
