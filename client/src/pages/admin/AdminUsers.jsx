import { ChevronLeft, ChevronRight, RefreshCw, Search, ShieldAlert, Trash2, TriangleAlert, UserCheck, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { deleteUser, getAllUsers, updateUserRole, updateUserStatus } from "../../api/userApi";
import { Avatar, Badge, Card, EmptyState, Modal, PageHeader, Skeleton, formatDate, ghostBtn, inputClass, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const ROLE_COLOR = { admin: "purple", teacher: "green", student: "blue" };

const dangerBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";

const UserCell = ({ user }) => (
    <div className="flex min-w-0 items-center gap-3">
        <Avatar user={user} size="h-10 w-10" />
        <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-sm text-slate-600">{user.email}</p>
        </div>
    </div>
);

const AdminUsers = () => {
    const { user: me } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [role, setRole] = useState("all");
    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalUsers: 0, limit: 10 });

    const [updatingId, setUpdatingId] = useState(null);
    const [pendingRoleChange, setPendingRoleChange] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const isSelf = (user) => Boolean((me?.id || me?._id) && user._id === (me.id || me._id));

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getAllUsers({ page, limit: 10, search, role });

            setUsers(response.data.users || []);
            setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalUsers: 0, limit: 10 });
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

    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const handleFilter = (value) => {
        setRole(value);
        setPage(1);
    };

    // ---- Role change ----
    const handleRoleChange = (user, newRole) => {
        if (user.role === newRole) return;
        setPendingRoleChange({ user, newRole });
    };

    const confirmRoleChange = async () => {
        if (!pendingRoleChange || updatingId) return;

        const { user, newRole } = pendingRoleChange;

        try {
            setUpdatingId(user._id);

            await updateUserRole(user._id, newRole);

            toast.success("User role updated successfully");
            setPendingRoleChange(null);
            await fetchUsers();
        } catch (error) {
            toast.error(error.message || "Failed to update user role");
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelRoleChange = () => {
        if (updatingId !== null) return;
        setPendingRoleChange(null);
    };

    // ---- Activate / deactivate ----
    const handleStatusToggle = async (user) => {
        if (updatingId) return;

        try {
            setUpdatingId(user._id);

            const response = await updateUserStatus(user._id, user.isActive === false);

            setUsers((previous) => previous.map((item) => (item._id === user._id ? { ...item, ...response.data } : item)));
            toast.success(response.message);
        } catch (error) {
            toast.error(error.message || "Failed to update user status");
        } finally {
            setUpdatingId(null);
        }
    };

    // ---- Delete ----
    const confirmDelete = async () => {
        if (!pendingDelete || deleting) return;

        try {
            setDeleting(true);

            await deleteUser(pendingDelete._id);

            toast.success(`${pendingDelete.name} was deleted`);
            setPendingDelete(null);

            // Step back a page when the last row of a page was removed
            if (users.length === 1 && page > 1) setPage((previous) => previous - 1);
            else await fetchUsers();
        } catch (error) {
            toast.error(error.message || "Failed to delete user");
        } finally {
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        if (deleting) return;
        setPendingDelete(null);
    };

    return (
        <div className="space-y-6">
            <PageHeader title="User Management" subtitle="Manage all students, teachers and administrators.">
                <button type="button" onClick={fetchUsers} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />
                    Refresh
                </button>
            </PageHeader>

            {/* Search and filter */}
            <Card>
                <div className="flex flex-col gap-3 md:flex-row">
                    <div className="relative flex-1">
                        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => handleSearch(event.target.value)}
                            placeholder="Search by name, email or ID..."
                            aria-label="Search users"
                            className={`${inputClass} pl-10`}
                        />
                    </div>

                    <select value={role} onChange={(event) => handleFilter(event.target.value)} aria-label="Filter by role" className={`${inputClass} md:w-48`}>
                        <option value="all">All roles</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </Card>

            {/* Users table */}
            <Card flush>
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                        <Users size={18} className="text-slate-600" aria-hidden="true" />
                        <h3 className="text-base font-semibold text-slate-900">All users</h3>
                    </div>

                    <span className="tabular text-sm font-medium text-slate-700">{pagination.totalUsers} total</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left text-[15px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-700">
                                <th className="px-5 py-3 font-semibold">User</th>
                                <th className="px-5 py-3 font-semibold">Role</th>
                                <th className="px-5 py-3 font-semibold">Joined</th>
                                <th className="px-5 py-3 font-semibold">Change role</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index}>
                                        <td colSpan="6" className="px-5 py-4">
                                            <Skeleton className="h-6 w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-6">
                                        <EmptyState icon={Users} title="No users found" text="Try a different search or role filter." />
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const self = isSelf(user);
                                    const busy = updatingId === user._id;

                                    return (
                                        <tr key={user._id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3.5">
                                                <UserCell user={user} />
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <Badge color={ROLE_COLOR[user.role] || "slate"}>{user.role}</Badge>
                                            </td>

                                            <td className="px-5 py-3.5 text-slate-700">{formatDate(user.createdAt)}</td>

                                            <td className="px-5 py-3.5">
                                                <select
                                                    value={user.role}
                                                    disabled={busy || self}
                                                    onChange={(event) => handleRoleChange(user, event.target.value)}
                                                    aria-label={`Change role for ${user.name}`}
                                                    title={self ? "You cannot change your own role" : undefined}
                                                    className={`${inputClass} w-32 py-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>

                                            <td className="px-5 py-3.5">
                                                <button
                                                    type="button"
                                                    disabled={busy || self}
                                                    onClick={() => handleStatusToggle(user)}
                                                    title={self ? "You cannot deactivate your own account" : user.isActive === false ? "Click to activate" : "Click to deactivate"}
                                                    className="rounded-md disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <Badge color={user.isActive === false ? "red" : "green"}>{user.isActive === false ? "Inactive" : "Active"}</Badge>
                                                </button>
                                            </td>

                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => setPendingDelete(user)}
                                                    disabled={self || busy}
                                                    aria-label={`Delete ${user.name}`}
                                                    title={self ? "You cannot delete your own account" : "Delete user"}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
                                                >
                                                    <Trash2 size={16} aria-hidden="true" />
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-700">
                        Page <span className="tabular font-semibold">{pagination.currentPage}</span> of <span className="tabular font-semibold">{pagination.totalPages || 1}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((previous) => previous - 1)} className={ghostBtn}>
                            <ChevronLeft size={16} aria-hidden="true" /> Previous
                        </button>

                        <button type="button" disabled={page >= pagination.totalPages || loading} onClick={() => setPage((previous) => previous + 1)} className={ghostBtn}>
                            Next <ChevronRight size={16} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* Role change confirmation */}
            <Modal open={Boolean(pendingRoleChange)} title="Confirm role change" onClose={cancelRoleChange}>
                {pendingRoleChange && (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <UserCell user={pendingRoleChange.user} />

                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                                <div>
                                    <p className="text-sm text-slate-600">Current role</p>
                                    <p className="mt-1 font-semibold capitalize text-slate-900">{pendingRoleChange.user.role}</p>
                                </div>

                                <span className="text-xl text-slate-500" aria-hidden="true">
                                    →
                                </span>

                                <div className="text-right">
                                    <p className="text-sm text-slate-600">New role</p>
                                    <p className="mt-1 font-semibold capitalize text-blue-900">{pendingRoleChange.newRole}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <p>Changing this role will affect the user's dashboard access and permissions.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <button type="button" onClick={cancelRoleChange} disabled={updatingId !== null} className={ghostBtn}>
                                Cancel
                            </button>

                            <button type="button" onClick={confirmRoleChange} disabled={updatingId !== null} className={primaryBtn}>
                                <UserCheck size={16} aria-hidden="true" />
                                {updatingId !== null ? "Updating..." : "Confirm change"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete confirmation */}
            <Modal open={Boolean(pendingDelete)} title="Delete user" onClose={cancelDelete}>
                {pendingDelete && (
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                                <TriangleAlert size={22} aria-hidden="true" />
                            </span>

                            <div>
                                <p className="text-base font-semibold text-slate-900">Are you sure you want to delete this user?</p>
                                <p className="mt-1 text-sm text-slate-600">This action cannot be undone.</p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <UserCell user={pendingDelete} />
                            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 text-sm text-slate-700">
                                Role:
                                <Badge color={ROLE_COLOR[pendingDelete.role] || "slate"}>{pendingDelete.role}</Badge>
                            </div>
                        </div>

                        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                            <p>
                                {pendingDelete.role === "student"
                                    ? "The account and the student's enrollments, attendance, results and fee records will be removed."
                                    : pendingDelete.role === "teacher"
                                    ? "The account will be removed and the teacher will be unassigned from their courses."
                                    : "The administrator account will be removed and can no longer sign in."}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <button type="button" onClick={cancelDelete} disabled={deleting} className={ghostBtn}>
                                Cancel
                            </button>

                            <button type="button" onClick={confirmDelete} disabled={deleting} className={dangerBtn}>
                                <Trash2 size={16} aria-hidden="true" />
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;
