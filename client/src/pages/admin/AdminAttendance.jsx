
import { useEffect, useState } from "react";

import { CalendarCheck, RefreshCw } from "lucide-react";

import { getAllAttendance } from "../../api/attendanceApi";

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (status) params.status = status;
            if (from) params.from = from;
            if (to) params.to = to;

            const response = await getAllAttendance(params);

            setAttendance(response?.attendance || []);

        } catch (err) {
            setError(err.message || "Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [status, from, to]);

    const counts = {
        present: attendance.filter((item) => item.status === "present").length,
        absent: attendance.filter((item) => item.status === "absent").length,
        late: attendance.filter((item) => item.status === "late").length,
        excused: attendance.filter((item) => item.status === "excused").length
    };

    const statusStyle = {
        present: "bg-green-100 text-green-700",
        absent: "bg-red-100 text-red-700",
        late: "bg-yellow-100 text-yellow-700",
        excused: "bg-blue-100 text-blue-700"
    };

    return (
        <div className="space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Attendance Records
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Monitor attendance across all courses.
                    </p>
                </div>

                <button
                    onClick={fetchAttendance}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                >
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                    {error}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {Object.entries(counts).map(([key, value]) => (
                    <div
                        key={key}
                        className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                    >
                        <p className="text-sm text-gray-500 capitalize">
                            {key}
                        </p>

                        <h2 className="text-2xl font-bold text-gray-800 mt-2">
                            {loading ? "..." : value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border rounded-lg p-3 outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                    </label>

                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="w-full border rounded-lg p-3 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                    </label>

                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="w-full border rounded-lg p-3 outline-none"
                    />
                </div>

            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

                <div className="p-5 border-b flex items-center gap-3">
                    <CalendarCheck className="text-blue-700" />

                    <h2 className="font-bold text-gray-800">
                        All Attendance ({attendance.length})
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading records...
                    </div>
                ) : attendance.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No attendance records found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Teacher</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {attendance.map((item) => (
                                    <tr key={item._id}>

                                        <td className="p-4">
                                            <p className="font-semibold text-gray-800">
                                                {item.student?.name || "N/A"}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {item.student?.email || ""}
                                            </p>
                                        </td>

                                        <td className="p-4">
                                            {item.course?.title || "N/A"}
                                            <p className="text-xs text-gray-400">
                                                {item.course?.code || ""}
                                            </p>
                                        </td>

                                        <td className="p-4 text-gray-600">
                                            {item.teacher?.name || "N/A"}
                                        </td>

                                        <td className="p-4 whitespace-nowrap text-gray-600">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[item.status] || "bg-gray-100 text-gray-600"}`}>
                                                {item.status}
                                            </span>
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

export default AdminAttendance;
