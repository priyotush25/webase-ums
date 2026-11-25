import { Camera, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getMyProfile, updateProfileRequest } from "../../api/authApi";
import { Avatar, Badge, Field, PageHeader, Spinner, formatDate, inputClass, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const MAX_SIZE = 5 * 1024 * 1024;

const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
        <dt className="text-slate-500">{label}</dt>
        <dd className="text-right font-medium text-slate-900">{value || "-"}</dd>
    </div>
);

// Fields each role may change (must match the server). Everything else is
// recorded at admission and can only be changed by the admin.
const EDITABLE = {
    student: ["phone", "address", "guardianPhone"],
    teacher: ["phone", "address", "bio"],
    admin: ["name", "phone", "dob", "gender", "address", "bio", "guardianName", "guardianPhone"],
};

const lockedClass = " bg-slate-50 text-slate-500 cursor-not-allowed";

const toForm = (profile) => ({
    name: profile.name || "",
    phone: profile.phone || "",
    dob: profile.dob ? profile.dob.slice(0, 10) : "",
    gender: profile.gender || "",
    address: profile.address || "",
    bio: profile.bio || "",
    guardianName: profile.guardianName || "",
    guardianPhone: profile.guardianPhone || "",
});

const Profile = ({ title = "My Profile" }) => {
    const { role, updateUserData } = useAuth();
    const canEdit = (field) => (EDITABLE[role] || []).includes(field);

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(null);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const fileRef = useRef(null);

    const load = useCallback(async () => {
        try {
            const response = await getMyProfile();
            setProfile(response.user);
            setForm(toForm(response.user));
        } catch (error) {
            toast.error(error.message || "Failed to load profile");
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

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

    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    const changed =
        Boolean(image) || (profile && form && JSON.stringify(form) !== JSON.stringify(toForm(profile)));

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const payload = Object.fromEntries(
                Object.entries(form).filter(([key]) => canEdit(key))
            );
            const response = await updateProfileRequest({ ...payload, image });

            setProfile(response.user);
            setForm(toForm(response.user));
            setImage(null);

            updateUserData({ name: response.user.name, photoURL: response.user.photoURL });
            toast.success("Profile updated");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (!profile || !form) return <Spinner label="Loading profile..." />;

    const isStudent = role === "student";
    const isTeacher = role === "teacher";

    const fieldProps = (field) => ({
        disabled: !canEdit(field),
        className: inputClass + (canEdit(field) ? "" : lockedClass),
    });

    return (
        <div className="space-y-6">
            <PageHeader title={title} subtitle={role === "admin" ? "Your personal details." : "You can update your contact details and photo. Other information is managed by the university office."} />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="relative mx-auto h-28 w-28">
                            <Avatar user={{ name: profile.name, photoURL: preview || profile.photoURL }} size="h-28 w-28 text-2xl" />
                            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Change profile photo" className="absolute bottom-0 right-0 rounded-full bg-blue-900 p-2 text-white shadow hover:bg-blue-800">
                                <Camera size={16} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-slate-900">{profile.name}</h3>
                        <p className="text-sm text-slate-500">{profile.email}</p>
                        <div className="mt-2"><Badge color="blue">{role}</Badge></div>
                        {profile.universityId && <p className="mt-3 font-display text-lg font-bold text-blue-900">{profile.universityId}</p>}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-2 font-semibold text-slate-900">Academic information</h3>
                        <dl>
                            <Row label="Department" value={profile.department?.name} />
                            {isStudent && <Row label="Program" value={profile.program} />}
                            {isStudent && <Row label="Semester" value={profile.semester} />}
                            {isStudent && <Row label="Batch" value={profile.batch} />}
                            {isTeacher && <Row label="Designation" value={profile.designation} />}
                            <Row label="Member since" value={formatDate(profile.createdAt)} />
                        </dl>
                        {!profile.department && role !== "admin" && (
                            <p className="mt-3 text-xs text-slate-400">Your department will show here after the office assigns it.</p>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <h3 className="font-semibold text-slate-900">Personal details</h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name"><input value={form.name} onChange={set("name")} required minLength={2} {...fieldProps("name")} /></Field>
                        <Field label="Phone"><input value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" {...fieldProps("phone")} /></Field>
                        <Field label="Date of birth"><input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={set("dob")} {...fieldProps("dob")} /></Field>
                        <Field label="Gender">
                            <select value={form.gender} onChange={set("gender")} {...fieldProps("gender")}>
                                <option value="">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Address"><input value={form.address} onChange={set("address")} {...fieldProps("address")} /></Field>

                    {isStudent && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Guardian's name"><input value={form.guardianName} onChange={set("guardianName")} {...fieldProps("guardianName")} /></Field>
                            <Field label="Guardian's phone"><input value={form.guardianPhone} onChange={set("guardianPhone")} {...fieldProps("guardianPhone")} /></Field>
                        </div>
                    )}

                    {isTeacher && (
                        <Field label="Short bio" hint="Shown on the public faculty page.">
                            <textarea rows={4} maxLength={600} value={form.bio} onChange={set("bio")} {...fieldProps("bio")} />
                        </Field>
                    )}

                    <Field label="Email" hint="Your email is your login and cannot be changed here.">
                        <input value={profile.email} disabled className={`${inputClass} bg-slate-50 text-slate-500`} />
                    </Field>

                    {image && <p className="text-sm text-slate-500">New photo selected: {image.name}</p>}

                    <div className="flex justify-end pt-1">
                        <button type="submit" disabled={!changed || saving} className={primaryBtn}>
                            <Save size={16} /> {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
