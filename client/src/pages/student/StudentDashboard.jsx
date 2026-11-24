
import { useCallback, useEffect, useState } from "react";

import {
    ArrowRight,
    Award,
    Bell,
    BookOpen,
    CalendarCheck,
    ClipboardList,
    Clock,
    GraduationCap,
    RefreshCw
} from "lucide-react";

import { Link } from "react-router";
import { getMyEnrollments } from "../../api/enrollmentApi";
import { useAuth } from "../../context/AuthContext";
import DashboardInsights from "../../components/dashboard/DashboardInsights";

const StudentDashboard = () => {
    const { user } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Enrollment data fetch
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getMyEnrollments();

            // API response থেকে enrollment array বের করা
            const enrollmentData =
                response?.enrollments ??
                response?.data?.enrollments ??
                response?.data?.data ??
                response?.data ??
                [];

            if (!Array.isArray(enrollmentData)) {
                throw new Error("Invalid enrollment response from server.");
            }

            setEnrollments(enrollmentData);
        } catch (err) {
            console.error("Student Dashboard Error:", err);
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Enrollment statistics
    const approvedEnrollments = enrollments.filter(
        (item) => item.status === "approved"
    );

    const pendingEnrollments = enrollments.filter(
        (item) => item.status === "pending"
    );

    const rejectedEnrollments = enrollments.filter(
        (item) => item.status === "rejected"
    );

    const stats = [
        {
            title: "Enrolled Courses",
            value: approvedEnrollments.length,
            description: `${pendingEnrollments.length} pending approval`,
            icon: BookOpen,
            color: "bg-blue-100 text-blue-700",
            path: "/student/enrollments"
        },
        {
            title: "Attendance",
            value: "—",
            description: "Attendance module not available yet",
            icon: CalendarCheck,
            color: "bg-green-100 text-green-700",
            path: "/student/attendance"
        },
        {
            title: "Assignments",
            value: "—",
            description: "Assignment module not available yet",
            icon: ClipboardList,
            color: "bg-purple-100 text-purple-700",
            path: "/student/assignments"
        },
        {
            title: "Results",
            value: "—",
            description: "Result module not available yet",
            icon: Award,
            color: "bg-orange-100 text-orange-700",
            path: "/student/results"
        }
    ];

    const quickActions = [
        {
            title: "My Courses",
            description: "View available courses",
            icon: BookOpen,
            path: "/student/courses"
        },
        {
            title: "My Enrollments",
            description: "Check enrollment status",
            icon: CalendarCheck,
            path: "/student/enrollments"
        },
        {
            title: "Assignments",
            description: "View pending assignments",
            icon: ClipboardList,
            path: "/student/assignments"
        },
        {
            title: "My Results",
            description: "Check examination results",
            icon: Award,
            path: "/student/results"
        }
    ];

    const recentEnrollments = [...enrollments]
        .sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        )
        .slice(0, 4);

    const getStatusStyle = (status) => {
        const styles = {
            approved: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            rejected: "bg-red-100 text-red-700",
            dropped: "bg-gray-100 text-gray-700"
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-6 md:p-8 text-white">

                <div className="flex items-center justify-between gap-5">

                    <div>
                        <p className="text-blue-200 text-sm mb-2">
                            Student Portal
                        </p>

                        <h2 className="text-2xl md:text-3xl font-bold">
                            Welcome, {user?.name || user?.displayName || "Student"}!
                        </h2>

                        <p className="text-blue-100 mt-2">
                            Manage your courses, attendance and academic progress.
                        </p>
                    </div>

                    <GraduationCap size={48} className="hidden sm:block" />

                </div>

            </section>

            {/* Statistics */}
            <section>

                <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-800">
                        Academic Overview
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Your academic summary
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                        <p className="text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            onClick={fetchDashboardData}
                            className="flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </button>

                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                    {stats.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.title}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
                            >

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {item.title}
                                        </p>

                                        <h3 className="text-3xl font-bold text-gray-800 mt-3">
                                            {loading && item.title === "Enrolled Courses"
                                                ? "..."
                                                : error && item.title === "Enrolled Courses"
                                                    ? "!"
                                                    : item.value}
                                        </h3>
                                    </div>

                                    <div className={`p-3 rounded-xl ${item.color}`}>
                                        <Icon size={25} />
                                    </div>

                                </div>

                                <p className="text-xs text-gray-400 mt-4">
                                    {loading && item.title === "Enrolled Courses"
                                        ? "Loading enrollment data..."
                                        : item.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

                {!loading && !error && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>
                            Approved: <strong className="text-green-700">{approvedEnrollments.length}</strong>
                        </span>

                        <span>
                            Pending: <strong className="text-yellow-700">{pendingEnrollments.length}</strong>
                        </span>

                        <span>
                            Rejected: <strong className="text-red-700">{rejectedEnrollments.length}</strong>
                        </span>
                    </div>
                )}

            </section>

            {/* Quick Actions */}
            <section>

                <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Quick Access
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <Link
                                key={action.title}
                                to={action.path}
                                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex items-center gap-4"
                            >

                                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                                    <Icon size={24} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">
                                        {action.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {action.description}
                                    </p>
                                </div>

                                <ArrowRight size={18} className="text-gray-400" />

                            </Link>
                        );
                    })}

                </div>

            </section>

            {/* Bottom Information */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex items-center gap-3 mb-5">
                        <Bell className="text-blue-700" />

                        <h2 className="font-bold text-gray-800">
                            Recent Activities
                        </h2>
                    </div>

                    {loading ? (
                        <div className="text-center py-8 text-gray-400">
                            Loading activities...
                        </div>
                    ) : recentEnrollments.length > 0 ? (

                        <div className="space-y-4">

                            {recentEnrollments.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0"
                                >

                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-gray-800 truncate">
                                            {item.course?.title || "Course Enrollment"}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString()
                                                : "Date unavailable"}
                                        </p>
                                    </div>

                                    <span
                                        className={`text-xs px-3 py-1 rounded-full font-semibold capitalize whitespace-nowrap ${getStatusStyle(item.status)}`}
                                    >
                                        {item.status}
                                    </span>

                                </div>
                            ))}

                            <Link
                                to="/student/enrollments"
                                className="inline-flex items-center gap-2 text-sm text-blue-700 font-semibold hover:underline"
                            >
                                View All Enrollments
                                <ArrowRight size={15} />
                            </Link>

                        </div>

                    ) : (
                        <div className="text-center py-8">

                            <Clock size={32} className="mx-auto text-gray-300" />

                            <p className="font-semibold text-gray-700 mt-3">
                                No Recent Activities
                            </p>

                            <p className="text-sm text-gray-400 mt-1">
                                Your enrollment activities will appear here.
                            </p>

                        </div>
                    )}

                </div>

                {/* Student Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex items-center gap-3 mb-5">
                        <GraduationCap className="text-green-700" />

                        <h2 className="font-bold text-gray-800">
                            Student Information
                        </h2>
                    </div>

                    <div className="space-y-4">

                        <div className="flex justify-between gap-3 border-b pb-3">
                            <span className="text-sm text-gray-500">
                                Name
                            </span>

                            <span className="text-sm font-semibold text-gray-800">
                                {user?.name || user?.displayName || "Student"}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3 border-b pb-3">
                            <span className="text-sm text-gray-500">
                                Email
                            </span>

                            <span className="text-sm font-semibold text-gray-800 break-all">
                                {user?.email || "N/A"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                                Role
                            </span>

                            <span className="text-sm font-semibold text-blue-700">
                                Student
                            </span>
                        </div>

                    </div>

                </div>

            </section>

            <DashboardInsights />

        </div>
    );
};

export default StudentDashboard;
