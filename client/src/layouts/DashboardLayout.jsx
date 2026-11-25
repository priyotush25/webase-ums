import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";

import {
    Award,
    Bell,
    BookOpen,
    Building2,
    CalendarCheck,
    ChevronDown,
    ChevronRight,
    ClipboardCheck,
    Clock,
    FileText,
    GraduationCap,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    Menu,
    Search,
    Settings,
    UserCircle,
    UserRound,
    Users,
    X,
} from "lucide-react";

import NotificationBell from "../components/dashboard/NotificationBell";
import siteConfig from "../config/site";
import { useAuth } from "../context/AuthContext";

// ========================================
// NAVIGATION (grouped like a real ERP)
// ========================================

const NAV = {
    student: [
        {
            label: "Overview",
            items: [{ name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard }],
        },
        {
            label: "Academics",
            items: [
                { name: "My Courses", path: "/student/courses", icon: BookOpen },
                { name: "Enrollments", path: "/student/enrollments", icon: ClipboardCheck },
                { name: "Attendance", path: "/student/attendance", icon: CalendarCheck },
                { name: "Routine", path: "/student/routine", icon: Clock },
                { name: "Assignments", path: "/student/assignments", icon: FileText },
                { name: "Results", path: "/student/results", icon: Award },
            ],
        },
        {
            label: "Campus",
            items: [
                { name: "Notices", path: "/student/notices", icon: Bell },
                { name: "ID Card", path: "/student/id-card", icon: UserRound },
            ],
        },
        {
            label: "Account",
            items: [{ name: "Profile", path: "/student/profile", icon: UserCircle }],
        },
    ],

    teacher: [
        {
            label: "Overview",
            items: [{ name: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboard }],
        },
        {
            label: "Teaching",
            items: [
                { name: "My Courses", path: "/teacher/courses", icon: BookOpen },
                { name: "Students", path: "/teacher/students", icon: Users },
                { name: "Attendance", path: "/teacher/attendance", icon: CalendarCheck },
                { name: "Assignments", path: "/teacher/assignments", icon: FileText },
                { name: "Results", path: "/teacher/results", icon: Award },
                { name: "Routine", path: "/teacher/routine", icon: Clock },
            ],
        },
        {
            label: "Campus",
            items: [
                { name: "Notices", path: "/teacher/notices", icon: Bell },
            ],
        },
        {
            label: "Account",
            items: [{ name: "Profile", path: "/teacher/profile", icon: UserCircle }],
        },
    ],

    admin: [
        {
            label: "Overview",
            items: [
                { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
                { name: "Reports", path: "/admin/reports", icon: FileText },
            ],
        },
        {
            label: "People",
            items: [
                { name: "Admissions", path: "/admin/admissions", icon: ClipboardCheck },
                { name: "Students", path: "/admin/students", icon: GraduationCap },
                { name: "Teachers", path: "/admin/teachers", icon: Users },
                { name: "Users", path: "/admin/users", icon: UserCircle },
            ],
        },
        {
            label: "Academics",
            items: [
                { name: "Departments", path: "/admin/departments", icon: Building2 },
                { name: "Courses", path: "/admin/courses", icon: BookOpen },
                { name: "Enrollments", path: "/admin/enrollments", icon: ClipboardCheck },
                { name: "Routine", path: "/admin/routine", icon: Clock },
                { name: "Attendance", path: "/admin/attendance", icon: CalendarCheck },
                { name: "Assignments", path: "/admin/assignments", icon: FileText },
                { name: "Results", path: "/admin/results", icon: Award },
            ],
        },
        {
            label: "Campus",
            items: [
                { name: "Notices", path: "/admin/notices", icon: Bell },
            ],
        },
        {
            label: "System",
            items: [{ name: "Settings", path: "/admin/settings", icon: Settings }],
        },
    ],
};

// Before the admission is approved a student only gets the basics
const STUDENT_PRE_ADMISSION = [
    {
        label: "Overview",
        items: [{ name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard }],
    },
    {
        label: "Admission",
        items: [{ name: "Apply for Admission", path: "/student/admission", icon: ClipboardList }],
    },
    {
        label: "Account",
        items: [{ name: "Profile", path: "/student/profile", icon: UserCircle }],
    },
];

// ========================================
// HELPERS
// ========================================

const capitalize = (value) => (value ? value.charAt(0).toUpperCase() + value.slice(1) : "");

const getInitials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "U";

const Avatar = ({ user, displayName, size = "h-8 w-8" }) =>
    user?.photoURL ? (
        <img
            src={user.photoURL}
            alt=""
            className={`${size} shrink-0 rounded-full object-cover`}
            onError={(e) => {
                e.currentTarget.style.display = "none";
            }}
        />
    ) : (
        <div
            className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-900 text-[11px] font-semibold text-white`}
            aria-hidden="true"
        >
            {getInitials(displayName)}
        </div>
    );

// ========================================
// PAGE SEARCH — jump to any module (press "/")
// ========================================

const PageSearch = ({ links }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const wrapRef = useRef(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [cursor, setCursor] = useState(0);

    const results = useMemo(() => {
        const term = query.trim().toLowerCase();
        return (term ? links.filter((link) => link.name.toLowerCase().includes(term)) : links).slice(0, 7);
    }, [links, query]);

    useEffect(() => {
        const onKey = (event) => {
            const tag = event.target.tagName;
            const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target.isContentEditable;

            if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
                event.preventDefault();
                inputRef.current?.focus();
            }
        };

        const onDown = (event) => wrapRef.current && !wrapRef.current.contains(event.target) && setOpen(false);

        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onDown);

        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onDown);
        };
    }, []);

    const go = (link) => {
        if (!link) return;
        navigate(link.path);
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
    };

    const onKeyDown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setCursor((value) => Math.min(value + 1, results.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setCursor((value) => Math.max(value - 1, 0));
        } else if (event.key === "Enter") {
            go(results[cursor]);
        } else if (event.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    return (
        <div ref={wrapRef} className="relative hidden w-full max-w-sm md:block">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />

            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setCursor(0);
                    setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={onKeyDown}
                placeholder="Go to page…"
                aria-label="Go to page"
                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-800/15"
            />

            <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-white px-1.5 text-[11px] font-medium text-slate-400">
                /
            </kbd>

            {open && (
                <ul className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg" role="listbox">
                    {results.length === 0 ? (
                        <li className="px-3 py-3 text-sm text-slate-500">No matching page</li>
                    ) : (
                        results.map((link, index) => {
                            const Icon = link.icon;

                            return (
                                <li key={link.path} role="option" aria-selected={index === cursor}>
                                    <button
                                        type="button"
                                        onMouseEnter={() => setCursor(index)}
                                        onClick={() => go(link)}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm ${
                                            index === cursor ? "bg-slate-50 text-slate-900" : "text-slate-700"
                                        }`}
                                    >
                                        <Icon size={15} className="text-slate-400" aria-hidden="true" />
                                        <span className="flex-1">{link.name}</span>
                                        <span className="text-xs text-slate-400">{link.group}</span>
                                    </button>
                                </li>
                            );
                        })
                    )}
                </ul>
            )}
        </div>
    );
};

