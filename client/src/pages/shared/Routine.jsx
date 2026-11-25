import { CalendarDays, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getAllCourses } from "../../api/courseApi";
import {
    createRoutine,
    deleteRoutine,
    getAllRoutines,
    getMyRoutine,
    updateRoutine,
} from "../../api/routineApi";
import {
    EmptyState,
    Field,
    Modal,
    PageHeader,
    Spinner,
    ghostBtn,
    inputClass,
    primaryBtn,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { DAYS, to12h, todayCode } from "../../utils/format";

const EMPTY = { course: "", day: "Sat", startTime: "09:00", endTime: "10:30", room: "" };

const Routine = () => {
    const { role } = useAuth();
    const isAdmin = role === "admin";

    const [routines, setRoutines] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await (isAdmin ? getAllRoutines() : getMyRoutine());
            setRoutines(response.routines || []);

            if (isAdmin) {
                const courseResponse = await getAllCourses({ status: "active" });
                setCourses(courseResponse.data || []);
            }
        } catch (error) {
            toast.error(error.message || "Failed to load routine");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...EMPTY, course: courses[0]?._id || "" });
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            course: item.course?._id || "",
            day: item.day,
            startTime: item.startTime,
            endTime: item.endTime,
            room: item.room,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            if (editing) {
                await updateRoutine(editing._id, form);
                toast.success("Class updated");
            } else {
                await createRoutine(form);
                toast.success("Class added to routine");
            }

            setModalOpen(false);
            load();
        } catch (error) {
            toast.error(error.message || "Failed to save class");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Remove ${item.course?.code} on ${item.day}?`)) return;

        try {
            await deleteRoutine(item._id);
            toast.success("Class removed");
            setRoutines((list) => list.filter((entry) => entry._id !== item._id));
        } catch (error) {
            toast.error(error.message || "Failed to remove class");
        }
    };

    const set = (key) => (event) =>
        setForm((previous) => ({ ...previous, [key]: event.target.value }));

    const today = todayCode();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Class Routine"
                subtitle={
                    isAdmin
                        ? "Schedule classes. Room and teacher clashes are blocked automatically."
                        : "Your weekly timetable."
                }
            >
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                {isAdmin && (
                    <button onClick={openCreate} disabled={courses.length === 0} className={primaryBtn}>
                        <Plus size={16} /> Add class
                    </button>
                )}
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : routines.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title="No classes scheduled"
                    text={isAdmin ? "Add the first class to build the weekly routine." : "Your routine appears after your enrollment is approved and the course is active."}
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {DAYS.map((day) => {
                        const items = routines
                            .filter((item) => item.day === day)
                            .sort((a, b) => a.startTime.localeCompare(b.startTime));

                        if (items.length === 0) return null;

                        return (
                            <section
                                key={day}
                                className={`rounded-xl border bg-white shadow-sm ${day === today ? "border-gold-500 ring-1 ring-gold-500/40" : "border-slate-200"}`}
                            >
                                <h3 className="flex items-center justify-between border-b border-slate-100 px-4 py-3 font-semibold text-slate-900">
                                    {day}
                                    {day === today && <span className="text-xs font-semibold text-gold-700">Today</span>}
                                </h3>

                                <ul className="divide-y divide-slate-100">
                                    {items.map((item) => (
                                        <li key={item._id} className="flex items-start justify-between gap-3 px-4 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {item.course?.code} · {item.course?.title}
                                                </p>
                                                <p className="mt-0.5 text-sm text-slate-600">
                                                    {to12h(item.startTime)} – {to12h(item.endTime)} · Room {item.room}
                                                </p>
                                                {item.course?.teacher?.name && role !== "teacher" && (
                                                    <p className="text-xs text-slate-400">{item.course.teacher.name}</p>
                                                )}
                                            </div>

                                            {isAdmin && (
                                                <div className="flex shrink-0 gap-1">
                                                    <button onClick={() => openEdit(item)} aria-label="Edit class" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item)} aria-label="Remove class" className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit class" : "Add class"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Course">
                        <select required value={form.course} onChange={set("course")} className={inputClass}>
                            {courses.map((course) => (
                                <option key={course._id} value={course._id}>
                                    {course.code} - {course.title}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Day">
                            <select value={form.day} onChange={set("day")} className={inputClass}>
                                {DAYS.map((day) => (
                                    <option key={day}>{day}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Room">
                            <input required value={form.room} onChange={set("room")} placeholder="e.g. 304" className={inputClass} />
                        </Field>
                        <Field label="Starts">
                            <input type="time" required value={form.startTime} onChange={set("startTime")} className={inputClass} />
                        </Field>
                        <Field label="Ends">
                            <input type="time" required value={form.endTime} onChange={set("endTime")} className={inputClass} />
                        </Field>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className={ghostBtn}>Cancel</button>
                        <button type="submit" disabled={saving} className={primaryBtn}>
                            {saving ? "Saving..." : editing ? "Save changes" : "Add class"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Routine;
