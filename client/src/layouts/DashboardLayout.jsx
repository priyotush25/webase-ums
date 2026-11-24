
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";

import {
    BookOpen,
    Building2,
    CalendarDays,
    ClipboardCheck,
    FileText,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Award,
    Bell,
    CalendarClock,
    UserRound,
    Wallet,
    Menu,
    Settings,
    ShieldCheck,
    UserCircle,
    Users,
    X,
} from "lucide-react";

import NotificationBell from "../components/dashboard/NotificationBell";
import siteConfig from "../config/site";
import { useAuth } from "../context/AuthContext";

// ========================================
// NAVIGATION CONFIGURATION
// ========================================

const NAV_LINKS = {
    student: [
        {
            name: "Dashboard",
            path: "/student/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "My Courses",
            path: "/student/courses",
            icon: BookOpen,
        },
        {
            name: "My Enrollments",
            path: "/student/enrollments",
            icon: ClipboardCheck,
        },
        {
            name: "Attendance",
            path: "/student/attendance",
            icon: CalendarDays,
        },
        {
            name: "Routine",
            path: "/student/routine",
            icon: CalendarDays,
        },
        {
            name: "Results",
            path: "/student/results",
            icon: Award,
        },
        {
            name: "Fees",
            path: "/student/fees",
            icon: Wallet,
        },
        {
            name: "ID Card",
            path: "/student/id-card",
            icon: UserRound,
        },
        {
            name: "Notices",
            path: "/student/notices",
            icon: Bell,
        },
        {
            name: "Calendar",
            path: "/student/calendar",
            icon: CalendarClock,
        },
        {
            name: "Assignments",
            path: "/student/assignments",
            icon: FileText,
        },
        {
            name: "Profile",
            path: "/student/profile",
            icon: UserCircle,
        },
    ],

    teacher: [
        {
            name: "Dashboard",
            path: "/teacher/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "My Courses",
            path: "/teacher/courses",
            icon: BookOpen,
        },
        {
            name: "Students",
            path: "/teacher/students",
            icon: Users,
        },
        {
            name: "Attendance",
            path: "/teacher/attendance",
            icon: CalendarDays,
        },
        {
            name: "Routine",
            path: "/teacher/routine",
            icon: CalendarDays,
        },
        {
            name: "Results",
            path: "/teacher/results",
            icon: Award,
        },
        {
            name: "Notices",
            path: "/teacher/notices",
            icon: Bell,
        },
        {
            name: "Calendar",
            path: "/teacher/calendar",
            icon: CalendarClock,
        },
        {
            name: "Assignments",
            path: "/teacher/assignments",
            icon: FileText,
        },
        {
            name: "Profile",
            path: "/teacher/profile",
            icon: UserCircle,
        },
    ],

    admin: [
        {
            name: "Dashboard",
            path: "/admin/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Admissions",
            path: "/admin/admissions",
            icon: ClipboardCheck,
        },
        {
            name: "Users",
            path: "/admin/users",
            icon: Users,
        },
        {
            name: "Students",
            path: "/admin/students",
            icon: GraduationCap,
        },
        {
            name: "Teachers",
            path: "/admin/teachers",
            icon: Users,
        },
        {
            name: "Departments",
            path: "/admin/departments",
            icon: Building2,
        },
        {
            name: "Courses",
            path: "/admin/courses",
            icon: BookOpen,
        },
        {
            name: "Routine",
            path: "/admin/routine",
            icon: CalendarDays,
        },
        {
            name: "Enrollments",
            path: "/admin/enrollments",
            icon: ClipboardCheck,
        },
        {
            name: "Fees",
            path: "/admin/fees",
            icon: Wallet,
        },
        {
            name: "Reports",
            path: "/admin/reports",
            icon: FileText,
        },
        {
            name: "Attendance",
            path: "/admin/attendance",
            icon: CalendarDays,
        },
        {
            name: "Results",
            path: "/admin/results",
            icon: Award,
        },
        {
            name: "Notices",
            path: "/admin/notices",
            icon: Bell,
        },
        {
            name: "Calendar",
            path: "/admin/calendar",
            icon: CalendarClock,
        },
        {
            name: "Assignments",
            path: "/admin/assignments",
            icon: FileText,
        },
        {
            name: "Settings",
            path: "/admin/settings",
            icon: Settings,
        },
    ],
};

// ========================================
// HELPER FUNCTIONS
// ========================================

const capitalize = (value) => {
    return value
        ? value.charAt(0).toUpperCase() + value.slice(1)
        : "";
};

const getInitials = (name = "") => {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "U"
    );
};

// ========================================
// AVATAR COMPONENT
// ========================================