// ========================================
// USER MENU
// ========================================

const UserMenu = ({ user, displayName, roleTitle, role, onLogout, loggingOut }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const onDown = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
        const onKey = (event) => event.key === "Escape" && setOpen(false);

        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);

        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-100"
            >
                <Avatar user={user} displayName={displayName} />

                <span className="hidden text-left leading-tight sm:block">
                    <span className="block max-w-[10rem] truncate text-[13px] font-medium text-slate-900">{displayName}</span>
                    <span className="block text-xs text-slate-500">{roleTitle}</span>
                </span>

                <ChevronDown size={14} className="hidden text-slate-400 sm:block" aria-hidden="true" />
            </button>

            {open && (
                <div role="menu" className="absolute right-0 top-full z-40 mt-1.5 w-60 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-3 py-2.5">
                        <p className="truncate text-sm font-medium text-slate-900">{displayName}</p>
                        <p className="truncate text-xs text-slate-500">{user?.email || roleTitle}</p>
                    </div>

                    <Link
                        to={`/${role}/profile`}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                        <UserCircle size={16} className="text-slate-400" aria-hidden="true" />
                        Profile
                    </Link>

                    <button
                        type="button"
                        role="menuitem"
                        onClick={onLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                        <LogOut size={16} aria-hidden="true" />
                        {loggingOut ? "Signing out…" : "Log out"}
                    </button>
                </div>
            )}
        </div>
    );
};

