import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { getPublicNotices } from "../../api/publicApi";
import { Badge, EmptyState, Spinner, formatDate, ghostBtn, inputClass } from "../../components/ui";
import { PageBanner, Section } from "./PublicPage";

const PRIORITY = { normal: null, important: ["amber", "Important"], urgent: ["red", "Urgent"] };

const PublicNotices = () => {
    const [notices, setNotices] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

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
            <PageBanner title="Notices" crumbs={[["Notices"]]} />

            <Section>
                <div>
                    <div>
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

                </div>
            </Section>
        </>
    );
};

export default PublicNotices;
