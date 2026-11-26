import { Bell, Pencil, Pin, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    createNotice,
    deleteNotice,
    getNotices,
    updateNotice,
} from "../../api/noticeApi";
import { useAuth } from "../../context/AuthContext";
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

const EMPTY = { title: "", body: "", audience: "all", priority: "normal", pinned: false };

const PRIORITY_COLOR = { normal: "slate", important: "amber", urgent: "red" };
const AUDIENCE_LABEL = { all: "Everyone", student: "Students", teacher: "Teachers" };

const Notices = () => {
    const { role } = useAuth();
    const isAdmin = role === "admin";

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getNotices();
            setNotices(response.notices || []);
        } catch (error) {
            toast.error(error.message || "Failed to load notices");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY);
        setModalOpen(true);
    };

    const openEdit = (notice) => {
        setEditing(notice);
        setForm({
            title: notice.title,
            body: notice.body,
            audience: notice.audience,
            priority: notice.priority,
            pinned: notice.pinned,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            if (editing) {
                await updateNotice(editing._id, form);
                toast.success("Notice updated");
            } else {
                await createNotice(form);
                toast.success("Notice published");
            }

            setModalOpen(false);
            load();
        } catch (error) {
            toast.error(error.message || "Failed to save notice");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (notice) => {
        if (!window.confirm(`Delete notice "${notice.title}"?`)) return;

        try {
            await deleteNotice(notice._id);
            toast.success("Notice deleted");
            setNotices((items) => items.filter((item) => item._id !== notice._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete notice");
        }
    };

    const set = (key) => (event) =>
        setForm((previous) => ({ ...previous, [key]: event.target.value }));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Notice Board"
                subtitle={
                    isAdmin
                        ? "Publish announcements for students and teachers."
                        : "Latest announcements from the university."
                }
            >
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
                {isAdmin && (
                    <button onClick={openCreate} className={primaryBtn}>
                        <Plus size={16} />
                        New Notice
                    </button>
                )}
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : notices.length === 0 ? (
                <EmptyState
                    icon={Bell}
                    title="No notices yet"
                    text={isAdmin ? "Publish your first notice to get started." : "Check back later for announcements."}
                />
            ) : (
                <div className="space-y-4">
                    {notices.map((notice) => (
                        <article
                            key={notice._id}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {notice.pinned && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800">
                                                <Pin size={14} /> Pinned
                                            </span>
                                        )}
                                        <Badge color={PRIORITY_COLOR[notice.priority]}>
                                            {notice.priority}
                                        </Badge>
                                        {isAdmin && (
                                            <Badge color="blue">{AUDIENCE_LABEL[notice.audience]}</Badge>
                                        )}
                                    </div>

                                    <h3 className="mt-2 text-lg font-semibold text-slate-900">
                                        {notice.title}
                                    </h3>
                                </div>

                                {isAdmin && (
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            onClick={() => openEdit(notice)}
                                            aria-label="Edit notice"
                                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notice)}
                                            aria-label="Delete notice"
                                            className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                                {notice.body}
                            </p>

                            <p className="mt-3 text-xs text-slate-400">
                                {formatDate(notice.createdAt, true)}
                                {notice.author?.name ? ` · ${notice.author.name}` : ""}
                            </p>
                        </article>
                    ))}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Edit Notice" : "New Notice"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label="Title">
                        <input required minLength={3} value={form.title} onChange={set("title")} className={inputClass} />
                    </Field>

                    <Field label="Message">
                        <textarea required minLength={5} rows={5} value={form.body} onChange={set("body")} className={inputClass} />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Audience">
                            <select value={form.audience} onChange={set("audience")} className={inputClass}>
                                <option value="all">Everyone</option>
                                <option value="student">Students only</option>
                                <option value="teacher">Teachers only</option>
                            </select>
                        </Field>

                        <Field label="Priority">
                            <select value={form.priority} onChange={set("priority")} className={inputClass}>
                                <option value="normal">Normal</option>
                                <option value="important">Important</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </Field>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={form.pinned}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, pinned: event.target.checked }))
                            }
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        Pin to top
                    </label>

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModalOpen(false)} className={ghostBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className={primaryBtn}>
                            {saving ? "Saving..." : editing ? "Save Changes" : "Publish"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notices;
