import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getEvents } from "../../api/eventApi";
import { getNotices } from "../../api/noticeApi";
import { getMyRoutine } from "../../api/routineApi";
import { Badge, formatDate } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { EVENT_TYPES, to12h, todayCode } from "../../utils/format";

const Card = ({ title, to, linkLabel, children }) => (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <h3 className="font-semibold text-slate-900">{title}</h3>
            <Link to={to} className="text-sm font-medium text-blue-900 hover:underline">{linkLabel}</Link>
        </div>
        <div className="px-5 py-4">{children}</div>
    </section>
);

const Empty = ({ children }) => <p className="py-3 text-sm text-slate-500">{children}</p>;

// Shared dashboard widgets: today's classes, latest notices, upcoming dates
const DashboardInsights = () => {
    const { role } = useAuth();
    const base = `/${role}`;

    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let active = true;

        Promise.allSettled([
            role === "admin" ? Promise.resolve({ routines: [] }) : getMyRoutine(),
            getNotices(3),
            getEvents(true),
        ]).then(([routine, noticeRes, eventRes]) => {
            if (!active) return;

            const today = todayCode();

            setClasses(
                (routine.value?.routines || [])
                    .filter((item) => item.day === today)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
            );
            setNotices(noticeRes.value?.notices || []);
            setEvents((eventRes.value?.events || []).slice(0, 4));
            setLoaded(true);
        });

        return () => {
            active = false;
        };
    }, [role]);

    if (!loaded) return null;

    return (
        <div className={`grid gap-6 ${role === "admin" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {role !== "admin" && (
                <Card title="Today's classes" to={`${base}/routine`} linkLabel="Full routine">
                    {classes.length === 0 ? (
                        <Empty>No classes today.</Empty>
                    ) : (
                        <ul className="space-y-3">
                            {classes.map((item) => (
                                <li key={item._id}>
                                    <p className="text-sm font-semibold text-slate-900">{item.course?.code} · {item.course?.title}</p>
                                    <p className="text-sm text-slate-500">{to12h(item.startTime)} – {to12h(item.endTime)} · Room {item.room}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            <Card title="Latest notices" to={`${base}/notices`} linkLabel="All notices">
                {notices.length === 0 ? (
                    <Empty>No notices yet.</Empty>
                ) : (
                    <ul className="space-y-3">
                        {notices.map((notice) => (
                            <li key={notice._id}>
                                <p className="text-sm font-semibold text-slate-900">
                                    {notice.title}{" "}
                                    {notice.priority !== "normal" && (
                                        <Badge color={notice.priority === "urgent" ? "red" : "amber"}>{notice.priority}</Badge>
                                    )}
                                </p>
                                <p className="text-xs text-slate-400">{formatDate(notice.createdAt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Card title="Coming up" to={`${base}/calendar`} linkLabel="Calendar">
                {events.length === 0 ? (
                    <Empty>No upcoming dates.</Empty>
                ) : (
                    <ul className="space-y-3">
                        {events.map((event) => (
                            <li key={event._id} className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                                    <p className="text-xs text-slate-400">{formatDate(event.startDate)}</p>
                                </div>
                                <Badge color={EVENT_TYPES[event.type].color}>{EVENT_TYPES[event.type].label}</Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default DashboardInsights;
