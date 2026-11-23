
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ArrowRight,
    Camera,
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
    X
} from "lucide-react";

import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG and WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        if (preview) URL.revokeObjectURL(preview);

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // Remove Image
    const removeImage = () => {
        if (preview) URL.revokeObjectURL(preview);

        setImage(null);
        setPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Signup
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const { name, email, password, confirmPassword } = formData;

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            return toast.warning("Please fill in all fields.");
        }

        if (!image) {
            return toast.warning("Please upload your profile image.");
        }

        if (name.trim().length < 2) {
            return toast.warning("Name must contain at least 2 characters.");
        }

        if (password.length < 6) {
            return toast.warning("Password must be at least 6 characters.");
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        try {
            setLoading(true);

            const userData = await signup(
                name.trim(),
                email.trim(),
                password,
                image
            );

            toast.success("Account created successfully!");

            const dashboards = {
                student: "/student/dashboard",
                teacher: "/teacher/dashboard",
                admin: "/admin/dashboard"
            };

            const destination = dashboards[userData.role];

            if (!destination) {
                toast.error("Invalid user role.");
                return;
            }

            navigate(destination, { replace: true });

        } catch (err) {
            console.error("Signup Error:", err);

            const errorMessages = {
                "auth/email-already-in-use": "Email already registered. Please login.",
                "auth/invalid-email": "Please enter a valid email.",
                "auth/weak-password": "Please choose a stronger password.",
                "auth/network-request-failed": "Check your internet connection."
            };

            toast.error(
                errorMessages[err.code] ||
                err.message ||
                "Signup failed."
            );

        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-4 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800";

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">

            <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 sm:p-8">

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Create Account
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        University Management System
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Profile Image */}
                    <div className="flex flex-col items-center gap-2">

                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">

                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={35} className="text-gray-400" />
                                )}

                            </div>

                            {preview && (
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    disabled={loading}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={loading}
                        />

                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading}
                            className="text-sm flex items-center gap-2 text-blue-800 hover:underline"
                        >
                            <Camera size={16} />
                            {image ? "Change Photo" : "Upload Photo"}
                        </button>

                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>

                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                autoComplete="name"
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>

                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-11 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                                className="w-full border border-gray-300 rounded-md py-2.5 pl-10 pr-11 outline-none focus:border-blue-800 focus:ring-1 focus:ring-blue-800"
                            />

                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2.5 rounded-md font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                {/* Login */}
                <p className="text-center text-sm text-gray-600 mt-5">
                    Already have an account?

                    <Link
                        to="/login"
                        className="text-blue-900 font-semibold ml-1 hover:underline"
                    >
                        Login
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Signup;
