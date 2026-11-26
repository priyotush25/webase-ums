
import { useEffect, useState } from "react";

import {
    GraduationCap,
    Mail,
    RefreshCw,
    Search,
    ShieldCheck,
    Users,
    UserX
} from "lucide-react";

import { toast } from "react-toastify";

import {
    getAllUsers,
    updateUserRole,
} from "../../api/userApi";

// ========================================
// RESPONSE HELPER
// ========================================

const getUsers = (response) => {
    const data = response?.data?.data ?? response?.data ?? response;

    return {
        users: data?.users || [],
        totalUsers: data?.totalUsers ?? data?.total ?? 0,
        totalPages: data?.totalPages ?? 1,
        currentPage: data?.currentPage ?? data?.page ?? 1,
    };
};

// ========================================
// ADMIN TEACHERS
// ========================================

const AdminTeachers = () => {
    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const [search, setSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTeachers, setTotalTeachers] = useState(0);

    // ========================================
    // FETCH TEACHERS
    // ========================================

    const fetchTeachers = async () => {
        try {
            setLoading(true);

            const response = await getAllUsers({
                page,
                limit: 10,
                search,
                role: "teacher",
            });

            const result = getUsers(response);

            setTeachers(result.users);
            setTotalTeachers(result.totalUsers);
            setTotalPages(result.totalPages);
        } catch (error) {
            console.error("Fetch Teachers Error:", error);

            toast.error(
                error?.message || "Failed to load teachers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, search]);

    // ========================================
    // PROMOTE / DEMOTE TEACHER
    // ========================================

    const handleRoleChange = async (teacher, newRole) => {
        const action =
            newRole === "student"
                ? "remove this teacher role"
                : "change this user's role";

        const confirmed = window.confirm(
            `Are you sure you want to ${action}?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(teacher._id);

            await updateUserRole(teacher._id, newRole);

            toast.success(
                newRole === "student"
                    ? "Teacher role removed successfully"
                    : "Role updated successfully"
            );

            await fetchTeachers();
        } catch (error) {
            console.error("Role Update Error:", error);

            toast.error(
                error?.message || "Failed to update user role"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    // ========================================
    // STATISTICS
    // ========================================

    const stats = [
        {
            title: "Total Teachers",
            value: totalTeachers,
            icon: Users,
            color: "bg-blue-100 text-blue-700",
        },
        {
            title: "Current Page",
            value: page,
            icon: GraduationCap,
            color: "bg-purple-100 text-purple-700",
        },
    ];

    // ========================================
    // UI
    // ========================================

    return (
        <div className="space-y-6">

            {/* Header */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Teacher Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage teacher accounts and permissions.
                    </p>
                </div>

                <button
                    onClick={fetchTeachers}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>

            {/* Statistics */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        {stat.title}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                        {stat.value}
                                    </h3>
                                </div>

                                <div className={`rounded-xl p-3 ${stat.color}`}>
                                    <Icon size={22} />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Teacher List */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* Search */}

                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">

                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                            All Teachers
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Registered teacher accounts.
                        </p>
                    </div>

                    <div className="relative">

                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Search teacher..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-600 sm:w-64"
                        />

                    </div>

                </div>

                {/* Loading */}

                {loading ? (
                    <div className="flex justify-center py-16">
                        <RefreshCw
                            size={28}
                            className="animate-spin text-blue-700"
                        />
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="px-5 py-16 text-center">

                        <GraduationCap
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 font-semibold text-slate-800">
                            No teachers found
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Promote a registered user to teacher from User Management.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[700px] text-left">

                            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Teacher</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Role</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {teachers.map((teacher) => (
                                    <tr
                                        key={teacher._id}
                                        className="transition hover:bg-slate-50"
                                    >

                                        {/* Teacher */}

                                        <td className="px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                {teacher.photoURL ? (
                                                    <img
                                                        src={teacher.photoURL}
                                                        alt={teacher.name}
                                                        className="h-10 w-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                                                        {teacher.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "T"}
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {teacher.name || "Unknown"}
                                                    </p>

                                                    <p className="text-xs text-slate-500">
                                                        ID: {teacher._id}
                                                    </p>
                                                </div>

                                            </div>

                                        </td>

                                        {/* Email */}

                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail size={15} />
                                                {teacher.email}
                                            </span>
                                        </td>

                                        {/* Role */}

                                        <td className="px-5 py-4">

                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
                                                <ShieldCheck size={13} />
                                                Teacher
                                            </span>

                                        </td>

                                        {/* Action */}

                                        <td className="px-5 py-4 text-right">

                                            <button
                                                onClick={() =>
                                                    handleRoleChange(
                                                        teacher,
                                                        "student"
                                                    )
                                                }
                                                disabled={updatingId === teacher._id}
                                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            >
                                                <UserX size={15} />

                                                {updatingId === teacher._id
                                                    ? "Updating..."
                                                    : "Remove Role"}
                                            </button>

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

                {/* Pagination */}

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">

                        <p className="text-sm text-slate-500">
                            Page {page} of {totalPages}
                        </p>

                        <div className="flex gap-2">

                            <button
                                onClick={() => setPage((prev) => prev - 1)}
                                disabled={page <= 1}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={page >= totalPages}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    );
};

export default AdminTeachers;
