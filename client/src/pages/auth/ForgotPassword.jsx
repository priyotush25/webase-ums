import { ArrowLeft, Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { Field, inputClass, primaryBtn } from "../../components/ui";
import { auth } from "../../firebase/firebase";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email.trim());
            setSent(true);
        } catch (error) {
            // Do not reveal whether an account exists
            if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
                setSent(true);
            } else if (error.code === "auth/invalid-email") {
                toast.error("Please enter a valid email address");
            } else {
                toast.error("Could not send reset email. Try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <div className="mb-5 inline-flex rounded-xl bg-blue-100 p-3 text-blue-900">
                    <Mail size={24} />
                </div>

                <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {sent ? (
                    <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
                        If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox and spam folder.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Field label="Email address">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="you@example.com"
                                className={inputClass}
                            />
                        </Field>
                        <button type="submit" disabled={loading} className={`${primaryBtn} w-full`}>
                            {loading ? "Sending..." : "Send reset link"}
                        </button>
                    </form>
                )}

                <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-900 hover:underline">
                    <ArrowLeft size={15} /> Back to login
                </Link>
            </div>
        </div>
    );
};

export default ForgotPassword;
