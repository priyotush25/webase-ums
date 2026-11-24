
import {
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    RefreshCw,
    Search,
    ShieldAlert,
    UserRound,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import AcademicRecordModal from "../../components/admin/AcademicRecordModal";
import { getAllUsers, updateUserRole } from "../../api/userApi";

const AdminPeople = ({ role }) => {
    const isStudent = role === "student";

    const title = isStudent ? "Student Management" : "Teacher Management";
    const Icon = isStudent ? GraduationCap : UserRound;

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [academicUser, setAcademicUser] = useState(null);
    const [updating, setUpdating] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getAllUsers({
                page,
                limit: 10,
                search,
                role,
            });

            setUsers(response.data?.users || []);

            setPagination(
                response.data?.pagination || {
                    currentPage: 1,
                    totalPages: 1,
                    totalUsers: 0,
                }
            );
        } catch (error) {
            toast.error(error.message || "Failed to load users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, search, role]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleRoleChange = async (newRole) => {
        if (!selectedUser || updating) return;

        try {
            setUpdating(true);

            await updateUserRole(selectedUser._id, newRole);

            toast.success(
                `User role changed to ${newRole} successfully`
            );

            setSelectedUser(null);
            await fetchUsers();
        } catch (error) {
            toast.error(error.message || "Role update failed");
        } finally {
            setUpdating(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "N/A";

        return new Date(date).toLocaleDateString("en-BD", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Icon size={26} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                {title}
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage and monitor your {role} accounts
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                    <RefreshCw
                        size={17}
                        className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">
                                Total {isStudent ? "Students" : "Teachers"}
                            </p>

                            <h2 className="text-3xl font-bold mt-2 text-gray-800">
                                {pagination.totalUsers}
                            </h2>
                        </div>

                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <Users size={25} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">
                                Current Page
                            </p>

                            <h2 className="text-3xl font-bold mt-2 text-gray-800">
                                {pagination.currentPage} / {pagination.totalPages || 1}
                            </h2>
                        </div>

                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                            <Icon size={25} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="relative">
                    <Search
                        size={19}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder={`Search ${role} by name or email...`}
                        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* User Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                <div className="px-5 py-4 border-b">
                    <h2 className="font-semibold text-gray-800">
                        {isStudent ? "Student List" : "Teacher List"}
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">

                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-4">User</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Role</th>
                                <th className="px-5 py-4">Joined</th>
                                <th className="px-5 py-4">Action</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        No {role} found.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img
                                                        src={user.photoURL}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                    </div>
                                                )}

                                                <span>
                                                    <span className="block font-medium text-gray-800">
                                                        {user.name}
                                                    </span>
                                                    <span className="block text-xs text-gray-500">
                                                        {user.universityId || "No ID"}
                                                        {user.department?.code ? ` · ${user.department.code}` : ""}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {user.email}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                isStudent
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "bg-purple-100 text-purple-700"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-gray-600">
                                            {formatDate(user.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => setAcademicUser(user)}
                                                className="mr-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100"
                                            >
                                                Academic Record
                                            </button>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            >
                                                Change Role
                                            </button>
                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-5 py-4 border-t">

                    <p className="text-sm text-gray-500">
                        Total {pagination.totalUsers} users
                    </p>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((prev) => prev - 1)}
                            className="p-2 border rounded-lg disabled:opacity-40"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <span className="text-sm font-medium">
                            {page} / {pagination.totalPages || 1}
                        </span>

                        <button
                            disabled={page >= pagination.totalPages || loading}
                            onClick={() => setPage((prev) => prev + 1)}
                            className="p-2 border rounded-lg disabled:opacity-40"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Change Role Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">

                        <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mx-auto">
                            <ShieldAlert size={25} />
                        </div>

                        <h2 className="text-xl font-bold text-center mt-4">
                            Change User Role
                        </h2>

                        <p className="text-sm text-gray-500 text-center mt-2">
                            Change the role of {selectedUser.name}.
                        </p>

                        <div className="mt-5 space-y-3">

                            {["student", "teacher", "admin"]
                                .filter((item) => item !== selectedUser.role)
                                .map((item) => (
                                    <button
                                        key={item}
                                        disabled={updating}
                                        onClick={() => handleRoleChange(item)}
                                        className="w-full border rounded-lg p-3 text-left capitalize hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
                                    >
                                        Change to {item}
                                    </button>
                                ))}

                        </div>

                        <button
                            onClick={() => setSelectedUser(null)}
                            disabled={updating}
                            className="w-full mt-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}


            <AcademicRecordModal
                user={academicUser}
                onClose={() => setAcademicUser(null)}
                onSaved={fetchUsers}
            />

        </div>
    );
};

export default AdminPeople;
