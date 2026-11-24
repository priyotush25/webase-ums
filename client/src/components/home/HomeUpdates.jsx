import { Link } from "react-router";

import { formatDate } from "../ui";
import { EVENT_TYPES } from "../../utils/format";

const PRIORITY = { important: "text-gold-700", urgent: "text-red-600" };

const HomeUpdates = ({ notices = [], events = [], loading }) => (
    <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <div className="flex items-end justify-between border-b-2 border-blue-900 pb-3">
                    <h2 className="text-2xl font-bold text-blue-950">Latest notices</h2>
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

            <div id="calendar" className="lg:col-span-2">
                <div className="flex items-end justify-between border-b-2 border-gold-500 pb-3">
                    <h2 className="text-2xl font-bold text-blue-950">Academic calendar</h2>
                </div>

                {loading ? (
                    <p className="py-8 text-sm text-slate-500">Loading dates…</p>
                ) : events.length === 0 ? (
                    <p className="py-8 text-sm text-slate-500">No upcoming dates yet.</p>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {events.map((event) => {
                            const date = new Date(event.startDate);

                            return (
                                <li key={event._id} className="flex items-center gap-4 py-4">
                                    <div className="w-14 shrink-0 rounded-lg bg-blue-50 py-2 text-center">
                                        <p className="text-xl font-bold leading-none text-blue-900">{date.toLocaleDateString("en-GB", { day: "2-digit" })}</p>
                                        <p className="mt-1 text-xs text-blue-700">{date.toLocaleDateString("en-GB", { month: "short" })}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900">{event.title}</p>
                                        <p className="text-xs text-slate-500">{EVENT_TYPES[event.type]?.label}{event.location ? ` at ${event.location}` : ""}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    </section>
);

export default HomeUpdates;
