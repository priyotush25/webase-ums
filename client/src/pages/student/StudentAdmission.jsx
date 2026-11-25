import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { getMyApplication, submitApplication } from "../../api/admissionApi";
import { getDepartments } from "../../api/publicApi";
import { Badge, Card, Field, PageHeader, Spinner, formatDate, inputClass, primaryBtn } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { STATUS_INFO } from "../public/AdmissionTrack";

const FormSection = ({ title, children }) => (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
        <legend className="px-2 text-base font-semibold text-blue-950">{title}</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
);

const StudentAdmission = () => {
    const { user, updateUserData } = useAuth();

    // updateUserData is recreated on every render: read it through a ref so load stays stable
    const authRef = useRef({ user, updateUserData });
    authRef.current = { user, updateUserData };

    const [data, setData] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        phone: "", dob: "", gender: "", address: "",
        department: "", program: "Bachelor",
        sscGpa: "", hscGpa: "", passingYear: String(new Date().getFullYear()),
        guardianName: "", guardianPhone: "", statement: "",
    });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [mine, depts] = await Promise.all([getMyApplication(), getDepartments()]);
            setData(mine);
            setDepartments(depts.departments || []);

            // Approval may have happened since the page was last loaded
            if (mine.admitted && authRef.current.user?.admissionApproved === false) {
                authRef.current.updateUserData({ admissionApproved: true });
            }
        } catch (error) {
            toast.error(error.message || "Failed to load your admission");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            const response = await submitApplication(form);
            toast.success(`Application submitted (${response.applicationNo})`);
            await load();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            toast.error(error.message || "Could not submit the application");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner />;

    const application = data?.application;
    const open = application && ["pending", "under_review", "waitlisted"].includes(application.status);
    const info = application && STATUS_INFO[application.status];

    // Approved: nothing more to apply for
    if (data?.admitted) {
        return (
            <div className="space-y-6">
                <PageHeader title="Admission" subtitle="Your admission is complete." />
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <CheckCircle className="mt-0.5 shrink-0 text-emerald-600" size={22} />
                    <div>
                        <p className="font-semibold text-slate-900">Admission approved{application?.department ? ` · ${application.department.name}` : ""}</p>
                        <p className="mt-1 text-sm text-slate-600">View your 1st semester subjects and send enrollment requests from My Courses.</p>
                        <Link to="/student/courses" className={`${primaryBtn} mt-4`}>View semester subjects</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Admission" subtitle="Apply to your department. You can enroll in subjects only after the admin approves your admission." />

            {application && (
                <Card title={`Application ${application.applicationNo}`} subtitle={`${application.department?.name || ""} · ${application.program} · submitted ${formatDate(application.createdAt)}`}>
                    <div className="flex items-start gap-3">
                        {application.status === "rejected" ? (
                            <XCircle className="mt-0.5 shrink-0 text-red-500" size={20} />
                        ) : (
                            <Clock className="mt-0.5 shrink-0 text-blue-600" size={20} />
                        )}
                        <div>
                            <Badge color={info?.color}>{info?.label || application.status}</Badge>
                            <p className="mt-2 text-sm text-slate-600">{info?.text}</p>
                            {application.adminNote && <p className="mt-2 text-sm text-slate-500">Note from admission office: {application.adminNote}</p>}
                        </div>
                    </div>
                </Card>
            )}

            {open ? (
                <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
                    Your application is being processed. This page updates when the admin decides.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
                    {application?.status === "rejected" && <p className="text-sm font-medium text-slate-700">You can apply again below.</p>}

                    <FormSection title="Program">
                        <Field label="Department">
                            <select required value={form.department} onChange={set("department")} className={inputClass}>
                                <option value="">Select a department</option>
                                {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>)}
                            </select>
                        </Field>
                        <Field label="Program level">
                            <select value={form.program} onChange={set("program")} className={inputClass}>
                                <option>Bachelor</option>
                                <option>Masters</option>
                            </select>
                        </Field>
                    </FormSection>

                    <FormSection title="Personal information">
                        <Field label="Full name"><input required minLength={3} value={form.name} onChange={set("name")} className={inputClass} autoComplete="name" /></Field>
                        <Field label="Email" hint="Taken from your account."><input value={user?.email || ""} disabled className={inputClass} /></Field>
                        <Field label="Phone"><input required value={form.phone} onChange={set("phone")} placeholder="01XXXXXXXXX" className={inputClass} autoComplete="tel" /></Field>
                        <Field label="Date of birth"><input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.dob} onChange={set("dob")} className={inputClass} /></Field>
                        <Field label="Gender">
                            <select required value={form.gender} onChange={set("gender")} className={inputClass}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                        <Field label="Present address"><input required minLength={5} value={form.address} onChange={set("address")} className={inputClass} autoComplete="street-address" /></Field>
                    </FormSection>

                    <FormSection title="Academic background">
                        <Field label="SSC / equivalent GPA"><input required type="number" min="1" max="5" step="0.01" value={form.sscGpa} onChange={set("sscGpa")} className={inputClass} /></Field>
                        <Field label="HSC / equivalent GPA"><input required type="number" min="1" max="5" step="0.01" value={form.hscGpa} onChange={set("hscGpa")} className={inputClass} /></Field>
                        <Field label="Year of passing (latest exam)"><input required type="number" min="1990" max={new Date().getFullYear() + 1} value={form.passingYear} onChange={set("passingYear")} className={inputClass} /></Field>
                    </FormSection>

                    <FormSection title="Guardian">
                        <Field label="Guardian's name"><input required minLength={3} value={form.guardianName} onChange={set("guardianName")} className={inputClass} /></Field>
                        <Field label="Guardian's phone"><input required value={form.guardianPhone} onChange={set("guardianPhone")} className={inputClass} /></Field>
                    </FormSection>

                    <fieldset className="rounded-xl border border-slate-200 bg-white p-5">
                        <legend className="px-2 text-base font-semibold text-blue-950">Statement (optional)</legend>
                        <textarea rows={3} maxLength={1500} value={form.statement} onChange={set("statement")} placeholder="Why do you want to study here?" className={`${inputClass} mt-2`} />
                    </fieldset>

                    <div className="flex justify-end">
                        <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? "Submitting..." : "Submit application"}</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default StudentAdmission;
