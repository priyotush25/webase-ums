import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

import { getNotices } from "../../api/noticeApi";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../ui";

const storageKey = (id) => `ums-notices-seen-${id}`;

// Reads/writes to localStorage are wrapped: they can throw in private windows
const readSeen = (id) => {
    try {
        return Number(localStorage.getItem(storageKey(id))) || 0;
    } catch {
        return 0;
    }
};

const writeSeen = (id, value) => {
    try {
        localStorage.setItem(storageKey(id), String(value));
    } catch {
        // ignore
    }
};

const NotificationBell = () => {
    const { user, role } = useAuth();
    const [notices, setNotices] = useState([]);
    const [seen, setSeen] = useState(() => readSeen(user?.id || user?._id));
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const userId = user?.id || user?._id;

    useEffect(() => {
        getNotices(5).then((r) => setNotices(r.notices || [])).catch(() => {});
    }, []);

    useEffect(() => {
        const onDown = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const unread = notices.filter((n) => new Date(n.createdAt).getTime() > seen).length;

    const toggle = () => {
        setOpen((value) => !value);

        if (!open && notices.length) {
            const latest = Math.max(...notices.map((n) => new Date(n.createdAt).getTime()));
            writeSeen(userId, latest);
            setSeen(latest);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button onClick={toggle} aria-label={`Notices${unread ? `, ${unread} new` : ""}`} aria-expanded={open} className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg">
                    <p className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-900">Notices</p>

                    {notices.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-500">No notices yet.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                            {notices.map((notice) => (
                                <li key={notice._id} className="px-4 py-3">
                                    <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                                    <p className="text-xs text-slate-400">{formatDate(notice.createdAt)}</p>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Link to={`/${role}/notices`} onClick={() => setOpen(false)} className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-blue-900 hover:bg-slate-50">
                        View all notices
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
