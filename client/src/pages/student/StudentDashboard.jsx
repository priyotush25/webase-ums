import { Award, BookOpen, CalendarCheck, ClipboardList, Clock, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getStudentAssignments } from "../../api/assignmentApi";
import { getMyAttendance } from "../../api/attendanceApi";
import { getMyEnrollments } from "../../api/enrollmentApi";
import { getMyFees } from "../../api/feeApi";
import { getMyResults } from "../../api/resultApi";
import DashboardInsights from "../../components/dashboard/DashboardInsights";
import { EmptyLine, ErrorBanner, Kpi, KpiGrid, PanelLink, Shortcuts, WorkspaceHeader } from "../../components/dashboard/Workspace";
import { Badge, Card, formatDate } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { taka } from "../../utils/format";

const SHORTCUTS = [
    { title: "Browse courses", description: "Enroll for this semester", icon: BookOpen, path: "/student/courses" },
    { title: "Assignments", description: "Work and due dates", icon: ClipboardList, path: "/student/assignments" },
    { title: "Results", description: "Grades and transcript", icon: Award, path: "/student/results" },
    { title: "Pay fees", description: "Dues and receipts", icon: Wallet, path: "/student/fees" },
];

const STATUS_COLOR = { approved: "green", pending: "amber", rejected: "red", dropped: "slate" };

const StudentDashboard = () => {
    const { user } = useAuth();

    const [enrollments, setEnrollments] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [results, setResults] = useState(null);
    const [fees, setFees] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const [enrollRes, attRes, resultRes, feeRes, assignRes] = await Promise.allSettled([
            getMyEnrollments(),
            getMyAttendance(),
            getMyResults(),
            getMyFees(),
            getStudentAssignments(),
        ]);

        if (enrollRes.status === "fulfilled") {
            const data = enrollRes.value?.enrollments ?? enrollRes.value?.data ?? [];
            setEnrollments(Array.isArray(data) ? data : []);
        } else {
            setError(enrollRes.reason?.message || "Failed to load dashboard data.");
        }

        if (attRes.status === "fulfilled") setAttendance(attRes.value);
        if (resultRes.status === "fulfilled") setResults(resultRes.value);
        if (feeRes.status === "fulfilled") setFees(feeRes.value);
        if (assignRes.status === "fulfilled") setAssignments(assignRes.value.assignments || []);

        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const approved = enrollments.filter((item) => item.status === "approved").length;
    const pending = enrollments.filter((item) => item.status === "pending").length;

    const recent = [...enrollments].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 5);

    const dueSoon = assignments
        .filter((item) => new Date(item.dueDate).getTime() >= Date.now())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    const attendancePct = attendance?.countableClasses ? Math.round(attendance.percentage) : null;
    const attendanceTone = attendancePct !== null && attendancePct < 75 ? "warn" : "default";
    const hasDue = (fees?.totalDue || 0) > 0;

    return (
        <div className="space-y-6">
            <WorkspaceHeader
                name={user?.name || user?.displayName || "Student"}
                subtitle="Your courses, attendance, results and fees."
            />

            {error && <ErrorBanner message={error} onRetry={load} />}

            <KpiGrid>
                <Kpi label="Enrolled courses" value={approved} hint={pending ? `${pending} awaiting approval` : "All approved"} icon={BookOpen} to="/student/enrollments" loading={loading} />
                <Kpi
                    label="Attendance"
                    value={attendancePct !== null ? `${attendancePct}%` : "—"}
                    hint={attendancePct === null ? "No classes recorded" : attendancePct < 75 ? "Below 75%" : `${attendance.present + attendance.late} of ${attendance.countableClasses} classes attended`}
                    icon={CalendarCheck}
                    to="/student/attendance"
                    tone={attendanceTone}
                    loading={loading}
                />
                <Kpi label="CGPA" value={results?.total ? Number(results.cgpa).toFixed(2) : "—"} hint={results?.total ? `${results.totalCredits} credits completed` : "No published results"} icon={Award} to="/student/results" loading={loading} />
                <Kpi
                    label="Fees due"
                    value={fees ? taka(fees.totalDue) : "—"}
                    hint={fees?.overdueCount ? `${fees.overdueCount} overdue` : hasDue ? "Payment pending" : "No dues"}
                    icon={Wallet}
                    to="/student/fees"
                    tone={fees?.overdueCount ? "danger" : "default"}
                    loading={loading}
                />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="My enrollments" action={<PanelLink to="/student/enrollments">View all</PanelLink>} className="lg:col-span-2" flush>
                    {loading ? (
                        <EmptyLine>Loading…</EmptyLine>
                    ) : recent.length === 0 ? (
                        <EmptyLine>You have not enrolled in any course yet.</EmptyLine>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {recent.map((item) => (
                                <li key={item._id} className="flex items-center justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-900">{item.course?.title || "Course"}</p>
                                        <p className="text-xs text-slate-500">
                                            {item.course?.code}
                                            {item.createdAt ? ` · Applied ${formatDate(item.createdAt)}` : ""}
                                        </p>
                                    </div>
                                    <Badge color={STATUS_COLOR[item.status] || "slate"}>{item.status}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Due soon" action={<PanelLink to="/student/assignments">All</PanelLink>} flush>
                    {loading ? (
                        <EmptyLine>Loading…</EmptyLine>
                    ) : dueSoon.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <Clock size={18} className="mx-auto text-slate-300" aria-hidden="true" />
                            <p className="mt-2 text-sm text-slate-500">Nothing due. You are all caught up.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {dueSoon.map((item) => (
                                <li key={item._id} className="px-4 py-3">
                                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-500">
                                        {item.course?.code ? `${item.course.code} · ` : ""}Due {formatDate(item.dueDate)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Quick access</h3>
                <Shortcuts items={SHORTCUTS} columns="sm:grid-cols-2 xl:grid-cols-4" />
            </section>

            <DashboardInsights />
        </div>
    );
};

export default StudentDashboard;