const Avatar = ({
    user,
    displayName,
    size = "h-10 w-10",
}) => {
    return user?.photoURL ? (
        <img
            src={user.photoURL}
            alt={`${displayName} profile`}
            className={`${size} shrink-0 rounded-full object-cover ring-2 ring-white`}
            onError={(e) => {
                e.currentTarget.style.display = "none";
            }}
        />
    ) : (
        <div
            className={`${size} flex shrink-0 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white`}
            aria-hidden="true"
        >
            {getInitials(displayName)}
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

    // Normalize role
    const normalizedRole = role?.toString().trim().toLowerCase();

    const links = NAV_LINKS[normalizedRole] || [];

    const roleTitle = capitalize(normalizedRole) || "User";

    const displayName =
        user?.name ||
        user?.displayName ||
        "User";

    // ========================================
    // ACTIVE PAGE TITLE
    // ========================================

    const activeLink = [...links]
        .sort((a, b) => b.path.length - a.path.length)
        .find((link) => {
            return (
                pathname === link.path ||
                pathname.startsWith(`${link.path}/`)
            );
        });

    const pageTitle = activeLink?.name || "Dashboard";

    // ========================================
    // CLOSE SIDEBAR ON ROUTE CHANGE
    // ========================================

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    // ========================================
    // LOCK BODY SCROLL ON MOBILE
    // ========================================

    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    // ========================================
    // LOGOUT
    // ========================================

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

    // ========================================
    // MAIN UI
    // ========================================

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900">

            {/* Mobile Overlay */}

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-40
                    flex w-64 flex-col
                    border-r border-slate-200
                    bg-white
                    transition-transform duration-200
                    lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                `}
            >

                {/* Brand */}

                <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">

                    <div className="flex items-center gap-3">

                        <div className="rounded-lg bg-blue-900 p-2 text-white shadow-sm">
                            {normalizedRole === "admin" ? (
                                <ShieldCheck size={20} />
                            ) : (
                                <GraduationCap size={20} />
                            )}
                        </div>

                        <div className="leading-tight">
                            <h2 className="text-base font-semibold text-slate-900">
                                {siteConfig.shortName} Portal
                            </h2>

                            <p className="text-xs text-slate-500">
                                {roleTitle} Panel
                            </p>
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Navigation */}

                <nav
                    className="flex-1 overflow-y-auto px-3 py-5"
                    aria-label="Main navigation"
                >

                    <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Main Menu
                    </p>

                    <ul className="space-y-1">

                        {links.map(({ name, path, icon: Icon }) => (
                            <li key={path}>

                                <NavLink
                                    to={path}
                                    end
                                    className={({ isActive }) => `
                                        group flex items-center gap-3
                                        rounded-lg px-3 py-2.5
                                        text-sm font-medium transition
                                        ${
                                            isActive
                                                ? "bg-blue-900 text-white shadow-sm"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }
                                    `}
                                >

                                    <Icon
                                        size={18}
                                        aria-hidden="true"
                                    />

                                    <span>{name}</span>

                                </NavLink>

                            </li>
                        ))}

                    </ul>

                </nav>

                {/* User Information + Logout */}

                <div className="shrink-0 border-t border-slate-200 p-4">

                    <div className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3">

                        <Avatar
                            user={user}
                            displayName={displayName}
                        />

                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-slate-900">
                                {displayName}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                                {user?.email || roleTitle}
                            </p>

                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                        <LogOut size={18} />

                        {loggingOut ? "Signing out..." : "Logout"}

                    </button>

                </div>

            </aside>

            {/* Main Content */}

            <div className="flex min-w-0 flex-1 flex-col">

                {/* Header */}

                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>

                        <div>

                            <h1 className="text-lg font-semibold leading-tight text-slate-900">
                                {pageTitle}
                            </h1>

                            <p className="hidden text-xs text-slate-500 sm:block">
                                {roleTitle} Portal
                            </p>

                        </div>

                    </div>

                    {/* Header User */}

                    <div className="flex items-center gap-3">

                        <NotificationBell />

                        <div className="hidden text-right sm:block">

                            <p className="text-sm font-medium leading-tight text-slate-900">
                                {displayName}
                            </p>

                            <p className="text-xs text-slate-500">
                                {roleTitle}
                            </p>

                        </div>

                        <Avatar
                            user={user}
                            displayName={displayName}
                            size="h-9 w-9"
                        />

                    </div>

                </header>

                {/* Nested Page Content */}

                <main className="min-w-0 flex-1 p-4 md:p-8">

                    <div className="mx-auto w-full max-w-7xl">

                        <Outlet />

                    </div>

                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;
