import { useEffect, useState } from "react";

import { getNotices } from "../../api/noticeApi";
import { getMyRoutine } from "../../api/routineApi";
import { Badge, Card, formatDate, Skeleton } from "../ui";
import { useAuth } from "../../context/AuthContext";
import { to12h, todayCode } from "../../utils/format";
import { EmptyLine, PanelLink } from "./Workspace";

const LoadingRows = () => (
    <div className="space-y-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
);

// Shared dashboard widgets: today's classes and latest notices
const DashboardInsights = () => {
    const { role } = useAuth();
    const base = `/${role}`;

    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let active = true;

        Promise.allSettled([
            role === "admin" ? Promise.resolve({ routines: [] }) : getMyRoutine(),
            getNotices(4),
        ]).then(([routine, noticeRes]) => {
            if (!active) return;

            const today = todayCode();

            setClasses(
                (routine.value?.routines || [])
                    .filter((item) => item.day === today)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
            );
            setNotices(noticeRes.value?.notices || []);
            setLoaded(true);
        });

        return () => {
            active = false;
        };
    }, [role]);

    return (
        <div className={`grid gap-5 ${role === "admin" ? "lg:grid-cols-1" : "lg:grid-cols-2"}`}>
            {role !== "admin" && (
                <Card title="Today's classes" subtitle={todayCode()} action={<PanelLink to={`${base}/routine`}>Full routine</PanelLink>} flush>
                    {!loaded ? (
                        <LoadingRows />
                    ) : classes.length === 0 ? (
                        <EmptyLine>No classes scheduled today.</EmptyLine>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {classes.map((item) => (
                                <li key={item._id} className="flex items-start gap-3 px-5 py-3.5">
                                    <span className="tabular w-[4.5rem] shrink-0 pt-0.5 text-sm font-medium text-slate-600">{to12h(item.startTime)}</span>
                                    <div className="min-w-0">
                                        <p className="truncate text-[15px] font-semibold text-slate-900">{item.course?.title}</p>
                                        <p className="text-sm text-slate-600">
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
                            <li key={notice._id} className="px-5 py-3.5">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[15px] font-semibold text-slate-900">{notice.title}</p>
                                    {notice.priority !== "normal" && (
                                        <Badge color={notice.priority === "urgent" ? "red" : "amber"}>{notice.priority}</Badge>
                                    )}
                                </div>
                                <p className="mt-0.5 text-sm text-slate-600">{formatDate(notice.createdAt)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};

export default DashboardInsights;
