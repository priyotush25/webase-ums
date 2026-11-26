import { RefreshCw, X } from "lucide-react";
import { useEffect } from "react";

export const PageHeader = ({ title, subtitle, children }) => (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-[15px] text-slate-600">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
);

export const Spinner = ({ label = "Loading..." }) => (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600" role="status">
        <RefreshCw size={16} className="animate-spin" />
        {label}
    </div>
);

export const EmptyState = ({ icon: Icon, title, text }) => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        {Icon && (
            <div className="mb-3 rounded-md bg-slate-100 p-2.5 text-slate-500">
                <Icon size={20} />
            </div>
        )}
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {text && <p className="mt-1 max-w-sm text-sm text-slate-600">{text}</p>}
    </div>
);

// Minimal KPI card. `color` is accepted for backwards compatibility but the
// ERP style keeps icons neutral so numbers carry the emphasis.
export const StatCard = ({ title, value, icon: Icon, hint }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-700">{title}</p>
            {Icon && (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
                    <Icon size={18} aria-hidden="true" />
                </span>
            )}
        </div>
        <p className="tabular mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
    </div>
);

// Generic surface used across the workspace
export const Card = ({ title, subtitle, action, children, className = "", flush = false }) => (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
        {(title || action) && (
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5">
                <div className="min-w-0">
                    {title && <h3 className="truncate text-base font-semibold text-slate-900">{title}</h3>}
                    {subtitle && <p className="truncate text-sm text-slate-600">{subtitle}</p>}
                </div>
                {action}
            </div>
        )}
        <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
);

export const ProgressBar = ({ value = 0, tone = "blue" }) => {
    const tones = { blue: "bg-blue-800", green: "bg-emerald-600", amber: "bg-amber-500", red: "bg-red-500" };
    const width = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={width} aria-valuemin={0} aria-valuemax={100}>
            <div className={`h-full rounded-full ${tones[tone] || tones.blue}`} style={{ width: `${width}%` }} />
        </div>
    );
};

export const Skeleton = ({ className = "" }) => <div className={`animate-pulse rounded bg-slate-100 ${className}`} aria-hidden="true" />;

const BADGE_COLORS = {
    slate: "bg-slate-100 text-slate-800 ring-slate-300",
    blue: "bg-blue-50 text-blue-900 ring-blue-200",
    green: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    red: "bg-red-50 text-red-700 ring-red-200",
    purple: "bg-purple-50 text-purple-800 ring-purple-200",
};

export const Badge = ({ children, color = "slate" }) => (
    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${BADGE_COLORS[color] || BADGE_COLORS.slate}`}>
        {children}
    </span>
);

export const Modal = ({ open, title, onClose, children, wide = false }) => {
    useEffect(() => {
        if (!open) return undefined;

        const onKey = (event) => event.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);

        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
};

export const Field = ({ label, children, hint }) => (
    <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
        {children}
        {hint && <span className="mt-1 block text-xs text-slate-600">{hint}</span>}
    </label>
);

export const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/15";

export const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60";

export const formatDate = (value, withTime = false) => {
    if (!value) return "-";

    return new Date(value).toLocaleString(
        "en-GB",
        withTime
            ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
            : { day: "2-digit", month: "short", year: "numeric" }
    );
};

export const Avatar = ({ user, size = "h-9 w-9" }) =>
    user?.photoURL ? (
        <img src={user.photoURL} alt="" className={`${size} shrink-0 rounded-full object-cover`} />
    ) : (
        <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white`}>
            {(user?.name || "U").trim().slice(0, 1).toUpperCase()}
        </div>
    );
