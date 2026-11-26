
import { useEffect, useState } from "react";

import {
    CalendarCheck,
    Save,
    Users
} from "lucide-react";

import { getMyTeachingCourses } from "../../api/courseApi";

import {
    getCourseAttendance,
    getCourseStudentsForAttendance,
    saveCourseAttendance
} from "../../api/attendanceApi";

const today = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const TeacherAttendance = () => {
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [date, setDate] = useState(today());

    const [students, setStudents] = useState([]);
    const [records, setRecords] = useState({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await getMyTeachingCourses();

                const data =
                    response?.courses ??
                    response?.data?.courses ??
                    [];

                setCourses(data);

                if (data.length) {
                    setCourseId(data[0]._id);
                }
            } catch (err) {
                setError(err.message);
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        if (!courseId || !date) return;

        const fetchStudentsAndAttendance = async () => {
            try {
                setLoading(true);
                setError("");
                setMessage("");

                const [studentResponse, attendanceResponse] =
                    await Promise.all([
                        getCourseStudentsForAttendance(courseId),
                        getCourseAttendance(courseId, date)
                    ]);

                const studentList =
                    studentResponse?.students ??
                    studentResponse?.data?.students ??
                    [];

                const attendanceList =
                    attendanceResponse?.attendance ??
                    attendanceResponse?.data?.attendance ??
                    [];

                const attendanceMap = {};

                attendanceList.forEach((item) => {
                    const studentId =
                        item.student?._id || item.student;

                    attendanceMap[studentId] = {
                        status: item.status,
                        remarks: item.remarks || ""
                    };
                });

                const nextRecords = {};

                studentList.forEach((student) => {
                    nextRecords[student._id] =
                        attendanceMap[student._id] || {
                            status: "present",
                            remarks: ""
                        };
                });

                setStudents(studentList);
                setRecords(nextRecords);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentsAndAttendance();
    }, [courseId, date]);

    const updateStatus = (studentId, status) => {
        setRecords((previous) => ({
            ...previous,
            [studentId]: {
                ...previous[studentId],
                status
            }
        }));
    };

    const updateRemarks = (studentId, remarks) => {
        setRecords((previous) => ({
            ...previous,
            [studentId]: {
                ...previous[studentId],
                remarks
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            const attendanceRecords = students.map((student) => ({
                studentId: student._id,
                status: records[student._id]?.status || "present",
                remarks: records[student._id]?.remarks || ""
            }));

            await saveCourseAttendance(
                courseId,
                date,
                attendanceRecords
            );

            setMessage("Attendance saved successfully!");

        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const counts = {
        present: Object.values(records).filter(
            (item) => item.status === "present"
        ).length,

        absent: Object.values(records).filter(
            (item) => item.status === "absent"
        ).length,

        late: Object.values(records).filter(
            (item) => item.status === "late"
        ).length,

        excused: Object.values(records).filter(
            (item) => item.status === "excused"
        ).length
    };

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Attendance Management
                </h1>

                <p className="text-slate-500 text-sm mt-1">
                    Manage attendance for your assigned courses.
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Select Course
                    </label>

                    <select
                        value={courseId}
                        onChange={(e) => setCourseId(e.target.value)}
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                                {course.title} ({course.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Attendance Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

            </div>

            {/* Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
                    {message}
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {Object.entries(counts).map(([status, count]) => (
                    <div
                        key={status}
                        className="bg-white p-4 rounded-xl border border-slate-100"
                    >
                        <p className="text-sm text-slate-500 capitalize">
                            {status}
                        </p>

                        <h3 className="text-2xl font-bold mt-2 text-slate-800">
                            {count}
                        </h3>
                    </div>
                ))}

            </div>

            {/* Student List */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

                <div className="p-5 border-b flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Users className="text-blue-700" />

                        <h2 className="font-bold text-slate-800">
                            Student List ({students.length})
                        </h2>
                    </div>

                    <CalendarCheck className="text-slate-400" />
                </div>

                {loading ? (
                    <div className="p-10 text-center text-slate-500">
                        Loading students...
                    </div>
                ) : students.length === 0 ? (
                    <div className="p-10 text-center text-slate-500">
                        No approved students found for this course.
                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full text-sm text-left">

                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Remarks</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y">

                                {students.map((student) => (
                                    <tr key={student._id}>

                                        <td className="p-4 font-semibold text-slate-800 whitespace-nowrap">
                                            {student.name}
                                        </td>

                                        <td className="p-4 text-slate-500">
                                            {student.email}
                                        </td>

                                        <td className="p-4">
                                            <select
                                                value={records[student._id]?.status || "present"}
                                                onChange={(e) =>
                                                    updateStatus(
                                                        student._id,
                                                        e.target.value
                                                    )
                                                }
                                                className="border rounded-lg p-2 outline-none"
                                            >
                                                <option value="present">Present</option>
                                                <option value="absent">Absent</option>
                                                <option value="late">Late</option>
                                                <option value="excused">Excused</option>
                                            </select>
                                        </td>

                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={records[student._id]?.remarks || ""}
                                                onChange={(e) =>
                                                    updateRemarks(
                                                        student._id,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Optional remarks"
                                                className="border rounded-lg p-2 min-w-40 outline-none"
                                            />
                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                )}

                <div className="p-5 border-t flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || loading || students.length === 0}
                        className="flex items-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                        <Save size={18} />

                        {saving ? "Saving..." : "Save Attendance"}
                    </button>
                </div>

            </div>

        </div>
    );
};

export default TeacherAttendance;
