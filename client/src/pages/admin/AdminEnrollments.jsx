
import {
    BookOpen,
    CheckCircle,
    RefreshCw,
    Search,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
    getAllEnrollments,
    updateEnrollmentStatus
} from "../../api/enrollmentApi";

const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    dropped: "bg-slate-100 text-slate-700"
};

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");

    const [remarks, setRemarks] = useState({});
    const [updatingId, setUpdatingId] = useState(null);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);

            const result = await getAllEnrollments({
                search,
                status
            });

            setEnrollments(result.data || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to load enrollments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, [search, status]);

    const handleStatusUpdate = async (enrollmentId, newStatus) => {
        const confirmed = window.confirm(
            `Are you sure you want to ${newStatus} this enrollment?`
        );

        if (!confirmed) return;

        try {
            setUpdatingId(enrollmentId);

            await updateEnrollmentStatus(
                enrollmentId,
                newStatus,
                remarks[enrollmentId] || ""
            );

            toast.success(
                `Enrollment ${newStatus} successfully`
            );

            await fetchEnrollments();

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to update enrollment"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const pendingCount = enrollments.filter(
        item => item.status === "pending"
    ).length;

    const approvedCount = enrollments.filter(
        item => item.status === "approved"
    ).length;

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Enrollment Management
                </h1>

                <p className="text-slate-500 mt-1">
                    Review and manage student course applications.
                </p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Total Enrollments</p>
                    <h2 className="text-3xl font-bold mt-2 text-blue-900">
                        {enrollments.length}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Pending Requests</p>
                    <h2 className="text-3xl font-bold mt-2 text-yellow-600">
                        {pendingCount}
                    </h2>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-sm text-slate-500">Approved</p>
                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                        {approvedCount}
                    </h2>
                </div>

            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">

                <div className="flex flex-col md:flex-row gap-4">

                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search student, email or course..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="px-4 py-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="dropped">Dropped</option>
                    </select>

                    <button
                        onClick={fetchEnrollments}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">

                <div className="p-5 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800">
                        Student Enrollment Requests
                    </h2>
                </div>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="p-12 text-center">
                        <BookOpen
                            size={40}
                            className="mx-auto text-slate-300"
                        />

                        <p className="text-slate-500 mt-3">
                            No enrollment requests found.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Course</th>
                                    <th className="px-5 py-4">Applied Date</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 min-w-64">Remarks</th>
                                    <th className="px-5 py-4">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {enrollments.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50">

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {item.student?.name || "Unknown"}
                                            </p>

                                            <p className="text-slate-500 text-xs mt-1">
                                                {item.student?.email || "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800">
                                                {item.course?.title || "Unknown"}
                                            </p>

                                            <p className="text-slate-500 text-xs mt-1">
                                                {item.course?.code || "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-slate-600">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                                    statusStyles[item.status] ||
                                                    "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <input
                                                type="text"
                                                value={remarks[item._id] ?? item.remarks ?? ""}
                                                onChange={(e) =>
                                                    setRemarks(prev => ({
                                                        ...prev,
                                                        [item._id]: e.target.value
                                                    }))
                                                }
                                                placeholder="Optional remarks"
                                                className="w-full min-w-48 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">

                                                {item.status !== "approved" && (
                                                    <button
                                                        disabled={updatingId === item._id}
                                                        onClick={() =>
                                                            handleStatusUpdate(item._id, "approved")
                                                        }
                                                        title="Approve"
                                                        className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}

                                                {item.status !== "rejected" && (
                                                    <button
                                                        disabled={updatingId === item._id}
                                                        onClick={() =>
                                                            handleStatusUpdate(item._id, "rejected")
                                                        }
                                                        title="Reject"
                                                        className="p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}

                                                {item.status !== "dropped" && (
                                                    <button
                                                        disabled={updatingId === item._id}
                                                        onClick={() =>
                                                            handleStatusUpdate(item._id, "dropped")
                                                        }
                                                        title="Mark as dropped"
                                                        className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                                    >
                                                        <RefreshCw size={18} />
                                                    </button>
                                                )}

                                            </div>
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>

                    </div>
                )}

            </div>

        </div>
    );
};

export default AdminEnrollments;
