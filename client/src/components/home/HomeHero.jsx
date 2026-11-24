import { Link } from "react-router";

import { EVENT_TYPES } from "../../utils/format";

const dateBlock = (value) => {
    const date = new Date(value);

    return {
        day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
        month: date.toLocaleDateString("en-GB", { month: "short" }),
    };
};

const PRIORITY_DOT = { normal: "bg-slate-300", important: "bg-gold-500", urgent: "bg-red-500" };

// The "campus this week" panel is fed by real notices and events
const CampusPanel = ({ overview, loading }) => {
    const notices = overview?.notices || [];
    const events = overview?.events || [];

    return (
        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="This week on campus">
            <div className="border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-bold text-slate-900">On campus now</h2>
            </div>

            {loading ? (
                <p className="px-6 py-10 text-sm text-slate-500">Loading latest updates…</p>
            ) : notices.length === 0 && events.length === 0 ? (
                <p className="px-6 py-10 text-sm text-slate-500">
                    No announcements yet. New notices and academic dates will show up here as soon as they are published.
                </p>
            ) : (
                <div className="divide-y divide-slate-100">
                    {events.length > 0 && (
                        <ul className="space-y-4 px-6 py-5">
                            {events.slice(0, 3).map((event) => {
                                const { day, month } = dateBlock(event.startDate);

                                return (
                                    <li key={event._id} className="flex items-center gap-4">
                                        <div className="w-12 shrink-0 rounded-lg bg-blue-50 py-1.5 text-center">
                                            <p className="text-lg font-bold leading-none text-blue-900">{day}</p>
                                            <p className="mt-0.5 text-xs text-blue-700">{month}</p>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{event.title}</p>
                                            <p className="text-xs text-slate-500">{EVENT_TYPES[event.type]?.label}{event.location ? ` at ${event.location}` : ""}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {notices.length > 0 && (
                        <ul className="space-y-3 px-6 py-5">
                            {notices.slice(0, 3).map((notice) => (
                                <li key={notice._id} className="flex gap-3">
                                    <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${PRIORITY_DOT[notice.priority]}`} aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-900">{notice.title}</p>
                                        <p className="line-clamp-2 text-sm text-slate-500">{notice.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </aside>
    );
};

const HomeHero = ({ overview, loading }) => (
    <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-5 lg:py-24">
            <div className="lg:col-span-3">
                <h1 className="max-w-xl text-4xl font-bold leading-[1.1] text-blue-950 md:text-5xl">
                    Admission, classes, results and fees, in one place.
                </h1>

                <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
                    Apply online, enroll in courses, follow your routine and check your attendance and CGPA from any device.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/signup" className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">
                        Apply for admission
                    </Link>
                    <Link to="/login" className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-blue-900 hover:bg-slate-50">
                        Log in to portal
                    </Link>
                </div>
            </div>

            <div className="lg:col-span-2">
                <CampusPanel overview={overview} loading={loading} />
            </div>
        </div>
    </section>
);

export default HomeHero;
