
import {
    ArrowUpRight,
    BookOpen,
    CalendarCheck,
    ClipboardList,
    GraduationCap,
    RefreshCw,
    ShieldCheck,
    UserRound,
    Users
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { getUserStats } from "../../api/userApi";
import DashboardInsights from "../../components/dashboard/DashboardInsights";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0
    });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Dashboard Statistics
    const fetchStats = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await getUserStats();

            setStats({
                totalUsers: response.data.totalUsers ?? 0,
                totalStudents: response.data.totalStudents ?? 0,
                totalTeachers: response.data.totalTeachers ?? 0,
                totalAdmins: response.data.totalAdmins ?? 0
            });

        } catch (error) {
            console.error("Dashboard Error:", error);
            toast.error(error.message || "Failed to load dashboard");

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Statistics Cards
    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: Users,
            color: "bg-blue-100 text-blue-600",
            description: "All registered users"
        },
        {
            title: "Total Students",
            value: stats.totalStudents,
            icon: GraduationCap,
            color: "bg-green-100 text-green-600",
            description: "Registered students"
        },
        {
            title: "Total Teachers",
            value: stats.totalTeachers,
            icon: UserRound,
            color: "bg-purple-100 text-purple-600",
            description: "Registered teachers"
        },
        {
            title: "Total Admins",
            value: stats.totalAdmins,
            icon: ShieldCheck,
            color: "bg-orange-100 text-orange-600",
            description: "System administrators"
        }
    ];

    // Role Distribution
    const roleData = [
        {
            name: "Students",
            value: stats.totalStudents,
            color: "bg-green-500"
        },
        {
            name: "Teachers",
            value: stats.totalTeachers,
            color: "bg-purple-500"
        },
        {
            name: "Admins",
            value: stats.totalAdmins,
            color: "bg-orange-500"
        }
    ];

    // Quick Actions
    const quickActions = [
        {
            title: "Manage Users",
            description: "View and manage all users",
            icon: Users,
            path: "/admin/users",
            color: "text-blue-600 bg-blue-100"
        },
        {
            title: "Manage Students",
            description: "Manage student information",
            icon: GraduationCap,
            path: "/admin/students",
            color: "text-green-600 bg-green-100"
        },
        {
            title: "Manage Teachers",
            description: "Manage teacher information",
            icon: UserRound,
            path: "/admin/teachers",
            color: "text-purple-600 bg-purple-100"
        },
        {
            title: "Manage Courses",
            description: "Create and manage courses",
            icon: BookOpen,
            path: "/admin/courses",
            color: "text-orange-600 bg-orange-100"
        },
        {
            title: "Attendance",
            description: "Manage attendance records",
            icon: CalendarCheck,
            path: "/admin/attendance",
            color: "text-pink-600 bg-pink-100"
        },
        {
            title: "Examinations",
            description: "Manage exams and results",
            icon: ClipboardList,
            path: "/admin/exams",
            color: "text-indigo-600 bg-indigo-100"
        }
    ];

    // Calculate Percentage
    const getPercentage = (value) => {
        if (!stats.totalUsers) return 0;

        return Math.round((value / stats.totalUsers) * 100);
    };

    // Initial Loading
    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <RefreshCw
                        className="mx-auto mb-3 animate-spin text-blue-600"
                        size={32}
                    />

                    <p className="font-medium text-gray-600">
                        Loading Admin Dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Welcome to University Management System
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchStats(true)}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "animate-spin" : ""}
                    />

                    {refreshing ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.title}
                            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    <h2 className="mt-3 text-3xl font-bold text-gray-800">
                                        {card.value.toLocaleString()}
                                    </h2>
                                </div>

                                <div className={`rounded-xl p-3 ${card.color}`}>
                                    <Icon size={25} />
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-gray-400">
                                {card.description}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* User Distribution */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800">
                        User Distribution
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Registered users by role
                    </p>

                    <div className="mt-7 space-y-6">
                        {roleData.map((item) => (
                            <div key={item.name}>
                                <div className="mb-2 flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">
                                        {item.name}
                                    </span>

                                    <span className="font-semibold text-gray-800">
                                        {item.value} ({getPercentage(item.value)}%)
                                    </span>
                                </div>

                                <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                                        style={{
                                            width: `${getPercentage(item.value)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-7 border-t border-gray-100 pt-5">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-600">
                                Total Registered Users
                            </span>

                            <span className="font-bold text-gray-800">
                                {stats.totalUsers}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800">
                        Quick Actions
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Quickly access management modules
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {quickActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    key={action.title}
                                    to={action.path}
                                    className="group flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition hover:border-blue-200 hover:bg-blue-50"
                                >
                                    <div className={`rounded-lg p-2 ${action.color}`}>
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            {action.title}
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            {action.description}
                                        </p>
                                    </div>

                                    <ArrowUpRight
                                        size={16}
                                        className="text-gray-400 transition group-hover:text-blue-600"
                                    />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* System Overview */}
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800">
                    System Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Current user statistics from MongoDB
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Students</p>
                        <p className="mt-2 text-xl font-bold text-green-600">
                            {getPercentage(stats.totalStudents)}%
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Teachers</p>
                        <p className="mt-2 text-xl font-bold text-purple-600">
                            {getPercentage(stats.totalTeachers)}%
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <p className="text-sm text-gray-500">Admins</p>
                        <p className="mt-2 text-xl font-bold text-orange-600">
                            {getPercentage(stats.totalAdmins)}%
                        </p>
                    </div>
                </div>
            </div>

            <DashboardInsights />

        </div>
    );
};

export default AdminDashboard;
