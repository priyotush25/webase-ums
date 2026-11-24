import { ChevronDown, LogOut, Menu, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { toast } from "react-toastify";

import siteConfig from "../config/site";
import { useAuth } from "../context/AuthContext";
import roleRedirect from "../utils/roleRedirect";
import Logo from "./ui/Logo";

const NAV = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    {
        name: "Academics",
        to: "/departments",
        children: [
            { name: "Departments", to: "/departments" },
            { name: "Faculty", to: "/faculty" },
            { name: "Programs overview", to: "/academics" },
        ],
    },
    {
        name: "Admissions",
        to: "/admissions",
        children: [
            { name: "Admission information", to: "/admissions" },
            { name: "Apply online", to: "/admissions/apply" },
            { name: "Track application", to: "/admissions/track" },
        ],
    },
    { name: "Notices", to: "/notices" },
    { name: "Contact", to: "/contact" },
];

const Dropdown = ({ item }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { pathname } = useLocation();

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        const onDown = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, []);

    const active = item.children.some((child) => pathname.startsWith(child.to));

    return (
        <div
            ref={ref}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button
                type="button"
                aria-expanded={open}
                aria-haspopup="menu"
                onClick={() => setOpen((value) => !value)}
                onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
                className={`inline-flex items-center gap-1 py-5 text-sm font-medium ${active ? "text-blue-900" : "text-slate-700 hover:text-blue-900"}`}
            >
                {item.name}
                <ChevronDown size={15} className={open ? "rotate-180" : ""} />
            </button>

            {open && (
                <div role="menu" className="absolute left-0 top-full z-50 min-w-56 rounded-b-lg border border-slate-200 border-t-2 border-t-gold-500 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                        <Link key={child.to} to={child.to} role="menuitem" className="block px-5 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-900">
                            {child.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { user, role, logout, loading } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [open, setOpen] = useState(false);

    useEffect(() => setOpen(false), [pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            navigate("/login", { replace: true });
        } catch {
            toast.error("Logout failed. Please try again.");
        }
    };

    const linkClass = ({ isActive }) =>
        `py-5 text-sm font-medium ${isActive ? "text-blue-900" : "text-slate-700 hover:text-blue-900"}`;

    return (
        <header className="sticky top-0 z-50 bg-white shadow-sm">
            {/* Top utility bar */}
            <div className="hidden bg-blue-950 text-xs text-blue-100 md:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
                    <p>
                        <span className="font-semibold text-gold-400">Admission {siteConfig.admission.session} is open.</span>{" "}
                        Last date to apply: {siteConfig.admission.deadline}
                    </p>

                    <div className="flex items-center gap-5">
                        <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-white">
                            <Phone size={12} /> {siteConfig.phone}
                        </a>
                        <Link to="/notices" className="hover:text-white">Notice board</Link>
                        <Link to="/admissions/track" className="hover:text-white">Track application</Link>
                        <Link to={user ? roleRedirect(role) : "/login"} className="font-semibold text-white hover:text-gold-400">
                            {user ? "My dashboard" : "Student portal"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main header */}
            <div className="border-b border-slate-200">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
                    <div className="py-3">
                        <Logo />
                    </div>

                    <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
                        {NAV.map((item) =>
                            item.children ? (
                                <Dropdown key={item.name} item={item} />
                            ) : (
                                <NavLink key={item.to} to={item.to} end className={linkClass}>
                                    {item.name}
                                </NavLink>
                            )
                        )}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        {loading ? null : user ? (
                            <button onClick={handleLogout} aria-label="Log out" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                                <LogOut size={16} /> Log out
                            </button>
                        ) : (
                            <Link to="/login" className="rounded-lg border border-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-blue-50">
                                Log in
                            </Link>
                        )}
                        <Link to="/admissions/apply" className="rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-blue-950 hover:bg-gold-400">
                            Apply now
                        </Link>
                    </div>

                    <button
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                        className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                    >
                        {open ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="max-h-[75vh] overflow-y-auto border-b border-slate-200 bg-white px-4 pb-5 lg:hidden">
                    <nav className="py-2" aria-label="Mobile">
                        {NAV.map((item) => (
                            <div key={item.name}>
                                <NavLink to={item.to} end className={({ isActive }) => `block rounded-lg px-3 py-3 text-sm font-semibold ${isActive ? "bg-blue-50 text-blue-900" : "text-slate-800"}`}>
                                    {item.name}
                                </NavLink>
                                {item.children?.map((child) => (
                                    <Link key={child.to} to={child.to} className="block py-2 pl-8 text-sm text-slate-600">
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </nav>

                    <div className="flex flex-col gap-2 pt-2">
                        <Link to="/admissions/apply" className="rounded-lg bg-gold-500 px-4 py-3 text-center text-sm font-semibold text-blue-950">Apply now</Link>
                        {user ? (
                            <>
                                <Link to={roleRedirect(role)} className="rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white">Open dashboard</Link>
                                <button onClick={handleLogout} className="rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700">Log out</button>
                            </>
                        ) : (
                            <Link to="/login" className="rounded-lg border border-blue-900 px-4 py-3 text-center text-sm font-semibold text-blue-900">Student / teacher login</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
