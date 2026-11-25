import { Link } from "react-router";

import { formatDate } from "../ui";

const PRIORITY = { important: "text-gold-700", urgent: "text-red-600" };

const HomeUpdates = ({ notices = [], loading }) => (
    <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
            <div>
                <div className="flex items-end justify-between border-b border-slate-200 pb-3">
                    <h2 className="text-xl font-semibold text-blue-950">Latest notices</h2>
                    <Link to="/notices" className="text-sm font-semibold text-blue-900 hover:underline">View all</Link>
                </div>

                {loading ? (
                    <p className="py-8 text-sm text-slate-500">Loading notices…</p>
                ) : notices.length === 0 ? (
                    <p className="py-8 text-sm text-slate-500">No notices have been published yet.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {notices.map((notice) => (
                            <li key={notice._id} className="py-4">
                                <p className="text-xs text-slate-400">{formatDate(notice.createdAt)}</p>
                                <h3 className="mt-1 font-semibold text-slate-900">
                                    {notice.pinned && <span className="mr-2 text-xs font-semibold text-blue-800">Pinned</span>}
                                    {notice.title}
                                    {PRIORITY[notice.priority] && (
                                        <span className={`ml-2 text-xs font-semibold ${PRIORITY[notice.priority]}`}>{notice.priority}</span>
                                    )}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{notice.body}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </section>
);

export default HomeUpdates;