// ========================================
// DASHBOARD LAYOUT
// ========================================

const DashboardLayout = () => {
    const { user, role, logout } = useAuth();
    const { pathname } = useLocation();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const normalizedRole = role?.toString().trim().toLowerCase();
    const groups =
        normalizedRole === "student" && user?.admissionApproved === false
            ? STUDENT_PRE_ADMISSION
            : NAV[normalizedRole] || [];
    const roleTitle = capitalize(normalizedRole) || "User";
    const displayName = user?.name || user?.displayName || "User";

    const flatLinks = useMemo(
        () => groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label }))),
        [groups]
    );

    const activeLink = [...flatLinks]
        .sort((a, b) => b.path.length - a.path.length)
        .find((link) => pathname === link.path || pathname.startsWith(`${link.path}/`));

    const pageTitle = activeLink?.name || "Dashboard";
    const dashboardPath = flatLinks[0]?.path || "/";

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    const handleLogout = async () => {
        if (loggingOut) return;

        try {
            setLoggingOut(true);
            await logout();
        } catch (error) {
            console.error("Logout Error:", error);
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Brand */}
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
                    <Link to={dashboardPath} className="flex min-w-0 items-center gap-2.5" aria-label={`${siteConfig.shortName} dashboard`}>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-900 text-white">
                            <GraduationCap size={17} aria-hidden="true" />
                        </span>

                        <span className="min-w-0 leading-tight">
                            <span className="block truncate text-sm font-semibold text-slate-900">{siteConfig.shortName} Portal</span>
                            <span className="block text-[11px] text-slate-500">{roleTitle} workspace</span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Main navigation">
                    {groups.map((group) => (
                        <div key={group.label}>
                            <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">{group.label}</p>

                            <ul className="space-y-0.5">
                                {group.items.map(({ name, path, icon: Icon }) => (
                                    <li key={path}>
                                        <NavLink
                                            to={path}
                                            end
                                            className={({ isActive }) =>
                                                `group relative flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                                                    isActive
                                                        ? "bg-blue-50 text-blue-900"
                                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    {isActive && <span className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 rounded-r bg-blue-900" aria-hidden="true" />}
                                                    <Icon size={16} aria-hidden="true" className={isActive ? "text-blue-900" : "text-slate-400 group-hover:text-slate-600"} />
                                                    <span className="truncate">{name}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Sidebar footer */}
                <div className="shrink-0 border-t border-slate-200 px-4 py-3">
                    <p className="text-[11px] leading-relaxed text-slate-400">
                        {siteConfig.name}
                        <br />
                        Academic year {siteConfig.admission.session}
                    </p>
                </div>
            </aside>

            {/* Main */}
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="-ml-1 rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        aria-label="Open menu"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
                        <Link to={dashboardPath} className="hidden text-slate-500 hover:text-slate-900 sm:inline">
                            {roleTitle}
                        </Link>
                        <ChevronRight size={14} className="hidden text-slate-300 sm:block" aria-hidden="true" />
                        <h1 className="truncate font-semibold text-slate-900">{pageTitle}</h1>
                    </nav>

                    <div className="ml-auto flex flex-1 items-center justify-end gap-2">
                        <PageSearch links={flatLinks} />

                        <NotificationBell />

                        <span className="mx-1 hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />

                        <UserMenu
                            user={user}
                            displayName={displayName}
                            roleTitle={roleTitle}
                            role={normalizedRole}
                            onLogout={handleLogout}
                            loggingOut={loggingOut}
                        />
                    </div>
                </header>

                <main className="min-w-0 flex-1 px-4 py-6 md:px-6 md:py-7">
                    <div className="mx-auto w-full max-w-[84rem]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
