
import { createBrowserRouter } from "react-router";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import MainLayout from "../layouts/MainLayout";
import AdminStudents from "../pages/admin/AdminStudents";
import AdminTeachers from "../pages/admin/AdminTeachers";
import StudentCourses from "../pages/student/StudentCourses";
import TeacherCourses from "../pages/teacher/TeacherCourses";
// Public Pages
import Home from "../pages/Home";
import AdminCourses from "../pages/admin/AdminCourses";
import AdminDepartments from "../pages/admin/AdminDepartments";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import AdminEnrollments from "../pages/admin/AdminEnrollments";
import MyEnrollments from "../pages/student/MyEnrollments";



// Student
import StudentAttendance from "../pages/student/StudentAttendance";

// Teacher
import TeacherAttendance from "../pages/teacher/TeacherAttendance";

// Admin
import AdminAttendance from "../pages/admin/AdminAttendance";



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

                    {
                        path: "/student/courses",
                        element: <StudentCourses />
                    },
                    {
                        path: "/student/enrollments",
                        element: <MyEnrollments />
                    },
                    {
                        path: "/student/attendance",
                        element: <StudentAttendance />
                    }

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
                    {
                        path: "/teacher/courses",
                        element: <TeacherCourses />,
                    },
                    {
                        path: "/teacher/attendance",
                        element: <TeacherAttendance />
                    }
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
                    },
                    {
                        path: "/admin/departments",
                        element: <AdminDepartments />,
                    },
                    {
                        path: "/admin/courses",
                        element: <AdminCourses />,
                    },
                    {
                        path: "/admin/enrollments",
                        element: <AdminEnrollments />
                    },
                    {
                        path: "/admin/attendance",
                        element: <AdminAttendance />
                    }
                ],
            },
        ],
    },

]);

export default routers;
