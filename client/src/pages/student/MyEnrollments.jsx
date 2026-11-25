
import {
    BookOpen,
    Award,
    CheckCircle,
    Clock,
    RefreshCw,
    XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { getMyEnrollments } from "../../api/enrollmentApi";

const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    dropped: "bg-gray-100 text-gray-700"
};

const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    dropped: RefreshCw
};

const TABS = [
    { key: "active", label: "Active this semester" },
    { key: "completed", label: "Completed" },
    { key: "other", label: "Applications" },
];

// active = approved + course running, completed = approved + course finished
const tabOf = (item) =>
    item.status === "approved"
        ? item.courseState === "completed" ? "completed" : "active"
        : "other";

const MyEnrollments = () => {
    const [tab, setTab] = useState("active");
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            setError("");

            const result = await getMyEnrollments();

            setEnrollments(result.data || []);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Failed to load enrollments";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const visible = enrollments.filter((item) => tabOf(item) === tab);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-60">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        My Enrollments
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Your active courses, completed courses with results, and applications.
                    </p>
                </div>

                <Link
                    to="/student/courses"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <BookOpen size={18} />
                    Browse Courses
                </Link>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

                {[
                    {
                        label: "Active",
                        value: enrollments.filter(item => tabOf(item) === "active").length,
                        color: "text-green-600"
                    },
                    {
                        label: "Completed",
                        value: enrollments.filter(item => tabOf(item) === "completed").length,
                        color: "text-blue-600"
                    },
                    {
                        label: "Pending",
                        value: enrollments.filter(
                            item => item.status === "pending"
                        ).length,
                        color: "text-yellow-600"
                    },
                    {
                        label: "Rejected",
                        value: enrollments.filter(
                            item => item.status === "rejected"
                        ).length,
                        color: "text-red-600"
                    }
                ].map((item) => (
                    <div
                        key={item.label}
                        className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
                    >
                        <p className="text-sm text-gray-500">
                            {item.label}
                        </p>

                        <h2 className={`text-3xl font-bold mt-2 ${item.color}`}>
                            {item.value}
                        </h2>
                    </div>
                ))}

            </div>

            {/* Enrollment List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">

                <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {TABS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setTab(item.key)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                    tab === item.key
                                        ? "bg-blue-900 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {item.label} ({enrollments.filter((row) => tabOf(row) === item.key).length})
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="p-5 text-red-600">
                        {error}

                        <button
                            onClick={fetchEnrollments}
                            className="ml-3 text-blue-600 underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {!error && visible.length === 0 && (
                    <div className="p-10 text-center">
                        <BookOpen
                            size={42}
                            className="mx-auto text-gray-300"
                        />

                        <h3 className="font-semibold text-gray-700 mt-4">
                            Nothing here
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                            {tab === "active" && "No active course this semester."}
                            {tab === "completed" && "No completed course yet."}
                            {tab === "other" && "No pending or rejected application."}
                        </p>

                        <Link
                            to="/student/courses"
                            className="inline-block mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Explore Courses
                        </Link>
                    </div>
                )}

                {!error && visible.length > 0 && (
                    <div className="divide-y divide-gray-100">

                        {visible.map((item) => {
                            const course = item.course || {};
                            const StatusIcon =
                                statusIcons[item.status] || Clock;

                            return (
                                <div
                                    key={item._id}
                                    className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                                >
                                    <div className="flex items-start gap-4">

                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <BookOpen size={24} />
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {course.title || "Course unavailable"}
                                            </h3>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Course Code: {course.code || "N/A"} · {course.credit} credit · {course.semester}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Department: {course.department?.name || "N/A"}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Applied: {
                                                    item.createdAt
                                                        ? new Date(item.createdAt).toLocaleDateString()
                                                        : "N/A"
                                                }
                                            </p>

                                            {item.remarks && (
                                                <p className="text-sm text-gray-600 mt-2">
                                                    <strong>Admin Remarks:</strong>{" "}
                                                    {item.remarks}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:text-right">
                                        <span
                                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium capitalize ${
                                                statusStyles[item.status] ||
                                                "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <StatusIcon size={16} />
                                            {item.status === "approved"
                                                ? item.courseState === "completed" ? "completed" : "active"
                                                : item.status}
                                        </span>

                                        {item.courseState === "completed" && (
                                            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-left text-sm md:text-right">
                                                {item.result ? (
                                                    <>
                                                        <p className="flex items-center gap-1.5 font-semibold text-blue-900 md:justify-end">
                                                            <Award size={16} />
                                                            Grade {item.result.letterGrade} · GPA {Number(item.result.gradePoint).toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-slate-600">
                                                            Total {item.result.total}/100
                                                            {" "}(Assignment {item.result.assignment}, Mid {item.result.midterm}, Final {item.result.final})
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-xs text-slate-600">Result not published yet</p>
                                                )}
                                            </div>
                                        )}

                                        {item.enrolledAt && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Approved: {
                                                    new Date(item.enrolledAt).toLocaleDateString()
                                                }
                                            </p>
                                        )}
                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </div>

        </div>
    );
};

export default MyEnrollments;
