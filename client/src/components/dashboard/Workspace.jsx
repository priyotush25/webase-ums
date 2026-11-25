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
            <p className="text-xs font-medium text-slate-500">{today()}</p>
            <h2 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-900">
                {greeting()}, {name}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
            {children}
            {onRefresh && (
                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
                    {refreshing ? "Refreshing" : "Refresh"}
                </button>
            )}
        </div>
    </div>
);

// One KPI tile. Shows a skeleton while loading and an em dash when no data.
export const Kpi = ({ label, value, hint, icon: Icon, to, loading = false, tone = "default" }) => {
    const toneClass = { default: "text-slate-900", warn: "text-amber-700", danger: "text-red-700", good: "text-emerald-700" }[tone];

    const body = (
        <>
            <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-slate-500">{label}</p>
                {Icon && <Icon size={16} className="shrink-0 text-slate-400" aria-hidden="true" />}
            </div>

            {loading ? (
                <Skeleton className="mt-3 h-7 w-20" />
            ) : (
                <p className={`tabular mt-2 text-2xl font-semibold tracking-tight ${toneClass}`}>{value ?? "—"}</p>
            )}

            {loading ? <Skeleton className="mt-2 h-3 w-28" /> : hint && <p className="mt-1 truncate text-xs text-slate-500">{hint}</p>}
        </>
    );

    const base = "block rounded-lg border border-slate-200 bg-white p-4";

    return to ? (
        <Link to={to} className={`${base} transition-colors hover:border-slate-300 hover:bg-slate-50/60`}>
            {body}
        </Link>
    ) : (
        <div className={base}>{body}</div>
    );
};

export const KpiGrid = ({ children }) => <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{children}</div>;

// Compact module shortcuts
export const Shortcuts = ({ items, columns = "sm:grid-cols-2" }) => (
    <ul className={`grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 ${columns}`}>
        {items.map(({ title, description, icon: Icon, path }) => (
            <li key={path} className="bg-white">
                <Link to={path} className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-900">
                        <Icon size={16} aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-slate-900">{title}</span>
                        {description && <span className="block truncate text-xs text-slate-500">{description}</span>}
                    </span>

                    <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-slate-500" aria-hidden="true" />
                </Link>
            </li>
        ))}
    </ul>
);

export const PanelLink = ({ to, children }) => (
    <Link to={to} className="shrink-0 text-xs font-medium text-blue-900 hover:underline">
        {children}
    </Link>
);

export const EmptyLine = ({ children }) => <p className="px-4 py-6 text-center text-sm text-slate-500">{children}</p>;

export const ErrorBanner = ({ message, onRetry }) => (
    <div role="alert" className="flex flex-col justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-900">
                <RefreshCw size={14} aria-hidden="true" />
                Try again
            </button>
        )}
    </div>
);
