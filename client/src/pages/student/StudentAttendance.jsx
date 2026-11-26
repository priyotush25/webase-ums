
import { useEffect, useState } from "react";

import {
    AlertCircle,
    CalendarCheck,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

import { getMyAttendance } from "../../api/attendanceApi";

const StudentAttendance = () => {
    const [data, setData] = useState({
        attendance: [],
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        percentage: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getMyAttendance();

                setData({
                    attendance: response?.attendance || [],
                    total: response?.total || 0,
                    present: response?.present || 0,
                    absent: response?.absent || 0,
                    late: response?.late || 0,
                    excused: response?.excused || 0,
                    percentage: response?.percentage || 0
                });

            } catch (err) {
                setError(err.message || "Failed to load attendance");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const summary = [
        {
            title: "Total Classes",
            value: data.total,
            icon: CalendarCheck,
            color: "bg-blue-100 text-blue-700"
        },
        {
            title: "Present",
            value: data.present,
            icon: CheckCircle,
            color: "bg-green-100 text-green-700"
        },
        {
            title: "Absent",
            value: data.absent,
            icon: XCircle,
            color: "bg-red-100 text-red-700"
        },
        {
            title: "Late",
            value: data.late,
            icon: Clock,
            color: "bg-yellow-100 text-yellow-700"
        }
    ];

    const statusStyle = {
        present: "bg-green-100 text-green-700",
        absent: "bg-red-100 text-red-700",
        late: "bg-yellow-100 text-yellow-700",
        excused: "bg-blue-100 text-blue-700"
    };

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    My Attendance
                </h1>

                <p className="text-sm text-slate-500 mt-1">
                    Track your attendance and academic participation.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                {summary.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        {item.title}
                                    </p>

                                    <h2 className="text-3xl font-bold text-slate-800 mt-3">
                                        {loading ? "..." : item.value}
                                    </h2>
                                </div>

                                <div className={`p-3 rounded-xl ${item.color}`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Attendance Percentage */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">

                <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                        <h2 className="font-bold text-slate-800">
                            Attendance Percentage
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                            Present and late classes divided by total records
                        </p>
                    </div>

                    <span className="text-2xl font-bold text-blue-700">
                        {loading ? "..." : `${data.percentage}%`}
                    </span>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-900 rounded-full transition-all"
                        style={{
                            width: `${Math.min(data.percentage, 100)}%`
                        }}
                    />
                </div>

                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>0%</span>
                    <span>100%</span>
                </div>

            </div>

            {/* Attendance History */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

                <div className="p-5 border-b">
                    <h2 className="font-bold text-slate-800">
                        Attendance History
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-slate-500">
                        Loading attendance...
                    </div>
                ) : data.attendance.length === 0 ? (
                    <div className="p-10 text-center">
                        <AlertCircle className="mx-auto text-slate-300" size={36} />

                        <p className="font-semibold text-slate-700 mt-3">
                            No Attendance Records
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                            Your teacher has not submitted attendance yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="p-4">Course</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4">Teacher</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Remarks</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {data.attendance.map((item) => (
                                    <tr key={item._id}>

                                        <td className="p-4">
                                            <p className="font-semibold text-slate-800">
                                                {item.course?.title || "Course"}
                                            </p>

                                            <p className="text-xs text-slate-400 mt-1">
                                                {item.course?.code || ""}
                                            </p>
                                        </td>

                                        <td className="p-4 whitespace-nowrap text-slate-600">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>

                                        <td className="p-4 text-slate-600">
                                            {item.teacher?.name || "N/A"}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusStyle[item.status] || "bg-slate-100 text-slate-600"}`}>
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-slate-500">
                                            {item.remarks || "—"}
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

export default StudentAttendance;
