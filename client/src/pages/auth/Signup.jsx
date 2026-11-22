
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

import {
    ArrowRight,
    Camera,
    Eye,
    EyeOff,
    GraduationCap,
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
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // IMAGE SELECTION
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG and WEBP images are allowed.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5 MB.");
            e.target.value = "";
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // REMOVE IMAGE
    const removeImage = () => {
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setImage(null);
        setPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // SIGNUP
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const { name, email, password, confirmPassword } = formData;

        if (
            !name.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword
        ) {
            toast.warning("Please fill in all fields.");
            return;
        }

        if (!image) {
            toast.warning("Please upload your profile image.");
            return;
        }

        if (name.trim().length < 2) {
            toast.warning("Name must contain at least 2 characters.");
            return;
        }

        if (password.length < 6) {
            toast.warning("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
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
                "auth/email-already-in-use":
                    "This email is already registered. Please login.",

                "auth/invalid-email":
                    "Please enter a valid email address.",

                "auth/weak-password":
                    "Please choose a stronger password.",

                "auth/network-request-failed":
                    "Network error. Please check your internet connection."
            };

            toast.error(
                errorMessages[err.code] ||
                err.message ||
                "Signup failed. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">

            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

                {/* LOGO */}
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

                {/* SIGNUP FORM */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* PROFILE IMAGE */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Profile Image <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-col items-center gap-3">

                            <div className="relative">

                                <div className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">

                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={42} className="text-gray-400" />
                                    )}

                                </div>

                                {preview && (
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        disabled={loading}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                                        aria-label="Remove profile image"
                                    >
                                        <X size={15} />
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
                                className="flex items-center gap-2 px-4 py-2 border border-blue-900 text-blue-900 rounded-lg hover:bg-blue-50 disabled:opacity-50"
                            >
                                <Camera size={17} />
                                {image ? "Change Image" : "Upload Image"}
                            </button>

                            <p className="text-xs text-gray-400">
                                JPG, PNG or WEBP • Maximum 5 MB
                            </p>

                        </div>
                    </div>

                    {/* FULL NAME */}
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Full Name
                        </label>

                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                autoComplete="name"
                                required
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-semibold text-gray-700 mb-2"
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
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                                disabled={loading}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
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

                    {/* CONFIRM PASSWORD */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            Confirm Password
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                                required
                                disabled={loading}
                                className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
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

                    {/* SUBMIT */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition"
                    >
                        {loading ? "Creating Account..." : "Create Account"}

                        {!loading && <ArrowRight size={18} />}
                    </button>

                </form>

                {/* LOGIN LINK */}
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
