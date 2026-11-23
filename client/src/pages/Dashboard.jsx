import {
    Bell,
    BookOpen,
    CalendarCheck,
    CalendarDays,
    ClipboardList,
    Clock,
    GraduationCap,
    Mail,
    ShieldCheck,
    UserCheck,
    UserRound,
    Users
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

/* -------------------------------------------------------------------------- */
/*  Static configuration (kept outside the component so it is not re-created) */
/* -------------------------------------------------------------------------- */

const DASHBOARDS = {
    student: {
        title: "Student Dashboard",
        description: "Track your courses, attendance, assignments and results in one place.",
        stats: [
            { title: "Enrolled Courses", value: "—", icon: BookOpen, accent: "bg-blue-50 text-blue-600 ring-blue-100" },
            { title: "Attendance", value: "—", icon: CalendarCheck, accent: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
            { title: "Assignments", value: "—", icon: ClipboardList, accent: "bg-violet-50 text-violet-600 ring-violet-100" },
            { title: "Results", value: "—", icon: GraduationCap, accent: "bg-amber-50 text-amber-600 ring-amber-100" }
        ]
    },

    teacher: {
        title: "Teacher Dashboard",
        description: "Manage your courses, students, attendance and assignments.",
        stats: [
            { title: "My Courses", value: "—", icon: BookOpen, accent: "bg-blue-50 text-blue-600 ring-blue-100" },
            { title: "Total Students", value: "—", icon: Users, accent: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
            { title: "Attendance", value: "—", icon: CalendarCheck, accent: "bg-violet-50 text-violet-600 ring-violet-100" },
            { title: "Assignments", value: "—", icon: ClipboardList, accent: "bg-amber-50 text-amber-600 ring-amber-100" }
        ]
    },

    admin: {
        title: "Admin Dashboard",
        description: "Oversee students, teachers, courses and users across the university.",
        stats: [
            { title: "Total Students", value: "—", icon: GraduationCap, accent: "bg-blue-50 text-blue-600 ring-blue-100" },
            { title: "Total Teachers", value: "—", icon: Users, accent: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
            { title: "Total Courses", value: "—", icon: BookOpen, accent: "bg-violet-50 text-violet-600 ring-violet-100" },
            { title: "Active Users", value: "—", icon: UserCheck, accent: "bg-amber-50 text-amber-600 ring-amber-100" }
        ]
    }
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const formatToday = () =>
    new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U";

/* -------------------------------------------------------------------------- */
/*  Small presentational components                                           */
/* -------------------------------------------------------------------------- */

const SectionHeader = ({ title, subtitle }) => (
    <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
);

const StatCard = ({ title, value, icon: Icon, accent }) => (
    <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                    {value}
                </p>
            </div>

            <div className={`rounded-xl p-3 ring-1 ring-inset ${accent}`}>
                <Icon size={22} aria-hidden="true" />
            </div>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" aria-hidden="true" />
            <p className="text-xs text-slate-400">Data integration pending</p>
        </div>
    </article>
);

const InfoRow = ({ icon: Icon, label, children }) => (
    <div className="flex items-center justify-between gap-4 py-3.5">
        <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <Icon size={16} className="text-slate-400" aria-hidden="true" />
            {label}
        </div>
        <div className="min-w-0 text-right text-sm font-medium text-slate-900">
            {children}
        </div>
    </div>
);

const Card = ({ icon: Icon, iconClass, title, children }) => (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
            <div className={`rounded-lg p-2 ${iconClass}`}>
                <Icon size={20} aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        </div>
        {children}
    </section>
);

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
    const { user, role } = useAuth();

    const dashboard = DASHBOARDS[role];
    const displayName = user?.name || user?.displayName || "User";

    // Invalid role protection
    if (!dashboard) {
        return (
            <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <ShieldCheck size={24} aria-hidden="true" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">
                    Dashboard Not Available
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Your account does not have a valid dashboard role. Please contact an
                    administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">

            {/* Welcome banner */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 p-6 text-white shadow-lg md:p-8">
                {/* Decorative shapes */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5" />

                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blue-100">
                            <CalendarDays size={14} aria-hidden="true" />
                            {formatToday()}
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                            {getGreeting()}, {displayName}
                        </h1>

                        <p className="mt-2 text-sm leading-relaxed text-blue-100 md:text-base">
                            {dashboard.description}
                        </p>
                    </div>

                    <div className="hidden items-center justify-center rounded-2xl bg-white/10 p-5 backdrop-blur-sm md:flex">
                        <GraduationCap size={44} aria-hidden="true" />
                    </div>
                </div>
            </section>

            {/* Statistics */}
            <section aria-labelledby="overview-heading">
                <SectionHeader
                    title="Overview"
                    subtitle={`${dashboard.title} · account summary`}
                />

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboard.stats.map((stat) => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </div>
            </section>

            {/* Bottom panels */}
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Account details */}
                <Card
                    icon={UserRound}
                    iconClass="bg-blue-50 text-blue-600"
                    title="Account Details"
                >
                    <div className="mb-2 flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                            {getInitials(displayName)}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                                {displayName}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {user?.email || "Email not available"}
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        <InfoRow icon={UserRound} label="Account Name">
                            {displayName}
                        </InfoRow>

                        <InfoRow icon={Mail} label="Email Address">
                            <span className="break-all">{user?.email || "Not available"}</span>
                        </InfoRow>

                        <InfoRow icon={ShieldCheck} label="Account Role">
                            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700 ring-1 ring-inset ring-blue-100">
                                {role}
                            </span>
                        </InfoRow>
                    </div>
                </Card>

                {/* Recent activity */}
                <Card
                    icon={Bell}
                    iconClass="bg-violet-50 text-violet-600"
                    title="Recent Activity"
                >
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center">
                        <div className="mb-3 rounded-full bg-slate-100 p-4">
                            <Clock size={26} className="text-slate-400" aria-hidden="true" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-700">
                            No activity yet
                        </h3>
                        <p className="mt-1 max-w-xs text-sm text-slate-400">
                            Updates about your courses and account will show up here.
                        </p>
                    </div>
                </Card>

            </section>
        </div>
    );
};

export default Dashboard;
