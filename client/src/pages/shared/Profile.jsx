import { Camera, Pencil, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { getMyProfile, updateProfileRequest } from "../../api/authApi";
import { Avatar, Badge, Card, Field, Modal, PageHeader, Spinner, formatDate, ghostBtn, inputClass, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";

const MAX_SIZE = 5 * 1024 * 1024;

const Row = ({ label, value }) => (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-3 text-[15px] last:border-0">
        <dt className="text-slate-600">{label}</dt>
        <dd className="text-right font-medium text-slate-900">{value || "—"}</dd>
    </div>
);

// Fields each role may change (must match the server). Everything else is
// recorded at admission and can only be changed by the admin.
const EDITABLE = {
    student: ["phone", "address", "guardianPhone"],
    teacher: ["phone", "address", "bio"],
    admin: ["name", "phone", "dob", "gender", "address", "bio", "guardianName", "guardianPhone"],
};

const lockedClass = " bg-slate-100 text-slate-500 cursor-not-allowed";

const GENDER_LABEL = { male: "Male", female: "Female", other: "Other" };

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
    const [editing, setEditing] = useState(false);
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

    const openEdit = () => {
        setForm(toForm(profile));
        setImage(null);
        setEditing(true);
    };

    const closeEdit = () => {
        if (saving) return;
        setEditing(false);
        setImage(null);
        setForm(toForm(profile));
    };

    const handleFile = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
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

    const changed = Boolean(image) || (profile && form && JSON.stringify(form) !== JSON.stringify(toForm(profile)));

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);

            const payload = Object.fromEntries(Object.entries(form).filter(([key]) => canEdit(key)));
            const response = await updateProfileRequest({ ...payload, image });

            setProfile(response.user);
            setForm(toForm(response.user));
            setImage(null);
            setEditing(false);

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
            <PageHeader
                title={title}
                subtitle={role === "admin" ? "Your personal details." : "Use Edit profile to update your contact details and photo. Other information is managed by the university office."}
            >
                <button type="button" onClick={openEdit} className={primaryBtn}>
                    <Pencil size={16} aria-hidden="true" /> Edit profile
                </button>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Identity */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="mx-auto h-28 w-28">
                            <Avatar user={{ name: profile.name, photoURL: profile.photoURL }} size="h-28 w-28 text-3xl" />
                        </div>

                        <h3 className="mt-4 text-xl font-semibold text-slate-900">{profile.name}</h3>
                        <p className="text-[15px] text-slate-600">{profile.email}</p>
                        <div className="mt-3">
                            <Badge color="blue">{role}</Badge>
                        </div>
                        {profile.universityId && <p className="mt-3 font-display text-lg font-bold text-blue-900">{profile.universityId}</p>}

                        <button type="button" onClick={openEdit} className={`${ghostBtn} mt-5 w-full`}>
                            <Camera size={16} aria-hidden="true" /> Update photo
                        </button>
                    </div>

                    <Card title="Academic information">
                        <dl>
                            <Row label="Department" value={profile.department?.name} />
                            {isStudent && <Row label="Program" value={profile.program} />}
                            {isStudent && <Row label="Semester" value={profile.semester} />}
                            {isStudent && <Row label="Batch" value={profile.batch} />}
                            {isTeacher && <Row label="Designation" value={profile.designation} />}
                            <Row label="Member since" value={formatDate(profile.createdAt)} />
                        </dl>
                        {!profile.department && role !== "admin" && (
                            <p className="mt-3 text-sm text-slate-600">Your department will show here after the office assigns it.</p>
                        )}
                    </Card>
                </div>

                {/* Personal details (read only) */}
                <Card title="Personal details" className="lg:col-span-2">
                    <dl>
                        <Row label="Full name" value={profile.name} />
                        <Row label="Email" value={profile.email} />
                        <Row label="Phone" value={profile.phone} />
                        <Row label="Date of birth" value={profile.dob ? formatDate(profile.dob) : ""} />
                        <Row label="Gender" value={GENDER_LABEL[profile.gender]} />
                        <Row label="Address" value={profile.address} />
                        {isStudent && <Row label="Guardian's name" value={profile.guardianName} />}
                        {isStudent && <Row label="Guardian's phone" value={profile.guardianPhone} />}
                    </dl>

                    {(isTeacher || (role === "admin" && profile.bio)) && (
                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <p className="text-sm font-medium text-slate-600">Short bio</p>
                            <p className="mt-1 whitespace-pre-line text-[15px] text-slate-900">{profile.bio || "—"}</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Edit modal */}
            <Modal open={editing} title="Edit profile" onClose={closeEdit} wide>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <Avatar user={{ name: profile.name, photoURL: preview || profile.photoURL }} size="h-16 w-16 text-xl" />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">Profile photo</p>
                            <p className="truncate text-sm text-slate-600">{image ? image.name : "JPG, PNG or WEBP, up to 5 MB"}</p>
                        </div>

                        <button type="button" onClick={() => fileRef.current?.click()} className={ghostBtn}>
                            <Camera size={16} aria-hidden="true" /> Choose
                        </button>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name">
                            <input value={form.name} onChange={set("name")} required minLength={2} {...fieldProps("name")} />
                        </Field>
                        <Field label="Phone">
                            <input value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" {...fieldProps("phone")} />
                        </Field>
                        <Field label="Date of birth">
                            <input type="date" max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={set("dob")} {...fieldProps("dob")} />
                        </Field>
                        <Field label="Gender">
                            <select value={form.gender} onChange={set("gender")} {...fieldProps("gender")}>
                                <option value="">Prefer not to say</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                    </div>

                    <Field label="Address">
                        <input value={form.address} onChange={set("address")} {...fieldProps("address")} />
                    </Field>

                    {isStudent && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Guardian's name">
                                <input value={form.guardianName} onChange={set("guardianName")} {...fieldProps("guardianName")} />
                            </Field>
                            <Field label="Guardian's phone">
                                <input value={form.guardianPhone} onChange={set("guardianPhone")} {...fieldProps("guardianPhone")} />
                            </Field>
                        </div>
                    )}

                    {isTeacher && (
                        <Field label="Short bio" hint="Shown on the public faculty page.">
                            <textarea rows={4} maxLength={600} value={form.bio} onChange={set("bio")} {...fieldProps("bio")} />
                        </Field>
                    )}

                    <Field label="Email" hint="Your email is your login and cannot be changed here.">
                        <input value={profile.email} disabled className={`${inputClass}${lockedClass}`} />
                    </Field>

                    {!isStudent && !isTeacher ? null : (
                        <p className="text-xs text-slate-600">Greyed-out fields are managed by the university office.</p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <button type="button" onClick={closeEdit} disabled={saving} className={ghostBtn}>
                            Cancel
                        </button>
                        <button type="submit" disabled={!changed || saving} className={primaryBtn}>
                            <Save size={16} aria-hidden="true" /> {saving ? "Saving..." : "Update profile"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Profile;
