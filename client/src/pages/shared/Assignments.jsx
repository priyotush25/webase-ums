import { ClipboardList, ExternalLink, Pencil, Plus, RefreshCw, Send, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getMyAssignments,
    getStudentAssignments,
    getSubmissions,
    markSubmission,
    submitAssignment,
    updateAssignment,
} from "../../api/assignmentApi";
import { getMyTeachingCourses } from "../../api/courseApi";
import {
    Badge,
    EmptyState,
    Field,
    Modal,
    PageHeader,
    Spinner,
    formatDate,
    ghostBtn,
    inputClass,
    primaryBtn,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const EMPTY = { courseId: "", title: "", description: "", totalMarks: 10, dueDate: "" };

// Convert ISO date to value usable by <input type="datetime-local">
const toLocalInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

// ========================================
// TEACHER: check submissions and give marks
// ========================================

const SubmissionsModal = ({ assignment, onClose, onChanged }) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drafts, setDrafts] = useState({});
    const [savingId, setSavingId] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getSubmissions(assignment._id);
            setRows(response.rows || []);
            setDrafts(
                Object.fromEntries(
                    (response.rows || [])
                        .filter((row) => row.submission)
                        .map((row) => [row.submission._id, { marks: row.submission.marks ?? "", feedback: row.submission.feedback || "" }])
                )
            );
        } catch (error) {
            toast.error(error.message || "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    }, [assignment._id]);

    useEffect(() => {
        load();
    }, [load]);

    const setDraft = (id, key, value) =>
        setDrafts((previous) => ({ ...previous, [id]: { ...previous[id], [key]: value } }));

    const save = async (submission) => {
        const draft = drafts[submission._id] || {};

        try {
            setSavingId(submission._id);
            await markSubmission(submission._id, { marks: draft.marks, feedback: draft.feedback });
            toast.success("Marks saved");
            await load();
            onChanged();
        } catch (error) {
            toast.error(error.message || "Failed to save marks");
        } finally {
            setSavingId(null);
        }
    };

    return (
        <Modal open onClose={onClose} title={`Submissions · ${assignment.title}`} wide>
            {loading ? (
                <Spinner />
            ) : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No approved students in this course yet.</p>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {rows.map(({ student, submission }) => (
                        <li key={student._id} className="space-y-3 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-900">{student.name}</p>
                                    <p className="text-xs text-slate-400">{student.universityId || student.email}</p>
                                </div>
                                {!submission ? (
                                    <Badge color="slate">Not submitted</Badge>
                                ) : (
                                    <Badge color={submission.status === "checked" ? "green" : "amber"}>
                                        {submission.status === "checked" ? `Checked ${submission.marks}/${assignment.totalMarks}` : "To check"}
                                    </Badge>
                                )}
                            </div>

                            {submission && (
                                <>
                                    {submission.answer && <p className="whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{submission.answer}</p>}
                                    {submission.link && (
                                        <a href={submission.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 hover:underline">
                                            <ExternalLink size={14} /> Open submitted link
                                        </a>
                                    )}
                                    <p className="text-xs text-slate-400">Submitted {formatDate(submission.submittedAt, true)}</p>

                                    <div className="grid gap-3 sm:grid-cols-[110px_1fr_auto] sm:items-end">
                                        <Field label={`Marks /${assignment.totalMarks}`}>
                                            <input
                                                type="number"
                                                min={0}
                                                max={assignment.totalMarks}
                                                step="0.5"
                                                value={drafts[submission._id]?.marks ?? ""}
                                                onChange={(event) => setDraft(submission._id, "marks", event.target.value)}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <Field label="Feedback">
                                            <input
                                                maxLength={1000}
                                                value={drafts[submission._id]?.feedback ?? ""}
                                                onChange={(event) => setDraft(submission._id, "feedback", event.target.value)}
                                                className={inputClass}
                                            />
                                        </Field>
                                        <button
                                            onClick={() => save(submission)}
                                            disabled={savingId === submission._id || drafts[submission._id]?.marks === ""}
                                            className={primaryBtn}
                                        >
                                            {savingId === submission._id ? "Saving..." : submission.status === "checked" ? "Update" : "Give marks"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </Modal>
    );
};

// ========================================
// STUDENT: submit work
// ========================================

const SubmitModal = ({ assignment, onClose, onDone }) => {
    const mine = assignment.mySubmission;
    const [answer, setAnswer] = useState(mine?.answer || "");
    const [link, setLink] = useState(mine?.link || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            const response = await submitAssignment(assignment._id, { answer, link });
            toast.success(response.message || "Submitted");
            onDone();
        } catch (error) {
            toast.error(error.message || "Failed to submit");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title={`Submit · ${assignment.title}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Your answer">
                    <textarea rows={6} maxLength={10000} value={answer} onChange={(event) => setAnswer(event.target.value)} className={inputClass} />
                </Field>
                <Field label="Link to your work (optional)" hint="Google Drive, GitHub or any public link.">
                    <input type="url" placeholder="https://" value={link} onChange={(event) => setLink(event.target.value)} className={inputClass} />
                </Field>

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
                    <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Submitting..." : mine ? "Update submission" : "Submit"}</button>
                </div>
            </form>
        </Modal>
    );
};

const dueState = (dueDate) => {
    const diff = new Date(dueDate) - Date.now();
    if (diff < 0) return { label: "Closed", color: "slate" };
    if (diff < 2 * 24 * 60 * 60 * 1000) return { label: "Due soon", color: "red" };
    return { label: "Open", color: "green" };
};

const Assignments = () => {
    const { role } = useAuth();
    const isTeacher = role === "teacher";

    const [items, setItems] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const [reviewing, setReviewing] = useState(null);
    const [submitting, setSubmitting] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);

            const fetcher =
                role === "teacher"
                    ? getMyAssignments
                    : role === "student"
                        ? getStudentAssignments
                        : getAllAssignments;

            const response = await fetcher();
            setItems(response.assignments || []);

            if (role === "teacher") {
                const courseResponse = await getMyTeachingCourses();
                setCourses(courseResponse.courses || []);
            }
        } catch (error) {
            toast.error(error.message || "Failed to load assignments");
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...EMPTY, courseId: courses[0]?._id || "" });
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            courseId: item.course?._id || "",
            title: item.title,
            description: item.description || "",
            totalMarks: item.totalMarks,
            dueDate: toLocalInput(item.dueDate),
        });
        setModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            ...form,
            totalMarks: Number(form.totalMarks),
            dueDate: new Date(form.dueDate).toISOString(),
        };

        try {
            setSaving(true);

            if (editing) {
                await updateAssignment(editing._id, payload);
                toast.success("Assignment updated");
            } else {
                await createAssignment(payload);
                toast.success("Assignment created");
            }

            setModalOpen(false);
            load();
        } catch (error) {
            toast.error(error.message || "Failed to save assignment");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete assignment "${item.title}"?`)) return;

        try {
            await deleteAssignment(item._id);
            toast.success("Assignment deleted");
            setItems((list) => list.filter((entry) => entry._id !== item._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete assignment");
        }
    };

    const set = (key) => (event) =>
        setForm((previous) => ({ ...previous, [key]: event.target.value }));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Assignments"
                subtitle={
                    isTeacher
                        ? "Create and manage assignments for your courses."
                        : role === "student"
                            ? "Assignments from your active courses. Submit before the due date; your teacher gives the marks."
                            : "All assignments across the university."
                }
            >
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
                {isTeacher && (
                    <button
                        onClick={openCreate}
                        disabled={courses.length === 0}
                        className={primaryBtn}
                        title={courses.length === 0 ? "You have no assigned courses yet" : ""}
                    >
                        <Plus size={16} />
                        New Assignment
                    </button>
                )}
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : items.length === 0 ? (
                <EmptyState
                    icon={ClipboardList}
                    title="No assignments yet"
                    text={
                        isTeacher
                            ? "Create an assignment for one of your courses."
                            : role === "student"
                                ? "Assignments appear here once you are enrolled in a course."
                                : "Nothing has been created yet."
                    }
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => {
                        const state = dueState(item.dueDate);

                        return (
                            <article
                                key={item._id}
                                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-blue-800">
                                            {item.course?.code} · {item.course?.title}
                                        </p>
                                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <Badge color={state.color}>{state.label}</Badge>
                                </div>

                                {item.description && (
                                    <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                                        {item.description}
                                    </p>
                                )}

                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <dt className="text-slate-400">Due</dt>
                                        <dd className="font-medium text-slate-800">
                                            {formatDate(item.dueDate, true)}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-slate-400">Marks</dt>
                                        <dd className="font-medium text-slate-800">{item.totalMarks}</dd>
                                    </div>
                                    {!isTeacher && (
                                        <div className="col-span-2">
                                            <dt className="text-slate-400">Teacher</dt>
                                            <dd className="font-medium text-slate-800">
                                                {item.teacher?.name || "-"}
                                            </dd>
                                        </div>
                                    )}
                                </dl>

                                {role === "student" && (
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                        {!item.mySubmission ? (
                                            <Badge color="slate">Not submitted</Badge>
                                        ) : item.mySubmission.status === "checked" ? (
                                            <div>
                                                <Badge color="green">Marks {item.mySubmission.marks}/{item.totalMarks}</Badge>
                                                {item.mySubmission.feedback && <p className="mt-1 text-xs text-slate-500">{item.mySubmission.feedback}</p>}
                                            </div>
                                        ) : (
                                            <Badge color="blue">Submitted · waiting for marks</Badge>
                                        )}

                                        {item.canSubmit && (
                                            <button onClick={() => setSubmitting(item)} className={primaryBtn}>
                                                <Send size={15} /> {item.mySubmission ? "Edit submission" : "Submit"}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {isTeacher && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                                        <button onClick={() => setReviewing(item)} className={ghostBtn}>
                                            <Users size={15} /> Submissions · {item.submittedCount ?? 0} in, {item.checkedCount ?? 0} checked
                                        </button>
                                        <button onClick={() => openEdit(item)} className={ghostBtn}>
                                            <Pencil size={15} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={15} /> Delete
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {reviewing && <SubmissionsModal assignment={reviewing} onClose={() => setReviewing(null)} onChanged={load} />}
            {submitting && (
                <SubmitModal
                    assignment={submitting}
                    onClose={() => setSubmitting(null)}
                    onDone={() => {
                        setSubmitting(null);
                        load();
                    }}
                />
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Edit Assignment" : "New Assignment"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Course">
                        <select
                            required
                            value={form.courseId}
                            onChange={set("courseId")}
                            disabled={Boolean(editing)}
                            className={inputClass}
                        >
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Title">
                        <input required minLength={3} value={form.title} onChange={set("title")} className={inputClass} />
                    </Field>

                    <Field label="Instructions">
                        <textarea rows={4} value={form.description} onChange={set("description")} className={inputClass} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Total marks">
                            <input type="number" min={1} max={1000} required value={form.totalMarks} onChange={set("totalMarks")} className={inputClass} />
                        </Field>
                        <Field label="Due date">
                            <input type="datetime-local" required value={form.dueDate} onChange={set("dueDate")} className={inputClass} />
                        </Field>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className={ghostBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className={primaryBtn}>
                            {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Assignments;
