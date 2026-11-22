
import { useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    Lock,
    Mail,
    User
} from "lucide-react";

import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

const Signup = () => {

    const { signup } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Loading State
    const [loading, setLoading] = useState(false);

    // Handle Input Change
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

    };

    // Handle Signup
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        const { name, email, password, confirmPassword } = formData;

        // Empty Field Validation
        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            toast.warning("Please fill in all fields.");
            return;
        }

        // Password Validation
        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        // Confirm Password Validation
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {

            setLoading(true);

            console.log("Signup started...");

            // Firebase Authentication
            const user = await signup(
                name.trim(),
                email.trim(),
                password
            );

            console.log("Signup completed:", user.uid);

            toast.success("Account created successfully!");

            // Redirect to Dashboard
            navigate("/dashboard", { replace: true });

        } catch (err) {

            console.error("Signup Error:", err);

            const errorMessages = {

                // Firebase Authentication Errors
                "auth/email-already-in-use":
                    "This email is already registered.",

                "auth/invalid-email":
                    "Please enter a valid email address.",

                "auth/weak-password":
                    "Please choose a stronger password.",

                "auth/operation-not-allowed":
                    "Email/Password authentication is not enabled.",

                "auth/network-request-failed":
                    "Network error. Please check your internet connection.",

                "auth/too-many-requests":
                    "Too many attempts. Please try again later.",

                // Backend / MongoDB Errors
                "auth/backend-error":
                    "Account created, but profile could not be saved.",

                "auth/unauthorized":
                    "Authentication verification failed.",

                "auth/email-exists":
                    "This email is already registered in the system."

            };

            toast.error(
                errorMessages[err.code] ||
                err.message ||
                "Signup failed. Please try again."
            );

        } finally {

            setLoading(false);

            console.log("Signup process finished.");

        }

    };

    return (

        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

                {/* Logo */}
                <div className="text-center mb-8">

                    <div className="inline-flex items-center justify-center bg-blue-900 text-white p-3 rounded-xl">
                        <GraduationCap size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-blue-950 mt-4">
                        Create Your Account
                    </h1>

                    <p className="text-sm text-gray-500 mt-2">
                        Join our University Management System
                    </p>

                </div>

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Full Name */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name
                        </label>

                        <div className="relative">

                            <User
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />

                        </div>

                    </div>

                    {/* Email */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address
                        </label>

                        <div className="relative">

                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />

                        </div>

                    </div>

                    {/* Password */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>

                        <div className="relative">

                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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

                    {/* Confirm Password */}
                    <div>

                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password
                        </label>

                        <div className="relative">

                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                aria-label="Toggle confirm password visibility"
                            >

                                {showConfirmPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}

                            </button>

                        </div>

                    </div>

                    {/* Signup Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 text-white py-3 rounded-lg font-semibold transition"
                    >

                        {loading ? "Creating Account..." : "Create Account"}

                        {!loading && <ArrowRight size={18} />}

                    </button>

                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-500 mt-7">

                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-900 font-bold ml-1 hover:underline"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>

    );

};

export default Signup;
