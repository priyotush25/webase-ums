import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { getPublicEvents, getPublicNotices } from "../../api/publicApi";
import { Badge, EmptyState, Spinner, formatDate, ghostBtn, inputClass } from "../../components/ui";
import { EVENT_TYPES } from "../../utils/format";
import { PageBanner, Section } from "./PublicPage";

const PRIORITY = { normal: null, important: ["amber", "Important"], urgent: ["red", "Urgent"] };

const PublicNotices = () => {
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPublicEvents().then((r) => setEvents(r.events || [])).catch(() => {});
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            getPublicNotices({ page, search: search.trim() })
                .then((r) => {
                    setNotices(r.notices || []);
                    setPagination(r.pagination);
                })
                .catch(() => setNotices([]))
                .finally(() => setLoading(false));
        }, 250);

        return () => clearTimeout(timer);
    }, [page, search]);

    return (
        <>
            <PageBanner title="Notices and academic calendar" crumbs={[["Notices"]]} />

            <Section>
                <div className="grid gap-12 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <input
                            value={search}
                            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                            placeholder="Search notices"
                            aria-label="Search notices"
                            className={`${inputClass} max-w-sm`}
                        />

                        {loading ? (
                            <Spinner />
                        ) : notices.length === 0 ? (
                            <div className="mt-6"><EmptyState title="No notices found" /></div>
                        ) : (
                            <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                                {notices.map((notice) => (
                                    <li key={notice._id} className="p-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-400">{formatDate(notice.createdAt)}</span>
                                            {notice.pinned && <Badge color="blue">Pinned</Badge>}
                                            {PRIORITY[notice.priority] && <Badge color={PRIORITY[notice.priority][0]}>{PRIORITY[notice.priority][1]}</Badge>}
                                        </div>
                                        <h2 className="mt-2 text-lg font-semibold text-slate-900">{notice.title}</h2>
                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{notice.body}</p>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {pagination.totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <button className={ghostBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Newer</button>
                                <span className="text-sm text-slate-500">Page {pagination.currentPage} of {pagination.totalPages}</span>
                                <button className={ghostBtn} disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Older <ChevronRight size={16} /></button>
                            </div>
                        )}
                    </div>

                    <aside id="calendar">
                        <h2 className="border-b-2 border-gold-500 pb-3 text-2xl font-bold text-blue-950">Upcoming dates</h2>

                        {events.length === 0 ? (
                            <p className="py-6 text-slate-500">No upcoming dates.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {events.map((event) => (
                                    <li key={event._id} className="py-4">
                                        <p className="text-sm font-semibold text-blue-900">
                                            {formatDate(event.startDate)}
                                            {event.endDate && ` to ${formatDate(event.endDate)}`}
                                        </p>
                                        <p className="mt-1 font-medium text-slate-900">{event.title}</p>
                                        <div className="mt-1"><Badge color={EVENT_TYPES[event.type].color}>{EVENT_TYPES[event.type].label}</Badge></div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </aside>
                </div>
            </Section>
        </>
    );
};

export default PublicNotices;
