import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useAuth } from "../context/AuthContext";
import roleRedirect from "../utils/roleRedirect";
import Logo from "./ui/Logo";

const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Academics", href: "/academics" },
    { name: "Contact", href: "/contact" },
];

const Navbar = () => {
    const { user, role, logout, loading } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            setOpen(false);
            navigate("/login", { replace: true });
        } catch {
            toast.error("Logout failed. Please try again.");
        }
    };

    const linkClass = ({ isActive }) =>
        `text-sm font-medium transition-colors ${isActive ? "text-blue-900" : "text-slate-600 hover:text-blue-900"}`;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Logo />

                <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
                    {links.map((link) => (
                        <NavLink key={link.href} to={link.href} end className={linkClass}>
                            {link.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {loading ? null : user ? (
                        <>
                            <Link to={roleRedirect(role)} className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                                Open dashboard
                            </Link>
                            <button onClick={handleLogout} aria-label="Log out" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-semibold text-blue-900 hover:underline">Log in</Link>
                            <Link to="/signup" className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                                Apply now
                            </Link>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setOpen((value) => !value)}
                    aria-label={open ? "Close menu" : "Open menu"}
                    aria-expanded={open}
                    className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
                    <nav className="flex flex-col py-2" aria-label="Mobile">
                        {links.map((link) => (
                            <NavLink key={link.href} to={link.href} end onClick={() => setOpen(false)} className={({ isActive }) => `rounded-lg px-3 py-3 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-900" : "text-slate-700"}`}>
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex flex-col gap-2 pt-2">
                        {user ? (
                            <>
                                <Link to={roleRedirect(role)} onClick={() => setOpen(false)} className="rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white">Open dashboard</Link>
                                <button onClick={handleLogout} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">Log out</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-blue-900">Log in</Link>
                                <Link to="/signup" onClick={() => setOpen(false)} className="rounded-lg bg-blue-900 px-4 py-3 text-center text-sm font-semibold text-white">Apply now</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
