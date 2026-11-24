import { CalendarDays, MapPin, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { createEvent, deleteEvent, getEvents, updateEvent } from "../../api/eventApi";
import {
    Badge,
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
import { EVENT_TYPES } from "../../utils/format";

const EMPTY = { title: "", type: "event", startDate: "", endDate: "", location: "", description: "" };

const dateOnly = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const range = (event) => {
    const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return event.endDate && dateOnly(event.endDate) !== dateOnly(event.startDate)
        ? `${fmt(event.startDate)} – ${fmt(event.endDate)}`
        : fmt(event.startDate);
};

const Events = () => {
    const { role } = useAuth();
    const isAdmin = role === "admin";

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getEvents(false);
            setEvents(response.events || []);
        } catch (error) {
            toast.error(error.message || "Failed to load calendar");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const grouped = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visible = events.filter((event) => {
            const end = new Date(event.endDate || event.startDate);
            return showPast || end >= today;
        });

        const map = new Map();

        for (const event of visible) {
            const key = new Date(event.startDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(event);
        }

        return [...map.entries()];
    }, [events, showPast]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setModalOpen(true);
    };

    const openEdit = (event) => {
        setEditing(event);
        setForm({
            title: event.title,
            type: event.type,
            startDate: dateOnly(event.startDate),
            endDate: dateOnly(event.endDate),
            location: event.location || "",
            description: event.description || "",
        });
        setModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            if (editing) {
                await updateEvent(editing._id, form);
                toast.success("Event updated");
            } else {
                await createEvent(form);
                toast.success("Event added");
            }

            setModalOpen(false);
            load();
        } catch (error) {
            toast.error(error.message || "Failed to save event");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.title}"?`)) return;

        try {
            await deleteEvent(item._id);
            toast.success("Event deleted");
            setEvents((list) => list.filter((entry) => entry._id !== item._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete event");
        }
    };

    const set = (key) => (event) =>
        setForm((previous) => ({ ...previous, [key]: event.target.value }));

    return (
        <div className="space-y-6">
            <PageHeader title="Academic Calendar" subtitle="Exams, holidays and campus events.">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                    Show past
                </label>
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
                {isAdmin && (
                    <button onClick={openCreate} className={primaryBtn}>
                        <Plus size={16} /> Add event
                    </button>
                )}
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : grouped.length === 0 ? (
                <EmptyState icon={CalendarDays} title="Nothing scheduled" text={isAdmin ? "Add exams, holidays and events for the semester." : "Upcoming dates will appear here."} />
            ) : (
                grouped.map(([month, items]) => (
                    <section key={month}>
                        <h3 className="mb-3 font-display text-lg font-bold text-slate-900">{month}</h3>

                        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
                            {items.map((item) => {
                                const type = EVENT_TYPES[item.type];

                                return (
                                    <li key={item._id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
                                        <p className="w-32 shrink-0 text-sm font-semibold text-blue-900">{range(item)}</p>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-slate-900">{item.title}</p>
                                            {(item.location || item.description) && (
                                                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
                                                    {item.location && (
                                                        <span className="inline-flex items-center gap-1"><MapPin size={13} />{item.location}</span>
                                                    )}
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        <Badge color={type.color}>{type.label}</Badge>

                                        {isAdmin && (
                                            <div className="flex gap-1">
                                                <button onClick={() => openEdit(item)} aria-label="Edit event" className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Pencil size={15} /></button>
                                                <button onClick={() => handleDelete(item)} aria-label="Delete event" className="rounded-md p-1.5 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit event" : "Add event"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Title"><input required minLength={3} value={form.title} onChange={set("title")} className={inputClass} /></Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Type">
                            <select value={form.type} onChange={set("type")} className={inputClass}>
                                {Object.entries(EVENT_TYPES).map(([key, value]) => (
                                    <option key={key} value={key}>{value.label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Location"><input value={form.location} onChange={set("location")} className={inputClass} /></Field>
                        <Field label="Starts"><input type="date" required value={form.startDate} onChange={set("startDate")} className={inputClass} /></Field>
                        <Field label="Ends" hint="Leave empty for a single day."><input type="date" min={form.startDate} value={form.endDate} onChange={set("endDate")} className={inputClass} /></Field>
                    </div>

                    <Field label="Details"><textarea rows={3} value={form.description} onChange={set("description")} className={inputClass} /></Field>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className={ghostBtn}>Cancel</button>
                        <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Saving..." : editing ? "Save changes" : "Add event"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Events;
