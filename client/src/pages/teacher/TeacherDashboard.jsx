
import {
    ArrowRight,
    Bell,
    BookOpen,
    CalendarCheck,
    ClipboardList,
    Clock,
    GraduationCap,
    Users
} from "lucide-react";

import { Link } from "react-router";
import { useAuth } from "../../context/AuthContext";

const TeacherDashboard = () => {

    const { user } = useAuth();

    const stats = [
        {
            title: "My Courses",
            value: "—",
            icon: BookOpen,
            color: "bg-blue-100 text-blue-700"
        },
        {
            title: "Total Students",
            value: "—",
            icon: Users,
            color: "bg-green-100 text-green-700"
        },
        {
            title: "Attendance",
            value: "—",
            icon: CalendarCheck,
            color: "bg-purple-100 text-purple-700"
        },
        {
            title: "Assignments",
            value: "—",
            icon: ClipboardList,
            color: "bg-orange-100 text-orange-700"
        }
    ];

    const quickActions = [
        {
            title: "My Courses",
            description: "Manage your assigned courses",
            icon: BookOpen,
            path: "/teacher/courses"
        },
        {
            title: "My Students",
            description: "View your enrolled students",
            icon: Users,
            path: "/teacher/students"
        },
        {
            title: "Attendance",
            description: "Manage student attendance",
            icon: CalendarCheck,
            path: "/teacher/attendance"
        },
        {
            title: "Assignments",
            description: "Create and manage assignments",
            icon: ClipboardList,
            path: "/teacher/assignments"
        }
    ];

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <section className="bg-gradient-to-r from-emerald-900 to-teal-700 rounded-2xl p-6 md:p-8 text-white">

                <div className="flex items-center justify-between gap-5">

                    <div>
                        <p className="text-emerald-200 text-sm mb-2">
                            Teacher Portal
                        </p>

                        <h2 className="text-2xl md:text-3xl font-bold">
                            Welcome, {user?.name || user?.displayName || "Teacher"}!
                        </h2>

                        <p className="text-emerald-100 mt-2">
                            Manage your courses, students and academic activities.
                        </p>
                    </div>

                    <GraduationCap size={48} className="hidden sm:block" />

                </div>

            </section>

            {/* Statistics */}
            <section>

                <div className="mb-5">
                    <h2 className="text-xl font-bold text-gray-800">
                        Teaching Overview
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Your teaching activities summary
                    </p>
                </div>

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
                                            {item.value}
                                        </h3>
                                    </div>

                                    <div className={`p-3 rounded-xl ${item.color}`}>
                                        <Icon size={25} />
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 mt-4">
                                    Awaiting academic data
                                </p>
                            </div>
                        );
                    })}

                </div>

            </section>

            {/* Quick Actions */}
            <section>

                <h2 className="text-xl font-bold text-gray-800 mb-5">
                    Quick Management
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
                                <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl">
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

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex items-center gap-3 mb-5">
                        <Bell className="text-emerald-700" />

                        <h2 className="font-bold text-gray-800">
                            Recent Activities
                        </h2>
                    </div>

                    <div className="text-center py-8">
                        <Clock size={32} className="mx-auto text-gray-300" />

                        <p className="font-semibold text-gray-700 mt-3">
                            No Recent Activities
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                            Your teaching activities will appear here.
                        </p>
                    </div>

                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    <div className="flex items-center gap-3 mb-5">
                        <Users className="text-emerald-700" />

                        <h2 className="font-bold text-gray-800">
                            Teacher Information
                        </h2>
                    </div>

                    <div className="space-y-4">

                        <div className="flex justify-between gap-3 border-b pb-3">
                            <span className="text-sm text-gray-500">Name</span>
                            <span className="text-sm font-semibold text-gray-800">
                                {user?.name || user?.displayName || "Teacher"}
                            </span>
                        </div>

                        <div className="flex justify-between gap-3 border-b pb-3">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="text-sm font-semibold text-gray-800 break-all">
                                {user?.email || "N/A"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Role</span>
                            <span className="text-sm font-semibold text-emerald-700">
                                Teacher
                            </span>
                        </div>

                    </div>

                </div>

            </section>

        </div>
    );
};

export default TeacherDashboard;
