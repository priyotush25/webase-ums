import { RefreshCw, X } from "lucide-react";
import { useEffect } from "react";

export const PageHeader = ({ title, subtitle, children }) => (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
);

export const Spinner = ({ label = "Loading..." }) => (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
        <RefreshCw size={18} className="animate-spin" />
        {label}
    </div>
);

export const EmptyState = ({ icon: Icon, title, text }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        {Icon && (
            <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-500">
                <Icon size={24} />
            </div>
        )}
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {text && <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>}
    </div>
);

export const StatCard = ({ title, value, icon: Icon, color = "bg-blue-100 text-blue-700" }) => (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">{value}</h3>
            </div>
            {Icon && (
                <div className={`rounded-xl p-3 ${color}`}>
                    <Icon size={22} />
                </div>
            )}
        </div>
    </div>
);

const BADGE_COLORS = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
};

export const Badge = ({ children, color = "slate" }) => (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[color]}`}>
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
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
            onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} rounded-2xl bg-white shadow-xl`}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
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
        <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
        {children}
        {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
);

export const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/20";

export const primaryBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60";

export const ghostBtn =
    "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60";

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
