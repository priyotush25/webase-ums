import { useEffect, useState } from "react";

import { getEvents } from "../../api/eventApi";
import { getNotices } from "../../api/noticeApi";
import { getMyRoutine } from "../../api/routineApi";
import { Badge, Card, formatDate, Skeleton } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { EVENT_TYPES, to12h, todayCode } from "../../utils/format";
import { EmptyLine, PanelLink } from "./Workspace";

const LoadingRows = () => (
    <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
);

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
            getNotices(4),
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
            setEvents((eventRes.value?.events || []).slice(0, 5));
            setLoaded(true);
        });

        return () => {
            active = false;
        };
    }, [role]);

    return (
        <div className={`grid gap-4 ${role === "admin" ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            {role !== "admin" && (
                <Card title="Today's classes" subtitle={todayCode()} action={<PanelLink to={`${base}/routine`}>Full routine</PanelLink>} flush>
                    {!loaded ? (
                        <LoadingRows />
                    ) : classes.length === 0 ? (
                        <EmptyLine>No classes scheduled today.</EmptyLine>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {classes.map((item) => (
                                <li key={item._id} className="flex items-start gap-3 px-4 py-3">
                                    <span className="tabular w-[4.5rem] shrink-0 pt-0.5 text-xs font-medium text-slate-500">{to12h(item.startTime)}</span>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-slate-900">{item.course?.title}</p>
                                        <p className="text-xs text-slate-500">
                                            {item.course?.code} · Room {item.room} · until {to12h(item.endTime)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}

            <Card title="Latest notices" action={<PanelLink to={`${base}/notices`}>All notices</PanelLink>} flush>
                {!loaded ? (
                    <LoadingRows />
                ) : notices.length === 0 ? (
                    <EmptyLine>No notices yet.</EmptyLine>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {notices.map((notice) => (
                            <li key={notice._id} className="px-4 py-3">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium text-slate-900">{notice.title}</p>
                                    {notice.priority !== "normal" && (
                                        <Badge color={notice.priority === "urgent" ? "red" : "amber"}>{notice.priority}</Badge>
                                    )}
                                </div>
                                <p className="mt-0.5 text-xs text-slate-500">{formatDate(notice.createdAt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            <Card title="Upcoming" subtitle="Academic calendar" action={<PanelLink to={`${base}/calendar`}>Calendar</PanelLink>} flush>
                {!loaded ? (
                    <LoadingRows />
                ) : events.length === 0 ? (
                    <EmptyLine>No upcoming dates.</EmptyLine>
                ) : (
                    <ul className="divide-y divide-slate-100">
                        {events.map((event) => {
                            const date = new Date(event.startDate);
                            const type = EVENT_TYPES[event.type] || EVENT_TYPES.event;

                            return (
                                <li key={event._id} className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-10 shrink-0 rounded-md border border-slate-200 py-1 text-center">
                                        <p className="tabular text-sm font-semibold leading-none text-slate-900">{date.toLocaleDateString("en-GB", { day: "2-digit" })}</p>
                                        <p className="mt-0.5 text-[10px] font-medium uppercase text-slate-500">{date.toLocaleDateString("en-GB", { month: "short" })}</p>
                                    </div>
                                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{event.title}</p>
                                    <Badge color={type.color}>{type.label}</Badge>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default DashboardInsights;
