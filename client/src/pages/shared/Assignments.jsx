import { ClipboardList, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    createAssignment,
    deleteAssignment,
    getAllAssignments,
    getMyAssignments,
    getStudentAssignments,
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
                            ? "Assignments from your approved courses."
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

                                {isTeacher && (
                                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
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
