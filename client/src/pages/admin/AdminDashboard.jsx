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
              { label: "Students", value: people.student, tone: "blue" },
              { label: "Teachers", value: people.teacher, tone: "green" },
              { label: "Admins", value: people.admin, tone: "amber" },
          ]
        : [];

    const pct = (value) => (people?.total ? Math.round((value / people.total) * 100) : 0);

    return (
        <div className="space-y-7">
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

            <div className="grid gap-5 lg:grid-cols-3">
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
                            <table className="w-full text-left text-[15px]">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-700">
                                        <th className="px-5 py-3 font-semibold">Course</th>
                                        <th className="px-5 py-3 text-right font-semibold">Enrolled</th>
                                        <th className="w-52 px-5 py-3 font-semibold">Seats filled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courseLoad.slice(0, 6).map((course) => {
                                        const used = course.capacity ? Math.round((course.enrolled / course.capacity) * 100) : 0;

                                        return (
                                            <tr key={course._id}>
                                                <td className="px-5 py-3.5">
                                                    <p className="font-semibold text-slate-900">{course.title}</p>
                                                    <p className="text-sm text-slate-600">{course.code}</p>
                                                </td>
                                                <td className="tabular px-5 py-3.5 text-right text-slate-800">
                                                    {course.enrolled}
                                                    <span className="text-slate-400"> / {course.capacity}</span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <ProgressBar value={used} tone={used >= 90 ? "red" : used >= 70 ? "amber" : "blue"} />
                                                        <span className="tabular w-10 shrink-0 text-right text-sm font-medium text-slate-700">{used}%</span>
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
                            <p className="text-sm text-slate-600">Loading…</p>
                        ) : (
                            <ul className="space-y-3">
                                {roleRows.map((row) => (
                                    <li key={row.label}>
                                        <div className="mb-1.5 flex justify-between text-[15px]">
                                            <span className="font-medium text-slate-700">{row.label}</span>
                                            <span className="tabular font-semibold text-slate-900">
                                                {row.value} <span className="font-normal text-slate-600">· {pct(row.value)}%</span>
                                            </span>
                                        </div>
                                        <ProgressBar value={pct(row.value)} tone={row.tone} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                </div>
            </div>

            {/* Attendance snapshot + modules */}
            <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Attendance rate" subtitle="Across all recorded classes" action={<PanelLink to="/admin/attendance">Details</PanelLink>}>
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <CalendarCheck size={22} aria-hidden="true" />
                        </span>
                        <p className="tabular text-3xl font-bold text-slate-900">
                            {loading ? "…" : summary?.attendanceRate != null ? `${summary.attendanceRate}%` : "—"}
                        </p>
                    </div>

                    {summary?.attendanceRate != null && (
                        <div className="mt-4">
                            <ProgressBar value={summary.attendanceRate} tone={summary.attendanceRate >= 75 ? "green" : summary.attendanceRate >= 60 ? "amber" : "red"} />
                        </div>
                    )}

                    <p className="mt-3 text-sm text-slate-600">
                        {summary?.attendanceRate == null && !loading ? "No attendance has been recorded yet." : "Present and late count as attended."}
                    </p>
                </Card>

                <div className="lg:col-span-2">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-900">Modules</h3>
                        <Link to="/admin/reports" className="text-sm font-medium text-blue-900 hover:underline">
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
