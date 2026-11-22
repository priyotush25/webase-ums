
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ChevronDown,
    GraduationCap,
    LogOut,
    Menu,
    User,
    UserCircle,
    X
} from "lucide-react";

import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

    const { user, role, logout, loading } = useAuth();

    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Academics", href: "/academics" },
        { name: "Contact", href: "/contact" }
    ];

    const handleLogout = async () => {
        try {
            await logout();

            toast.success("Logged out successfully.");

            setProfileOpen(false);
            setIsOpen(false);

            navigate("/login", { replace: true });

        } catch (error) {
            console.error("Logout Error:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between h-20">

                    {/* LOGO */}
                    <Link
                        to="/"
                        className="flex items-center gap-2"
                    >
                        <GraduationCap
                            size={35}
                            className="text-blue-900"
                        />

                        <span className="text-xl font-bold text-blue-950">
                            UMS
                        </span>
                    </Link>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden md:flex items-center gap-8">

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-gray-700 hover:text-blue-900 font-medium transition"
                            >
                                {link.name}
                            </Link>
                        ))}

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="hidden md:flex items-center gap-4">

                        {!loading && (
                            <>
                                {user ? (

                                    /* PROFILE DROPDOWN */
                                    <div className="relative">

                                        <button
                                            onClick={() =>
                                                setProfileOpen(!profileOpen)
                                            }
                                            className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
                                        >

                                            {user.photoURL ? (
                                                <img
                                                    src={user.photoURL}
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <UserCircle
                                                    size={38}
                                                    className="text-blue-900"
                                                />
                                            )}

                                            <ChevronDown size={16} />

                                        </button>

                                        {profileOpen && (
                                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2">

                                                <div className="px-4 py-3 border-b border-gray-100">

                                                    <p className="font-semibold text-gray-800 truncate">
                                                        {user.displayName || "User"}
                                                    </p>

                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user.email}
                                                    </p>

                                                    <p className="text-xs text-blue-900 font-semibold capitalize mt-1">
                                                        {role}
                                                    </p>

                                                </div>

                                                <Link
                                                    to={`/${role}/dashboard`}
                                                    onClick={() =>
                                                        setProfileOpen(false)
                                                    }
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    <User size={17} />
                                                    Dashboard
                                                </Link>

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <LogOut size={17} />
                                                    Logout
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                ) : (

                                    <>
                                        <Link
                                            to="/login"
                                            className="text-blue-900 font-semibold hover:text-blue-700"
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            to="/signup"
                                            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-semibold transition"
                                        >
                                            Sign Up
                                        </Link>
                                    </>

                                )}
                            </>
                        )}

                    </div>

                    {/* MOBILE MENU BUTTON */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-700"
                        aria-label="Toggle navigation"
                    >
                        {isOpen ? (
                            <X size={27} />
                        ) : (
                            <Menu size={27} />
                        )}
                    </button>

                </div>

                {/* MOBILE MENU */}
                {isOpen && (
                    <div className="md:hidden border-t border-gray-100 py-4 space-y-3">

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block py-2 text-gray-700 hover:text-blue-900"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!loading && (
                            user ? (

                                <div className="border-t pt-4">

                                    <div className="flex items-center gap-3 mb-4">

                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt="Profile"
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <UserCircle
                                                size={42}
                                                className="text-blue-900"
                                            />
                                        )}

                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {user.displayName || "User"}
                                            </p>

                                            <p className="text-sm text-gray-500">
                                                {user.email}
                                            </p>
                                        </div>

                                    </div>

                                    <Link
                                        to={`/${role}/dashboard`}
                                        onClick={() => setIsOpen(false)}
                                        className="block py-2 text-blue-900 font-semibold"
                                    >
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 py-2 text-red-600 font-semibold"
                                    >
                                        <LogOut size={17} />
                                        Logout
                                    </button>

                                </div>

                            ) : (

                                <div className="flex gap-3 pt-3 border-t">

                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 text-center border border-blue-900 text-blue-900 py-2 rounded-lg"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="flex-1 text-center bg-blue-900 text-white py-2 rounded-lg"
                                    >
                                        Sign Up
                                    </Link>

                                </div>

                            )
                        )}

                    </div>
                )}

            </div>

        </nav>
    );
};

export default Navbar;
