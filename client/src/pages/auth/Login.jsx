
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ArrowRight,
    Eye,
    EyeOff,
    Lock,
    Mail
} from "lucide-react";

import {
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence
} from "firebase/auth";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/firebase";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    // Role Based Redirect
    const redirectByRole = (userRole) => {
        const dashboards = {
            student: "/student/dashboard",
            teacher: "/teacher/dashboard",
            admin: "/admin/dashboard"
        };

        const destination = dashboards[
            userRole?.toString().trim().toLowerCase()
        ];

        if (!destination) {
            throw new Error("Invalid user role.");
        }

        navigate(destination, { replace: true });
    };

    // Handle Login
    const handleLogin = async (e) => {
        e.preventDefault();

        if (loading) return;

        const formData = new FormData(e.currentTarget);

        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            toast.warning("Please enter email and password.");
            return;
        }

        try {
            setLoading(true);

            // Firebase Persistence
            await setPersistence(
                auth,
                rememberMe
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );

            // Firebase + Backend Login
            const userData = await login(email, password);

            // Get Database Role
            const databaseRole = userData?.role
                ?.toString()
                .trim()
                .toLowerCase();

            // Validate Role
            const validRoles = ["student", "teacher", "admin"];

            if (!validRoles.includes(databaseRole)) {
                throw new Error("Invalid user role.");
            }

            toast.success("Login successful!");

            // Dashboard Redirect
            redirectByRole(databaseRole);

        } catch (err) {
            console.error("Login Error:", err);

            const errorMessages = {
                "auth/invalid-credential": "Invalid email or password.",
                "auth/user-not-found": "No account found with this email.",
                "auth/wrong-password": "Incorrect password.",
                "auth/invalid-email": "Please enter a valid email.",
                "auth/user-disabled": "This account has been disabled.",
                "auth/too-many-requests": "Too many attempts. Try again later.",
                "auth/network-request-failed": "Check your internet connection.",
                "auth/operation-not-allowed": "Email authentication is not enabled."
            };

            toast.error(
                errorMessages[err.code] ||
                err.message ||
                "Login failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white border border-slate-200 border-t-4 border-t-gold-500 rounded-xl shadow-sm p-6 sm:p-8">

                {/* Header */}
                <div className="text-center mb-7">

                    <div className="inline-flex items-center justify-center bg-blue-900 text-white p-3 rounded-lg mb-4">
                        <Lock size={28} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-800">
                        Welcome Back
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Login to your University Management System
                    </p>

                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-5">

                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>

                        <div className="relative">

                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                required
                                autoComplete="email"
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-4 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            />

                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="flex items-center justify-between mb-1">

                            <label
                                htmlFor="password"
                                className="text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-900 hover:underline"
                            >
                                Forgot Password?
                            </Link>

                        </div>

                        <div className="relative">

                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                required
                                autoComplete="current-password"
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-11 outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={loading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Remember Me */}
                    <div className="flex items-center">

                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                            className="w-4 h-4 accent-blue-900"
                        />

                        <label
                            htmlFor="remember"
                            className="ml-2 text-sm text-gray-600"
                        >
                            Remember me
                        </label>

                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 hover:bg-blue-800 disabled:opacity-50 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? "Signing In..." : "Login"}

                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                {/* Signup Link */}
                <p className="text-center text-sm text-gray-600 mt-6">

                    Don't have an account?

                    <Link
                        to="/signup"
                        className="text-blue-900 font-semibold ml-1 hover:underline"
                    >
                        Create Account
                    </Link>

                </p>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">

                    <p className="text-xs text-gray-400">
                        University Management System
                    </p>

                </div>

            </div>

        </div>
    );
};

export default Login;
