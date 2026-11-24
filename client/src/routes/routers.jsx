
import { createBrowserRouter } from "react-router";

// New pages
import ForgotPassword from "../pages/auth/ForgotPassword";
import NotFound from "../pages/NotFound";
import About from "../pages/public/About";
import AdmissionApply from "../pages/public/AdmissionApply";
import Admissions from "../pages/public/Admissions";
import AdmissionTrack from "../pages/public/AdmissionTrack";
import DepartmentDetail from "../pages/public/DepartmentDetail";
import Departments from "../pages/public/Departments";
import Faculty from "../pages/public/Faculty";
import PublicNotices from "../pages/public/PublicNotices";
import Academics from "../pages/public/Academics";
import Contact from "../pages/public/Contact";
import Legal from "../pages/public/Legal";
import Assignments from "../pages/shared/Assignments";
import AdminAdmissions from "../pages/admin/AdminAdmissions";
import AdminReports from "../pages/admin/AdminReports";
import StudentIdCard from "../pages/student/StudentIdCard";
import Events from "../pages/shared/Events";
import Fees from "../pages/shared/Fees";
import Routine from "../pages/shared/Routine";
import Notices from "../pages/shared/Notices";
import Profile from "../pages/shared/Profile";
import Results from "../pages/shared/Results";
import TeacherStudents from "../pages/teacher/TeacherStudents";

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
            { path: "/about", element: <About /> },
            { path: "/admissions", element: <Admissions /> },
            { path: "/admissions/apply", element: <AdmissionApply /> },
            { path: "/admissions/track", element: <AdmissionTrack /> },
            { path: "/departments", element: <Departments /> },
            { path: "/departments/:code", element: <DepartmentDetail /> },
            { path: "/faculty", element: <Faculty /> },
            { path: "/notices", element: <PublicNotices /> },
            { path: "/academics", element: <Academics /> },
            { path: "/contact", element: <Contact /> },
            { path: "/terms", element: <Legal type="terms" /> },
            { path: "/privacy", element: <Legal type="privacy" /> },
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
                    {
                        path: "/forgot-password",
                        element: <ForgotPassword />,
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
                    { path: "/student/notices", element: <Notices /> },
                    { path: "/student/calendar", element: <Events /> },
                    { path: "/student/fees", element: <Fees /> },
                    { path: "/student/id-card", element: <StudentIdCard /> },
                    { path: "/student/routine", element: <Routine /> },
                    { path: "/student/results", element: <Results /> },
                    { path: "/student/assignments", element: <Assignments /> },
                    { path: "/student/profile", element: <Profile /> },

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
                    { path: "/teacher/students", element: <TeacherStudents /> },
                    { path: "/teacher/notices", element: <Notices /> },
                    { path: "/teacher/calendar", element: <Events /> },
                    { path: "/teacher/routine", element: <Routine /> },
                    { path: "/teacher/results", element: <Results /> },
                    { path: "/teacher/assignments", element: <Assignments /> },
                    { path: "/teacher/profile", element: <Profile /> },
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
                    { path: "/admin/notices", element: <Notices /> },
                    { path: "/admin/calendar", element: <Events /> },
                    { path: "/admin/fees", element: <Fees /> },
                    { path: "/admin/admissions", element: <AdminAdmissions /> },
                    { path: "/admin/reports", element: <AdminReports /> },
                    { path: "/admin/routine", element: <Routine /> },
                    { path: "/admin/results", element: <Results /> },
                    { path: "/admin/assignments", element: <Assignments /> },
                    { path: "/admin/profile", element: <Profile /> },
                    { path: "/admin/settings", element: <Profile title="Settings" /> },
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

    // ========================================
    // NOT FOUND
    // ========================================

    {
        path: "*",
        element: <NotFound />,
    },

]);

export default routers;
