
import { createBrowserRouter } from "react-router";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";

import AdminStudents from "../pages/admin/AdminStudents";
import AdminTeachers from "../pages/admin/AdminTeachers";
// Public Pages
import Home from "../pages/Home";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";

// Teacher Pages
import TeacherDashboard from "../pages/teacher/TeacherDashboard";

// Route Guards
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
                element: <Home />,
            },
        ],
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
                        element: <Login />,
                    },
                    {
                        path: "/signup",
                        element: <Signup />,
                    },
                ],
            },
        ],
    },

    // ========================================
    // STUDENT ROUTES
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/student/dashboard",
                        element: <StudentDashboard />,
                    },

                    // Future Student Pages
                    // {
                    //     path: "/student/courses",
                    //     element: <StudentCourses />,
                    // },
                    // {
                    //     path: "/student/attendance",
                    //     element: <StudentAttendance />,
                    // },
                    // {
                    //     path: "/student/results",
                    //     element: <StudentResults />,
                    // },
                ],
            },
        ],
    },

    // ========================================
    // TEACHER ROUTES
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["teacher"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "/teacher/dashboard",
                        element: <TeacherDashboard />,
                    },

                    // Future Teacher Pages
                    // {
                    //     path: "/teacher/courses",
                    //     element: <TeacherCourses />,
                    // },
                    // {
                    //     path: "/teacher/students",
                    //     element: <TeacherStudents />,
                    // },
                    // {
                    //     path: "/teacher/attendance",
                    //     element: <TeacherAttendance />,
                    // },
                ],
            },
        ],
    },

    // ========================================
    // ADMIN ROUTES
    // ========================================

    {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
            {
                element: <DashboardLayout />,
                children: [
                   {
                    path: "/admin/dashboard",
                    element: <AdminDashboard />,
                },
                {
                    path: "/admin/users",
                    element: <AdminUsers />,
                },
                {
                    path: "/admin/students",
                    element: <AdminStudents />,
                },
                {
                    path: "/admin/teachers",
                    element: <AdminTeachers />,
                }
                ],
            },
        ],
    },

]);

export default routers;
