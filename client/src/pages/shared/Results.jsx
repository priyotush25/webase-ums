import { Award, Printer, RefreshCw, Save, Send, Wand2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { getMyTeachingCourses } from "../../api/courseApi";
import {
    getAllResults,
    getCourseResults,
    getMyResults,
    publishCourseResults,
    saveCourseResults,
} from "../../api/resultApi";
import {
    Avatar,
    Badge,
    EmptyState,
    PageHeader,
    Spinner,
    StatCard,
    ghostBtn,
    inputClass,
    primaryBtn,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const MAX = { assignment: 20, midterm: 30, final: 50 };

// Same scale as server/utils/grade.js (used for live preview only)
const gradeFor = (total) => {
    const scale = [
        [80, "A+"], [75, "A"], [70, "A-"], [65, "B+"], [60, "B"],
        [55, "B-"], [50, "C+"], [45, "C"], [40, "D"], [0, "F"],
    ];
    return scale.find(([min]) => total >= min)[1];
};

const gradeColor = (letter) =>
    letter === "F" ? "red" : letter?.startsWith("A") ? "green" : letter === "-" ? "slate" : "blue";

// ========================================
// STUDENT
// ========================================

const StudentResults = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getMyResults());
        } catch (error) {
            toast.error(error.message || "Failed to load results");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-6">
            <PageHeader title="My Results" subtitle="Published results, semester-wise history and your CGPA.">
                <button onClick={load} disabled={loading} className={`${ghostBtn} no-print`}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                <button onClick={() => window.print()} disabled={loading || !data?.total} className={`${ghostBtn} no-print`}>
                    <Printer size={16} /> Print transcript
                </button>
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : !data?.total ? (
                <EmptyState icon={Award} title="No results published" text="Your grades and result appear here after your teacher publishes them." />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard title="CGPA" value={data.cgpa.toFixed(2)} icon={Award} color="bg-emerald-100 text-emerald-700" />
                        <StatCard title="Courses graded" value={data.total} icon={Award} />
                        <StatCard title="Credits earned" value={data.totalCredits} icon={Award} color="bg-purple-100 text-purple-700" />
                    </div>

                    <p className="text-sm font-medium text-slate-500">Academic history · semester-wise</p>

                    {data.history.map(({ semester, results: items, sgpa, credits, earnedCredits }) => (
                        <section key={semester} className="space-y-2">
                            <div className="flex items-baseline justify-between">
                                <h3 className="font-display text-lg font-bold text-slate-900">{semester}</h3>
                                <p className="text-sm text-slate-500">{earnedCredits}/{credits} credits · SGPA <strong className="text-slate-900">{sgpa.toFixed(2)}</strong></p>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                                <table className="w-full min-w-[720px] text-left text-sm">
                                    <thead className="bg-slate-50 text-xs text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Course</th>
                                            <th className="px-4 py-3 font-medium">Credit</th>
                                            <th className="px-4 py-3 font-medium">Assignment /20</th>
                                            <th className="px-4 py-3 font-medium">Midterm /30</th>
                                            <th className="px-4 py-3 font-medium">Final /50</th>
                                            <th className="px-4 py-3 font-medium">Total</th>
                                            <th className="px-4 py-3 font-medium">Grade</th>
                                            <th className="px-4 py-3 font-medium">GP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item) => (
                                            <tr key={item._id}>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-900">{item.course?.title}</p>
                                                    <p className="text-xs text-slate-400">{item.course?.code}</p>
                                                </td>
                                                <td className="px-4 py-3">{item.course?.credit}</td>
                                                <td className="px-4 py-3">{item.assignment}</td>
                                                <td className="px-4 py-3">{item.midterm}</td>
                                                <td className="px-4 py-3">{item.final}</td>
                                                <td className="px-4 py-3 font-semibold">{item.total}</td>
                                                <td className="px-4 py-3"><Badge color={gradeColor(item.letterGrade)}>{item.letterGrade}</Badge></td>
                                                <td className="px-4 py-3">{item.gradePoint.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </>
            )}
        </div>
    );
};

// ========================================
// TEACHER
// ========================================

const TeacherResults = () => {
    const [courses, setCourses] = useState([]);
    const [courseId, setCourseId] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await getMyTeachingCourses();
                const list = response.courses || [];
                setCourses(list);
                if (list[0]) setCourseId(list[0]._id);
                else setLoading(false);
            } catch (error) {
                toast.error(error.message || "Failed to load courses");
                setLoading(false);
            }
        })();
    }, []);

    const loadRows = useCallback(async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const response = await getCourseResults(courseId);
            setRows(response.rows || []);
        } catch (error) {
            toast.error(error.message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const change = (index, field, raw) => {
        const value = raw === "" ? "" : Number(raw);

        setRows((list) =>
            list.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const totals = useMemo(
        () =>
            rows.map(
                (row) =>
                    Number(row.assignment || 0) + Number(row.midterm || 0) + Number(row.final || 0)
            ),
        [rows]
    );

    // Fill the assignment column from the marks the teacher gave on checked assignments
    const useAssignmentMarks = () => {
        setRows((list) =>
            list.map((row) => (row.suggestedAssignment === null ? row : { ...row, assignment: row.suggestedAssignment }))
        );
        toast.info("Assignment marks filled from checked assignments. Save to keep them.");
    };

    const handlePublish = async () => {
        if (!window.confirm("Publish the saved results? Students will see their marks and grades.")) return;

        try {
            setPublishing(true);
            const response = await publishCourseResults(courseId);
            toast.success(response.message || "Results published");
            if (response.withoutMarks) toast.info(`${response.withoutMarks} student(s) have no saved marks and stay hidden.`);
            loadRows();
        } catch (error) {
            toast.error(error.message || "Failed to publish results");
        } finally {
            setPublishing(false);
        }
    };

    const handleSave = async () => {
        for (const row of rows) {
            for (const [field, max] of Object.entries(MAX)) {
                const value = Number(row[field] || 0);
                if (value < 0 || value > max) {
                    toast.error(`${row.student.name}: ${field} must be between 0 and ${max}`);
                    return;
                }
            }
        }

        try {
            setSaving(true);

            await saveCourseResults(
                courseId,
                rows.map((row) => ({
                    student: row.student._id,
                    assignment: Number(row.assignment || 0),
                    midterm: Number(row.midterm || 0),
                    final: Number(row.final || 0),
                    remarks: row.remarks,
                }))
            );

            toast.success("Results saved");
            loadRows();
        } catch (error) {
            toast.error(error.message || "Failed to save results");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Results" subtitle="Enter marks (Assignment 20 + Midterm 30 + Final 50), save, then publish so students can see them.">
                <select
                    value={courseId}
                    onChange={(event) => setCourseId(event.target.value)}
                    className={`${inputClass} w-auto`}
                    aria-label="Select course"
                >
                    {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                            {course.code} - {course.title}
                        </option>
                    ))}
                </select>
                <button onClick={useAssignmentMarks} disabled={rows.length === 0 || rows.every((row) => row.suggestedAssignment === null)} className={ghostBtn} title="Use the marks from checked assignments">
                    <Wand2 size={16} /> Fill assignment marks
                </button>
                <button onClick={handleSave} disabled={saving || rows.length === 0} className={ghostBtn}>
                    <Save size={16} /> {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={handlePublish} disabled={publishing || !rows.some((row) => row.saved && !row.published)} className={primaryBtn}>
                    <Send size={16} /> {publishing ? "Publishing..." : "Publish"}
                </button>
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : courses.length === 0 ? (
                <EmptyState icon={Award} title="No assigned courses" text="Ask the administrator to assign you a course." />
            ) : rows.length === 0 ? (
                <EmptyState icon={Award} title="No approved students" text="Students appear here after their enrollment is approved." />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Assignment /20</th>
                                <th className="px-4 py-3">Midterm /30</th>
                                <th className="px-4 py-3">Final /50</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Grade</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((row, index) => (
                                <tr key={row.student._id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={row.student} />
                                            <div>
                                                <p className="font-medium text-slate-900">{row.student.name}</p>
                                                <p className="text-xs text-slate-400">{row.student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {Object.entries(MAX).map(([field, max]) => (
                                        <td key={field} className="px-4 py-3">
                                            <input
                                                type="number"
                                                min={0}
                                                max={max}
                                                step="0.5"
                                                value={row[field]}
                                                onChange={(event) => change(index, field, event.target.value)}
                                                aria-label={`${field} marks for ${row.student.name}`}
                                                className={`${inputClass} w-24`}
                                            />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 font-semibold">{totals[index]}</td>
                                    <td className="px-4 py-3">
                                        <Badge color={gradeColor(gradeFor(totals[index]))}>{gradeFor(totals[index])}</Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color={row.published ? "green" : row.saved ? "amber" : "slate"}>
                                            {row.published ? "Published" : row.saved ? "Saved" : "No marks"}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            value={row.remarks}
                                            onChange={(event) =>
                                                setRows((list) =>
                                                    list.map((item, i) =>
                                                        i === index ? { ...item, remarks: event.target.value } : item
                                                    )
                                                )
                                            }
                                            aria-label={`Remarks for ${row.student.name}`}
                                            className={`${inputClass} min-w-40`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ========================================
// ADMIN
// ========================================

const AdminResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllResults();
            setResults(response.results || []);
        } catch (error) {
            toast.error(error.message || "Failed to load results");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = results.filter((item) => {
        const text = `${item.student?.name} ${item.student?.email} ${item.course?.code} ${item.course?.title}`.toLowerCase();
        return text.includes(search.trim().toLowerCase());
    });

    return (
        <div className="space-y-6">
            <PageHeader title="Results Overview" subtitle="Read-only. Only the course teacher can enter and publish marks.">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search student or course"
                    aria-label="Search results"
                    className={`${inputClass} w-64`}
                />
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Award} title="No results found" />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3">Teacher</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Grade</th>
                                <th className="px-4 py-3">GP</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.map((item) => (
                                <tr key={item._id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={item.student} />
                                            <div>
                                                <p className="font-medium text-slate-900">{item.student?.name}</p>
                                                <p className="text-xs text-slate-400">{item.student?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{item.course?.code} · {item.course?.title}</td>
                                    <td className="px-4 py-3">{item.teacher?.name || "-"}</td>
                                    <td className="px-4 py-3 font-semibold">{item.total}</td>
                                    <td className="px-4 py-3"><Badge color={gradeColor(item.letterGrade)}>{item.letterGrade}</Badge></td>
                                    <td className="px-4 py-3">{item.gradePoint.toFixed(2)}</td>
                                    <td className="px-4 py-3"><Badge color={item.published ? "green" : "amber"}>{item.published ? "Published" : "Draft"}</Badge></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const Results =() => {
    const { role } = useAuth();

    if (role === "student") return <StudentResults />;
    if (role === "teacher") return <TeacherResults />;
    return <AdminResults />;
};

export default Results;
