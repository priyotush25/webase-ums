import { ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router";

import { Skeleton } from "../ui";

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const today = () =>
    new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

// Top of every dashboard: greeting, date, optional actions
export const WorkspaceHeader = ({ name, subtitle, onRefresh, refreshing, children }) => (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">{today()}</p>
            <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-900">
                {greeting()}, {name}
            </h2>
            {subtitle && <p className="mt-1 text-[15px] text-slate-600">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {children}
            {onRefresh && (
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
                    {refreshing ? "Refreshing" : "Refresh"}
                </button>
            )}
        </div>
    </div>
);

// One KPI tile. Shows a skeleton while loading and an em dash when no data.
export const Kpi = ({ label, value, hint, icon: Icon, to, loading = false, tone = "default" }) => {
    const toneClass = { default: "text-slate-900", warn: "text-amber-700", danger: "text-red-700", good: "text-emerald-700" }[tone];
    const tileClass = {
        default: "bg-blue-50 text-blue-900",
        warn: "bg-amber-100 text-amber-800",
        danger: "bg-red-100 text-red-700",
        good: "bg-emerald-100 text-emerald-700",
    }[tone];

    const body = (
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700">{label}</p>

                {loading ? (
                    <Skeleton className="mt-3 h-9 w-24" />
                ) : (
                    <p className={`tabular mt-1.5 text-3xl font-bold tracking-tight ${toneClass}`}>{value ?? "—"}</p>
                )}

                {loading ? <Skeleton className="mt-2 h-4 w-32" /> : hint && <p className="mt-1.5 text-sm text-slate-600">{hint}</p>}
            </div>

            {Icon && (
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tileClass}`}>
                    <Icon size={22} aria-hidden="true" />
                </span>
            )}
        </div>
    );

    const base = "block rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

    return to ? (
        <Link to={to} className={`${base} transition hover:border-blue-300 hover:shadow-md`}>
            {body}
        </Link>
    ) : (
        <div className={base}>{body}</div>
    );
};

export const KpiGrid = ({ children }) => <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;

// Compact module shortcuts
export const Shortcuts = ({ items, columns = "sm:grid-cols-2" }) => (
    <ul className={`grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-sm ${columns}`}>
        {items.map(({ title, description, icon: Icon, path }) => (
            <li key={path} className="bg-white">
                <Link to={path} className="group flex items-center gap-3.5 px-4 py-3.5 hover:bg-blue-50/60">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white">
                        <Icon size={19} aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold text-slate-900">{title}</span>
                        {description && <span className="block truncate text-sm text-slate-600">{description}</span>}
                    </span>

                    <ArrowRight size={16} className="shrink-0 text-slate-400 group-hover:text-blue-900" aria-hidden="true" />
                </Link>
            </li>
        ))}
    </ul>
);

export const PanelLink = ({ to, children }) => (
    <Link to={to} className="shrink-0 text-sm font-medium text-blue-900 hover:underline">
        {children}
    </Link>
);

export const EmptyLine = ({ children }) => <p className="px-4 py-8 text-center text-sm text-slate-600">{children}</p>;

export const ErrorBanner = ({ message, onRetry }) => (
    <div role="alert" className="flex flex-col justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900">
                <RefreshCw size={14} aria-hidden="true" />
                Try again
            </button>
        )}
    </div>
);
