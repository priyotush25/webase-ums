import { Camera, Mail, Save, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { updateProfileRequest } from "../../api/authApi";
import { Avatar, Field, PageHeader, formatDate, inputClass, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const MAX_SIZE = 5 * 1024 * 1024;

const Profile = ({ title = "My Profile" }) => {
    const { user, role, updateUserData } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    useEffect(() => {
        if (!image) {
            setPreview("");
            return undefined;
        }

        const url = URL.createObjectURL(image);
        setPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [image]);

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG and WEBP images are allowed");
            return;
        }

        if (file.size > MAX_SIZE) {
            toast.error("Image must be smaller than 5 MB");
            return;
        }

        setImage(file);
    };

    const changed = name.trim() !== (user?.name || "") || Boolean(image);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const response = await updateProfileRequest({
                name: name.trim(),
                image,
            });

            updateUserData({
                name: response.user.name,
                photoURL: response.user.photoURL,
            });

            setImage(null);
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title={title} subtitle="Manage your personal information and photo." />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="relative mx-auto h-28 w-28">
                        <Avatar
                            user={{ name: user?.name, photoURL: preview || user?.photoURL }}
                            size="h-28 w-28 text-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            aria-label="Change profile photo"
                            className="absolute bottom-0 right-0 rounded-full bg-blue-900 p-2 text-white shadow hover:bg-blue-800"
                        >
                            <Camera size={16} />
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFile}
                            className="hidden"
                        />
                    </div>

                    <h3 className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</h3>
                    <p className="text-sm capitalize text-slate-500">{role}</p>

                    <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-left text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Mail size={15} className="shrink-0 text-slate-400" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <ShieldCheck size={15} className="shrink-0 text-slate-400" />
                            <span>Member since {formatDate(user?.createdAt)}</span>
                        </div>
                    </dl>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
                >
                    <h3 className="font-semibold text-slate-900">Edit details</h3>

                    <Field label="Full name">
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            required
                            minLength={2}
                            className={inputClass}
                        />
                    </Field>

                    <Field label="Email" hint="Email is linked to your login and cannot be changed here.">
                        <input value={user?.email || ""} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
                    </Field>

                    <Field label="Role">
                        <input value={role || ""} disabled className={`${inputClass} bg-slate-50 capitalize text-slate-500`} />
                    </Field>

                    {image && (
                        <p className="text-sm text-slate-500">New photo selected: {image.name}</p>
                    )}

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={!changed || saving} className={primaryBtn}>
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
