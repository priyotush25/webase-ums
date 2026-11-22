
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    GraduationCap,
    LogOut,
    Menu,
    UserCircle,
    X
} from "lucide-react";

import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);

    const { user, loading, logout } = useAuth();

    const navigate = useNavigate();

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "About", href: "/about" },
        { name: "Academics", href: "/academics" },
        { name: "Contact", href: "/contact" }
    ];

    // Logout Handler
    const handleLogout = async () => {

        try {

            await logout();

            toast.success("Logout successful!");

            setIsOpen(false);

            navigate("/", { replace: true });

        } catch (error) {

            console.error("Logout Error:", error);

            toast.error("Logout failed. Please try again.");

        }

    };

    return (

        <nav className="bg-white shadow-md sticky top-0 z-50">

            <div className="max-w-7xl mx-auto px-4">

                <div className="flex items-center justify-between h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">

                        <GraduationCap size={35} className="text-blue-900" />

                        <span className="text-xl font-bold text-blue-950">
                            UMS
                        </span>

                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-gray-600 hover:text-blue-900 font-medium"
                            >
                                {link.name}
                            </Link>
                        ))}

                    </div>

                    {/* Authentication Buttons */}
                    <div className="hidden md:flex items-center gap-3">

                        {!loading && (

                            user ? (

                                <>
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-2 text-blue-900 font-semibold"
                                    >
                                        <UserCircle size={20} />
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </>

                            ) : (

                                <>
                                    <Link
                                        to="/login"
                                        className="text-blue-900 font-semibold px-4 py-2"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/signup"
                                        className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold"
                                    >
                                        Sign Up
                                    </Link>
                                </>

                            )

                        )}

                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-gray-700"
                        aria-label="Toggle navigation menu"
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>

                </div>

                {/* Mobile Menu */}
                {isOpen && (

                    <div className="md:hidden pb-5 space-y-4">

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsOpen(false)}
                                className="block text-gray-600 hover:text-blue-900 font-medium"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!loading && (

                            user ? (

                                <>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-2 text-blue-900 font-semibold"
                                    >
                                        <UserCircle size={20} />
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg w-full justify-center"
                                    >
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </>

                            ) : (

                                <div className="flex flex-col gap-3">

                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-center border border-blue-900 text-blue-900 px-4 py-2 rounded-lg"
                                    >
                                        Login
                                    </Link>

                                    <Link
                                        to="/signup"
                                        onClick={() => setIsOpen(false)}
                                        className="text-center bg-blue-900 text-white px-4 py-2 rounded-lg"
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
