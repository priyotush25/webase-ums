
import {
    ArrowUpRight,
    BookOpen,
    BookPlus,
    Building2,
    ClipboardList,
    GraduationCap,
    Megaphone,
    ShieldCheck,
    Users
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {

    const { user } = useAuth();

    const statistics = [
        {
            title: "Total Students",
            value: "--",
            icon: GraduationCap,
            color: "bg-blue-100 text-blue-600"
        },
        {
            title: "Total Teachers",
            value: "--",
            icon: Users,
            color: "bg-purple-100 text-purple-600"
        },
        {
            title: "Total Courses",
            value: "--",
            icon: BookOpen,
            color: "bg-green-100 text-green-600"
        },
        {
            title: "Departments",
            value: "--",
            icon: Building2,
            color: "bg-orange-100 text-orange-600"
        }
    ];

    const quickActions = [
        {
            title: "Manage Students",
            description: "View and manage all students",
            icon: GraduationCap
        },
        {
            title: "Manage Teachers",
            description: "View and manage teachers",
            icon: Users
        },
        {
            title: "Manage Courses",
            description: "Create and manage courses",
            icon: BookPlus
        },
        {
            title: "Manage Users",
            description: "Manage users and permissions",
            icon: ShieldCheck
        },
        {
            title: "Create Notice",
            description: "Publish university announcements",
            icon: Megaphone
        },
        {
            title: "View Reports",
            description: "Check academic reports",
            icon: ClipboardList
        }
    ];

    return (
        <div className="space-y-8">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Admin Dashboard
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Welcome back, {user?.name || "Admin"}!
                        Manage your university from here.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg w-fit">
                    <ShieldCheck size={20} />
                    <span className="font-medium text-sm">
                        Administrator
                    </span>
                </div>

            </div>


            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                {statistics.map((item, index) => {

                    const Icon = item.icon;

                    return (
                        <div
                            key={index}
                            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                        >

                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        {item.title}
                                    </p>

                                    <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                        {item.value}
                                    </h2>
                                </div>

                                <div className={`p-3 rounded-xl ${item.color}`}>
                                    <Icon size={25} />
                                </div>

                            </div>

                            <p className="text-xs text-gray-400 mt-4">
                                Statistics will load from database
                            </p>

                        </div>
                    );
                })}

            </div>


            {/* Quick Actions */}
            <div>

                <div className="flex items-center justify-between mb-5">

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Quick Actions
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Quickly access administration features
                        </p>
                    </div>

                    <ArrowUpRight className="text-gray-400" />

                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

                    {quickActions.map((action, index) => {

                        const Icon = action.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                            >

                                <div className="flex items-center justify-between">

                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                                        <Icon size={23} />
                                    </div>

                                    <ArrowUpRight
                                        size={18}
                                        className="text-gray-400"
                                    />

                                </div>

                                <h3 className="font-semibold text-gray-800 mt-4">
                                    {action.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {action.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </div>


            {/* Recent Activities */}
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

                <div className="flex items-center gap-2 mb-5">
                    <ClipboardList className="text-blue-600" size={22} />

                    <h2 className="text-xl font-bold text-gray-800">
                        Recent Activities
                    </h2>
                </div>

                <div className="text-center py-10">

                    <div className="bg-gray-100 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                        <ClipboardList className="text-gray-400" size={25} />
                    </div>

                    <p className="font-medium text-gray-600">
                        No activities available
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                        Activity records will appear here when connected to the backend.
                    </p>

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;
