import { Award, BookOpen, CheckCircle2, ClipboardList, Clock, GraduationCap, Hourglass, UserCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { getStudentAssignments } from "../../api/assignmentApi";
import { getMyOverview } from "../../api/studentApi";
import DashboardInsights from "../../components/dashboard/DashboardInsights";
import { EmptyLine, ErrorBanner, Kpi, KpiGrid, PanelLink, Shortcuts, WorkspaceHeader } from "../../components/dashboard/Workspace";
import { Badge, Card, ProgressBar, formatDate, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { STATUS_INFO } from "../public/AdmissionTrack";

const SHORTCUTS = [
    { title: "Semester subjects", description: "Enroll in your subjects", icon: BookOpen, path: "/student/courses" },
    { title: "Assignments", description: "Submit work, see marks", icon: ClipboardList, path: "/student/assignments" },
    { title: "Results", description: "Grades and academic history", icon: Award, path: "/student/results" },
    { title: "Class routine", description: "Active courses only", icon: Clock, path: "/student/routine" },
];

// Course status shown for each subject of the current semester
const COURSE_STATUS = {
    not_enrolled: { label: "Not enrolled", color: "slate" },
    pending: { label: "Awaiting approval", color: "amber" },
    active: { label: "Active", color: "blue" },
    completed: { label: "Completed", color: "green" },
    failed: { label: "Failed", color: "red" },
    rejected: { label: "Rejected", color: "red" },
    dropped: { label: "Dropped", color: "slate" },
};

const Info = ({ label, value }) => (
    <div className="min-w-0">
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="truncate text-sm font-medium text-slate-900">{value || "—"}</dd>
    </div>
);

// ========================================
// BEFORE ADMISSION: basic information, profile, admission apply
// ========================================

const BasicDashboard = ({ data, name }) => {
    const { profile, admission } = data;
    const info = admission && STATUS_INFO[admission.status];

    return (
        <div className="space-y-6">
            <WorkspaceHeader name={name} subtitle="Complete your admission to unlock subjects and enrollment." />

            <KpiGrid>
                <Kpi label="Student ID" value={profile.universityId} hint="Your university ID" icon={UserCircle} to="/student/profile" />
                <Kpi label="Admission" value={info?.label || "Not applied"} hint={admission?.applicationNo || "Apply to start"} icon={GraduationCap} to="/student/admission" tone={admission?.status === "rejected" ? "danger" : "default"} />
                <Kpi label="Department" value={admission?.department?.code || "—"} hint={admission?.department?.name || "Chosen at admission"} icon={BookOpen} />
                <Kpi label="Courses" value="Locked" hint="Opens after admission approval" icon={Hourglass} />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Basic information" className="lg:col-span-2" action={<PanelLink to="/student/profile">Profile</PanelLink>}>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <Info label="Name" value={profile.name} />
                        <Info label="Email" value={profile.email} />
                        <Info label="Student ID" value={profile.universityId} />
                        <Info label="Phone" value={profile.phone} />
                    </dl>
                </Card>

                <Card title="Admission">
                    {admission ? (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500">{admission.applicationNo}</p>
                            <Badge color={info?.color}>{info?.label || admission.status}</Badge>
                            <p className="text-sm text-slate-600">{info?.text}</p>
                            {admission.department?.name && <p className="text-xs text-slate-500">{admission.department.name} · {admission.program}</p>}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-600">You have not applied yet. Choose your department and apply.</p>
                    )}

                    {(!admission || admission.status === "rejected") && (
                        <Link to="/student/admission" className={`${primaryBtn} mt-4 w-full`}>Apply for Admission</Link>
                    )}
                    {admission && admission.status !== "rejected" && (
                        <Link to="/student/admission" className="mt-4 inline-block text-sm font-medium text-blue-800 hover:underline">View application</Link>
                    )}
                </Card>
            </div>

            <h3 className="-mb-3 text-sm font-semibold text-slate-900">Quick actions</h3>
            <Shortcuts
                columns="sm:grid-cols-2 xl:grid-cols-4"
                items={[
                    { title: "Apply for Admission", description: "Choose your department", icon: GraduationCap, path: "/student/admission" },
                    { title: "My profile", description: "Contact details and photo", icon: UserCircle, path: "/student/profile" },
                ]}
            />
        </div>
    );
};

// ========================================
// AFTER ADMISSION: semester progress, credits, CGPA
// ========================================

const AdmittedDashboard = ({ data, name, assignments, loading, onRefresh }) => {
    const { semester, cgpa, profile } = data;
    const pct = semester.totalCredit ? Math.round((semester.completedCredit / semester.totalCredit) * 100) : 0;

    const dueSoon = assignments
        .filter((item) => new Date(item.dueDate).getTime() >= Date.now() && !item.mySubmission)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <WorkspaceHeader
                name={name}
                subtitle={`${profile.department?.name || ""} · ${semester.name}`}
                onRefresh={onRefresh}
                refreshing={loading}
            />

            <KpiGrid>
                <Kpi label="Total credit" value={semester.totalCredit} hint={`${semester.subjects.length} subjects in ${semester.name}`} icon={BookOpen} />
                <Kpi label="Completed credit" value={`${semester.completedCredit}/${semester.totalCredit}`} hint={`${pct}% of the semester`} icon={CheckCircle2} tone={pct === 100 ? "good" : "default"} />
                <Kpi label="Pending credit" value={semester.pendingCredit} hint={semester.pendingCredit ? "Not completed yet" : "All subjects completed"} icon={Hourglass} />
                <Kpi label="CGPA" value={data.gradedCourses ? Number(cgpa).toFixed(2) : "—"} hint={data.gradedCourses ? `${data.earnedCredits} credits earned` : "No published results"} icon={Award} to="/student/results" />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title={`${semester.name} subjects`} action={<PanelLink to="/student/courses">Enroll</PanelLink>} className="lg:col-span-2" flush>
                    <div className="border-b border-slate-100 px-4 py-3">
                        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                            <span>Semester progress</span>
                            <span className="tabular">{semester.completedCredit}/{semester.totalCredit} credits</span>
                        </div>
                        <ProgressBar value={pct} tone={pct === 100 ? "green" : "blue"} />
                    </div>

                    {semester.subjects.length === 0 ? (
                        <EmptyLine>No subjects are published for your semester yet.</EmptyLine>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2.5 font-medium">Subject</th>
                                        <th className="px-4 py-2.5 font-medium">Credit</th>
                                        <th className="px-4 py-2.5 font-medium">Status</th>
                                        <th className="px-4 py-2.5 font-medium">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {semester.subjects.map((subject) => {
                                        const status = COURSE_STATUS[subject.status] || COURSE_STATUS.not_enrolled;

                                        return (
                                            <tr key={subject._id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{subject.title}</p>
                                                    <p className="text-xs text-slate-400">{subject.code}{subject.teacher ? ` · ${subject.teacher}` : ""}</p>
                                                </td>
                                                <td className="px-4 py-3">{subject.credit}</td>
                                                <td className="px-4 py-3"><Badge color={status.color}>{status.label}</Badge></td>
                                                <td className="px-4 py-3">{subject.result ? `${subject.result.letterGrade} (${subject.result.gradePoint.toFixed(2)})` : "—"}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                <Card title="To submit" action={<PanelLink to="/student/assignments">All</PanelLink>} flush>
                    {dueSoon.length === 0 ? (
                        <div className="px-4 py-6 text-center">
                            <Clock size={18} className="mx-auto text-slate-300" aria-hidden="true" />
                            <p className="mt-2 text-sm text-slate-500">No pending assignments.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {dueSoon.map((item) => (
                                <li key={item._id} className="px-4 py-3">
                                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-500">{item.course?.code ? `${item.course.code} · ` : ""}Due {formatDate(item.dueDate)}</p>
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

const StudentDashboard = () => {
    const { user, updateUserData } = useAuth();

    // updateUserData is recreated on every render: read it through a ref so load stays stable
    const authRef = useRef({ user, updateUserData });
    authRef.current = { user, updateUserData };

    const [data, setData] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const overview = await getMyOverview();
            setData(overview);

            // Keep the menu in step with the admin's decision
            if (authRef.current.user?.admissionApproved !== overview.admitted) {
                authRef.current.updateUserData({ admissionApproved: overview.admitted });
            }

            if (overview.admitted) {
                const assignRes = await getStudentAssignments().catch(() => null);
                setAssignments(assignRes?.assignments || []);
            }
        } catch (err) {
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const name = user?.name || user?.displayName || "Student";

    if (error) {
        return (
            <div className="space-y-6">
                <WorkspaceHeader name={name} />
                <ErrorBanner message={error} onRetry={load} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <WorkspaceHeader name={name} />
                <EmptyLine>Loading…</EmptyLine>
            </div>
        );
    }

    return data.admitted ? (
        <AdmittedDashboard data={data} name={name} assignments={assignments} loading={loading} onRefresh={load} />
    ) : (
        <BasicDashboard data={data} name={name} />
    );
};

export default StudentDashboard;
