import {
    BookOpen,
    CalendarCheck,
    ClipboardCheck,
    FileText,
    GraduationCap,
    UserRound,
    Users,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import { getSummary } from "../../api/reportApi";
import { getUserStats } from "../../api/userApi";
import DashboardInsights from "../../components/dashboard/DashboardInsights";
import { EmptyLine, ErrorBanner, Kpi, KpiGrid, PanelLink, Shortcuts, WorkspaceHeader } from "../../components/dashboard/Workspace";
import { Card, ProgressBar } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const MODULES = [
    { title: "Admissions", description: "Review applications", icon: ClipboardCheck, path: "/admin/admissions" },
    { title: "Students", description: "Records and academic status", icon: GraduationCap, path: "/admin/students" },
    { title: "Teachers", description: "Faculty and designations", icon: UserRound, path: "/admin/teachers" },
    { title: "Courses", description: "Catalogue, capacity, teachers", icon: BookOpen, path: "/admin/courses" },
    { title: "Reports", description: "University-wide summary", icon: FileText, path: "/admin/reports" },
];

const AdminDashboard = () => {
    const { user } = useAuth();

    const [people, setPeople] = useState(null);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        const [stats, report] = await Promise.allSettled([getUserStats(), getSummary()]);

        if (stats.status === "fulfilled") {
            setPeople({
                total: stats.value.data?.totalUsers ?? 0,
                student: stats.value.data?.totalStudents ?? 0,
                teacher: stats.value.data?.totalTeachers ?? 0,
                admin: stats.value.data?.totalAdmins ?? 0,
            });
        }

        if (report.status === "fulfilled") setSummary(report.value);

        if (stats.status === "rejected" && report.status === "rejected") {
            setError(stats.reason?.message || "Failed to load dashboard data.");
        }

        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const admissions = summary?.admissions || {};
    const pendingAdmissions = (admissions.pending || 0) + (admissions.under_review || 0);
    const courseLoad = summary?.courseLoad || [];

    const roleRows = people
        ? [
              { label: "Students", value: people.student },
              { label: "Teachers", value: people.teacher },
              { label: "Admins", value: people.admin },
          ]
        : [];

    const pct = (value) => (people?.total ? Math.round((value / people.total) * 100) : 0);

    return (
        <div className="space-y-6">
            <WorkspaceHeader
                name={user?.name || user?.displayName || "Admin"}
                subtitle="University operations at a glance."
                onRefresh={() => load(true)}
                refreshing={refreshing}
            />

            {error && <ErrorBanner message={error} onRetry={() => load()} />}

            <KpiGrid>
                <Kpi label="Students" value={people?.student?.toLocaleString()} hint={`${people?.total ?? 0} registered users`} icon={GraduationCap} to="/admin/students" loading={loading} />
                <Kpi label="Teachers" value={people?.teacher?.toLocaleString()} hint="Active faculty accounts" icon={Users} to="/admin/teachers" loading={loading} />
                <Kpi label="Courses" value={summary?.totals?.courses} hint={`${summary?.totals?.enrollments ?? 0} approved enrollments`} icon={BookOpen} to="/admin/courses" loading={loading} />
                <Kpi
                    label="Pending admissions"
                    value={summary ? pendingAdmissions : undefined}
                    hint={pendingAdmissions ? "Waiting for review" : "Nothing waiting"}
                    icon={ClipboardCheck}
                    to="/admin/admissions"
                    tone={pendingAdmissions ? "warn" : "default"}
                    loading={loading}
                />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Course seat usage */}
                <Card
                    title="Course seat usage"
                    subtitle="Most enrolled courses"
                    action={<PanelLink to="/admin/courses">All courses</PanelLink>}
                    className="lg:col-span-2"
                    flush
                >
                    {loading ? (
                        <EmptyLine>Loading…</EmptyLine>
                    ) : courseLoad.length === 0 ? (
                        <EmptyLine>No courses have been created yet.</EmptyLine>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-xs font-medium text-slate-500">
                                        <th className="px-4 py-2 font-medium">Course</th>
                                        <th className="px-4 py-2 text-right font-medium">Enrolled</th>
                                        <th className="w-40 px-4 py-2 font-medium">Seats filled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courseLoad.slice(0, 6).map((course) => {
                                        const used = course.capacity ? Math.round((course.enrolled / course.capacity) * 100) : 0;

                                        return (
                                            <tr key={course._id}>
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium text-slate-900">{course.title}</p>
                                                    <p className="text-xs text-slate-500">{course.code}</p>
                                                </td>
                                                <td className="tabular px-4 py-2.5 text-right text-slate-700">
                                                    {course.enrolled}
                                                    <span className="text-slate-400"> / {course.capacity}</span>
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <ProgressBar value={used} tone={used >= 90 ? "red" : used >= 70 ? "amber" : "blue"} />
                                                        <span className="tabular w-9 shrink-0 text-right text-xs text-slate-500">{used}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* People */}
                <div className="space-y-4">
                    <Card title="People">
                        {loading ? (
                            <p className="text-sm text-slate-500">Loading…</p>
                        ) : (
                            <ul className="space-y-3">
                                {roleRows.map((row) => (
                                    <li key={row.label}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="text-slate-600">{row.label}</span>
                                            <span className="tabular font-medium text-slate-900">
                                                {row.value} <span className="font-normal text-slate-400">· {pct(row.value)}%</span>
                                            </span>
                                        </div>
                                        <ProgressBar value={pct(row.value)} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            {/* Attendance snapshot + modules */}
            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Attendance rate" subtitle="Across all recorded classes" action={<PanelLink to="/admin/attendance">Details</PanelLink>}>
                    <div className="flex items-center gap-3">
                        <CalendarCheck size={18} className="text-slate-400" aria-hidden="true" />
                        <p className="tabular text-2xl font-semibold text-slate-900">
                            {loading ? "…" : summary?.attendanceRate != null ? `${summary.attendanceRate}%` : "—"}
                        </p>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                        {summary?.attendanceRate == null && !loading ? "No attendance has been recorded yet." : "Present and late count as attended."}
                    </p>
                </Card>

                <div className="lg:col-span-2">
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">Modules</h3>
                        <Link to="/admin/reports" className="text-xs font-medium text-blue-900 hover:underline">
                            View reports
                        </Link>
                    </div>

                    <Shortcuts items={MODULES} columns="sm:grid-cols-2 xl:grid-cols-3" />
                </div>
            </div>

            <DashboardInsights />
        </div>
    );
};

export default AdminDashboard;
