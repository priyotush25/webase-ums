
import {
    RefreshCw,
    Search,
    ShieldAlert,
    Users,
    X
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    getAllUsers,
    updateUserRole
} from "../../api/userApi";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10
    });

    const [updatingId, setUpdatingId] = useState(null);
    const [pendingRoleChange, setPendingRoleChange] = useState(null);

    // Fetch Users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getAllUsers({
                page,
                limit: 10,
                search,
                role
            });

            setUsers(response.data.users || []);

            setPagination(response.data.pagination || {
                currentPage: 1,
                totalPages: 1,
                totalUsers: 0,
                limit: 10
            });

        } catch (error) {
            console.error("Fetch Users Error:", error);
            toast.error(error.message || "Failed to fetch users");

        } finally {
            setLoading(false);
        }
    }, [page, search, role]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Search Handler
    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    // Role Filter
    const handleFilter = (value) => {
        setRole(value);
        setPage(1);
    };

    // Open Role Confirmation Modal
    const handleRoleChange = (user, newRole) => {
        if (user.role === newRole) return;

        setPendingRoleChange({
            user,
            newRole
        });
    };

    // Confirm Role Change
    const confirmRoleChange = async () => {
        if (!pendingRoleChange || updatingId) return;

        const { user, newRole } = pendingRoleChange;

        try {
            setUpdatingId(user._id);

            const response = await updateUserRole(
                user._id,
                newRole
            );

            // Update User in Current Table
            setUsers((previousUsers) =>
                previousUsers.map((item) =>
                    item._id === user._id
                        ? response.data
                        : item
                )
            );

            toast.success("User role updated successfully");

            setPendingRoleChange(null);

            // Refresh data to keep filters and pagination accurate
            await fetchUsers();

        } catch (error) {
            console.error("Role Update Error:", error);
            toast.error(error.message || "Failed to update user role");

        } finally {
            setUpdatingId(null);
        }
    };

    // Cancel Role Change
    const cancelRoleChange = () => {
        if (updatingId !== null) return;

        setPendingRoleChange(null);
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        User Management
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage all students, teachers and administrators.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchUsers}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "animate-spin" : ""}
                    />

                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <Users size={23} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Total Users
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800">
                                {pagination.totalUsers}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-green-600">
                            <Users size={23} />
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Current Page
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800">
                                {pagination.currentPage} / {pagination.totalPages}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            {/* Search and Filter */}
            <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row">

                <div className="relative flex-1">
                    <Search
                        size={19}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full rounded-lg border py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
                    />
                </div>

                <select
                    value={role}
                    onChange={(e) => handleFilter(e.target.value)}
                    className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
                >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="teacher">Teachers</option>
                    <option value="admin">Admins</option>
                </select>

            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[750px] text-left">

                        <thead className="bg-gray-50 text-sm text-gray-600">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4">Change Role</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">

                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-gray-500"
                                    >
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="py-12 text-center text-gray-500"
                                    >
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gray-50"
                                    >

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        user.photoURL ||
                                                        "https://placehold.co/40x40"
                                                    }
                                                    alt={user.name || "User"}
                                                    className="h-10 w-10 rounded-full object-cover"
                                                />

                                                <span className="font-medium text-gray-800">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.email}
                                        </td>

                                        {/* Current Role */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                    user.role === "admin"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : user.role === "teacher"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>

                                        {/* Change Role */}
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                disabled={updatingId === user._id}
                                                onChange={(e) =>
                                                    handleRoleChange(
                                                        user,
                                                        e.target.value
                                                    )
                                                }
                                                className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:opacity-50"
                                            >
                                                <option value="student">
                                                    Student
                                                </option>

                                                <option value="teacher">
                                                    Teacher
                                                </option>

                                                <option value="admin">
                                                    Admin
                                                </option>
                                            </select>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-gray-500">
                        Total: {pagination.totalUsers} users
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((previous) => previous - 1)}
                            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="text-sm font-medium text-gray-700">
                            {pagination.currentPage} / {pagination.totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={
                                page >= pagination.totalPages || loading
                            }
                            onClick={() => setPage((previous) => previous + 1)}
                            className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div>

            {/* Role Change Confirmation Modal */}
            {pendingRoleChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="role-modal-title"
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                    >

                        {/* Modal Header */}
                        <div className="mb-5 flex items-start justify-between">

                            <div>
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <ShieldAlert size={28} />
                                </div>

                                <h2
                                    id="role-modal-title"
                                    className="text-xl font-bold text-gray-800"
                                >
                                    Confirm Role Change
                                </h2>

                                <p className="mt-2 text-sm text-gray-500">
                                    Are you sure you want to change this user's role?
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={cancelRoleChange}
                                disabled={updatingId !== null}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        {/* User Information */}
                        <div className="mb-5 space-y-4 rounded-xl bg-gray-50 p-4">

                            <div className="flex items-center gap-3">
                                <img
                                    src={
                                        pendingRoleChange.user.photoURL ||
                                        "https://placehold.co/48x48"
                                    }
                                    alt={pendingRoleChange.user.name || "User"}
                                    className="h-12 w-12 rounded-full object-cover"
                                />

                                <div>
                                    <p className="font-semibold text-gray-800">
                                        {pendingRoleChange.user.name}
                                    </p>

                                    <p className="break-all text-sm text-gray-500">
                                        {pendingRoleChange.user.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t pt-4">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        Current Role
                                    </p>

                                    <p className="mt-1 font-semibold capitalize text-gray-700">
                                        {pendingRoleChange.user.role}
                                    </p>
                                </div>

                                <span className="text-xl text-gray-400">
                                    →
                                </span>

                                <div>
                                    <p className="text-xs text-gray-500">
                                        New Role
                                    </p>

                                    <p className="mt-1 font-semibold capitalize text-blue-600">
                                        {pendingRoleChange.newRole}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Warning */}
                        <div className="mb-6 flex gap-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                            <ShieldAlert size={18} className="shrink-0" />

                            <p>
                                Changing this role will affect the user's dashboard access and permissions.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={cancelRoleChange}
                                disabled={updatingId !== null}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmRoleChange}
                                disabled={updatingId !== null}
                                className="rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {updatingId !== null
                                    ? "Updating..."
                                    : "Confirm Change"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminUsers;
