import { BookOpen, CalendarCheck, ClipboardList, FileText, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getMyAssignments } from "../../api/assignmentApi";
import { getMyTeachingCourses } from "../../api/courseApi";
import { getMyTeachingStudents } from "../../api/teacherApi";
import DashboardInsights from "../../components/dashboard/DashboardInsights";
import { EmptyLine, ErrorBanner, Kpi, KpiGrid, PanelLink, Shortcuts, WorkspaceHeader } from "../../components/dashboard/Workspace";
import { Badge, Card, formatDate } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const SHORTCUTS = [
    { title: "Take attendance", description: "Mark today's class", icon: CalendarCheck, path: "/teacher/attendance" },
    { title: "Create assignment", description: "Set work and due dates", icon: ClipboardList, path: "/teacher/assignments" },
    { title: "Enter results", description: "Marks and grades", icon: FileText, path: "/teacher/results" },
    { title: "My students", description: "Enrolled learners", icon: Users, path: "/teacher/students" },
];

const TeacherDashboard = () => {
    const { user } = useAuth();

    const [courses, setCourses] = useState([]);
    const [students, setStudents] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const [courseRes, studentRes, assignmentRes] = await Promise.allSettled([
            getMyTeachingCourses(),
            getMyTeachingStudents(),
            getMyAssignments(),
        ]);

        if (courseRes.status === "fulfilled") setCourses(courseRes.value.courses || []);
        if (studentRes.status === "fulfilled") {
            const rows = studentRes.value.enrollments || [];
            setStudents(new Set(rows.map((row) => row.student?._id)).size);
        }
        if (assignmentRes.status === "fulfilled") setAssignments(assignmentRes.value.assignments || []);

        if ([courseRes, studentRes, assignmentRes].every((r) => r.status === "rejected")) {
            setError(courseRes.reason?.message || "Failed to load dashboard data.");
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const now = Date.now();
    const upcoming = assignments
        .filter((item) => new Date(item.dueDate).getTime() >= now)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    return (
        <div className="space-y-6">
            <WorkspaceHeader
                name={user?.name || user?.displayName || "Teacher"}
                subtitle="Your classes, students and deadlines."
                onRefresh={load}
                refreshing={loading}
            />

            {error && <ErrorBanner message={error} onRetry={load} />}

            <KpiGrid>
                <Kpi label="My courses" value={courses.length} hint="Assigned this term" icon={BookOpen} to="/teacher/courses" loading={loading} />
                <Kpi label="Students" value={students} hint="Across your courses" icon={Users} to="/teacher/students" loading={loading} />
                <Kpi label="Assignments" value={assignments.length} hint={`${upcoming.length} still open`} icon={ClipboardList} to="/teacher/assignments" loading={loading} />
                <Kpi
                    label="Next deadline"
                    value={upcoming[0] ? formatDate(upcoming[0].dueDate) : "—"}
                    hint={upcoming[0]?.title || "No open assignments"}
                    icon={CalendarCheck}
                    to="/teacher/assignments"
                    loading={loading}
                />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Assigned courses" action={<PanelLink to="/teacher/courses">Manage</PanelLink>} className="lg:col-span-2" flush>
                    {loading ? (
                        <EmptyLine>Loading…</EmptyLine>
                    ) : courses.length === 0 ? (
                        <EmptyLine>No courses assigned to you yet.</EmptyLine>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {courses.slice(0, 6).map((course) => (
                                <li key={course._id} className="flex items-center justify-between gap-3 px-4 py-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-900">{course.title}</p>
                                        <p className="text-xs text-slate-500">
                                            {course.code}
                                            {course.semester ? ` · Semester ${course.semester}` : ""}
                                            {course.credit ? ` · ${course.credit} credits` : ""}
                                        </p>
                                    </div>
                                    <Badge color={course.status === "active" ? "green" : "slate"}>{course.status || "active"}</Badge>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Open assignments" action={<PanelLink to="/teacher/assignments">All</PanelLink>} flush>
                    {loading ? (
                        <EmptyLine>Loading…</EmptyLine>
                    ) : upcoming.length === 0 ? (
                        <EmptyLine>No open assignments.</EmptyLine>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {upcoming.slice(0, 5).map((item) => (
                                <li key={item._id} className="px-4 py-3">
                                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-500">Due {formatDate(item.dueDate)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            <section>
                <h3 className="mb-2 text-sm font-semibold text-slate-900">Quick actions</h3>
                <Shortcuts items={SHORTCUTS} columns="sm:grid-cols-2 xl:grid-cols-4" />
            </section>

            <DashboardInsights />
        </div>
    );
};

export default TeacherDashboard;
