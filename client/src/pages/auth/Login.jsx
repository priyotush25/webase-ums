
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ArrowRight,
    BookOpen,
    Building2,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    Mail,
    ShieldCheck,
} from "lucide-react";

import {
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence,
} from "firebase/auth";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/firebase";

// Login Roles
const roles = [
    {
        id: "student",
        label: "Student",
        description: "Student Portal",
        icon: GraduationCap,
    },
    {
        id: "teacher",
        label: "Teacher",
        description: "Faculty Portal",
        icon: BookOpen,
    },
    {
        id: "admin",
        label: "Admin",
        description: "Admin Portal",
        icon: ShieldCheck,
    },
];

const Login = () => {

    const navigate = useNavigate();

    const { login } = useAuth();

    // States
    const [role, setRole] = useState("student");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    // Handle Login
    const handleLogin = async (e) => {

        e.preventDefault();

        if (loading) return;

        const formData = new FormData(e.currentTarget);

        const email = formData.get("email")?.toString().trim();
        const password = formData.get("password")?.toString();

        // Validation
        if (!email || !password) {
            toast.warning("Please enter your email and password.");
            return;
        }

        try {

            setLoading(true);

            // Remember Me Persistence
            await setPersistence(
                auth,
                rememberMe
                    ? browserLocalPersistence
                    : browserSessionPersistence
            );

            // Firebase Login
            const user = await login(email, password);

            console.log("Login successful:", user.uid);
            console.log("Selected portal:", role);

            // Success Toast
            toast.success("Login successful!");

            // Redirect
            navigate("/dashboard", {
                replace: true,
            });

        } catch (err) {

            console.error("Login Error:", err);

            const errorMessages = {

                "auth/invalid-credential":
                    "Invalid email or password.",

                "auth/user-not-found":
                    "No account found with this email.",

                "auth/wrong-password":
                    "Incorrect password.",

                "auth/invalid-email":
                    "Please enter a valid email address.",

                "auth/user-disabled":
                    "This account has been disabled.",

                "auth/too-many-requests":
                    "Too many attempts. Please try again later.",

                "auth/network-request-failed":
                    "Network error. Please check your internet connection.",

                "auth/operation-not-allowed":
                    "Email/Password authentication is not enabled.",

            };

            const message =
                errorMessages[err.code] ||
                "Login failed. Please try again.";

            // Error Toast
            toast.error(message);

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">

            <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">

                {/* Left Side - Branding */}
                <div className="hidden lg:flex flex-col justify-between bg-blue-950 text-white p-12 relative overflow-hidden">

                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-800 rounded-full opacity-30" />

                    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-blue-800 rounded-full opacity-30" />

                    <div className="relative z-10">

                        <Link to="/" className="flex items-center gap-3">

                            <div className="bg-white/10 p-3 rounded-xl">
                                <GraduationCap size={32} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold">
                                    UMS
                                </h1>

                                <p className="text-blue-200 text-xs tracking-widest">
                                    UNIVERSITY MANAGEMENT SYSTEM
                                </p>
                            </div>

                        </Link>

                        <div className="mt-24">

                            <p className="text-blue-300 font-semibold mb-4">
                                WELCOME TO UMS
                            </p>

                            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
                                Empowering
                                <br />
                                Education Through
                                <br />
                                Technology.
                            </h2>

                            <p className="text-blue-200 mt-6 leading-7 max-w-md">
                                Access your academic information, manage
                                university activities, and stay connected
                                with your educational community.
                            </p>

                        </div>

                    </div>

                    <div className="relative z-10 flex items-center gap-2 text-sm text-blue-200">

                        <Building2 size={18} />

                        <span>
                            University Management System © {new Date().getFullYear()}
                        </span>

                    </div>

                </div>

                {/* Right Side - Login Form */}
                <div className="p-6 sm:p-10 lg:p-14">

                    {/* Mobile Branding */}
                    <div className="flex lg:hidden items-center justify-center gap-3 mb-8">

                        <div className="bg-blue-950 text-white p-3 rounded-xl">
                            <GraduationCap size={28} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-blue-950">
                                UMS
                            </h1>

                            <p className="text-xs text-slate-500">
                                UNIVERSITY MANAGEMENT SYSTEM
                            </p>
                        </div>

                    </div>

                    <div className="max-w-md mx-auto">

                        {/* Back to Home */}
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-900 hover:text-blue-600 mb-7"
                        >
                            <ArrowRight className="rotate-180" size={17} />
                            Back to Home
                        </Link>

                        {/* Heading */}
                        <div className="mb-8">

                            <p className="text-blue-700 font-semibold text-sm mb-2">
                                ACCOUNT LOGIN
                            </p>

                            <h2 className="text-3xl font-bold text-slate-900">
                                Welcome Back!
                            </h2>

                            <p className="text-slate-500 mt-2">
                                Please sign in to access your account.
                            </p>

                        </div>

                        {/* Role Selection */}
                        <div className="mb-7">

                            <label className="block text-sm font-semibold text-slate-700 mb-3">
                                Login As
                            </label>

                            <div className="grid grid-cols-3 gap-3">

                                {roles.map((item) => {

                                    const Icon = item.icon;
                                    const active = role === item.id;

                                    return (

                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setRole(item.id)}
                                            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                active
                                                    ? "border-blue-800 bg-blue-50 text-blue-900"
                                                    : "border-slate-200 text-slate-500 hover:border-blue-300"
                                            }`}
                                        >

                                            <Icon size={23} />

                                            <span className="text-sm font-semibold">
                                                {item.label}
                                            </span>

                                            <span className="text-[10px] text-center">
                                                {item.description}
                                            </span>

                                        </button>

                                    );

                                })}

                            </div>

                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">

                            {/* Email */}
                            <div>

                                <label
                                    htmlFor="email"
                                    className="block text-sm font-semibold text-slate-700 mb-2"
                                >
                                    Email Address
                                </label>

                                <div className="relative">

                                    <Mail
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        required
                                        autoComplete="email"
                                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 transition"
                                    />

                                </div>

                            </div>

                            {/* Password */}
                            <div>

                                <div className="flex justify-between items-center mb-2">

                                    <label
                                        htmlFor="password"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-semibold text-blue-800 hover:text-blue-600"
                                    >
                                        Forgot Password?
                                    </Link>

                                </div>

                                <div className="relative">

                                    <LockKeyhole
                                        size={19}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                        className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-100 transition"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-800"
                                        aria-label="Toggle password visibility"
                                    >

                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
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
                                    className="w-4 h-4 accent-blue-900 cursor-pointer"
                                />

                                <label
                                    htmlFor="remember"
                                    className="ml-2 text-sm text-slate-600 cursor-pointer"
                                >
                                    Remember me
                                </label>

                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-950/20"
                            >

                                {loading ? "Signing In..." : "Sign In"}

                                {!loading && <ArrowRight size={19} />}

                            </button>

                        </form>

                        {/* Signup Link */}
                        <p className="text-center text-sm text-slate-500 mt-7">

                            Don't have an account?{" "}

                            <Link
                                to="/signup"
                                className="text-blue-800 font-bold hover:underline"
                            >
                                Create Account
                            </Link>

                        </p>

                        {/* Footer */}
                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">

                            <p className="text-xs text-slate-400">
                                Secure Access • Authorized Users Only
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Login;
