
import { createBrowserRouter } from "react-router";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import AdminUsers from "../pages/admin/AdminUsers";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Home from "../pages/Home";

// Dashboard Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import StudentDashboard from "../pages/student/StudentDashboard";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

const routers = createBrowserRouter([

    // ========================================
    // PUBLIC ROUTES
    // ========================================

    {
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />
            }
        ]
    },

    // ========================================
    // GUEST ONLY ROUTES
    // ========================================

    {
        element: <GuestRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "/login",
                        element: <Login />
                    },
                    {
                        path: "/signup",
                        element: <Signup />
                    }
                ]
            }
        ]
    },

    // ========================================
    // STUDENT DASHBOARD
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/student/dashboard",
                        element: <StudentDashboard />
                    }
                ]
            }
        ]
    },

    // ========================================
    // TEACHER DASHBOARD
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["teacher"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/teacher/dashboard",
                        element: <TeacherDashboard />
                    }
                ]
            }
        ]
    },

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/admin/dashboard",
                        element: <AdminDashboard />
                    },
                    {
                        path: "/admin/users",
                        element: <AdminUsers />
                    }
                ]
            }
        ]
    }

]);

export default routers;
