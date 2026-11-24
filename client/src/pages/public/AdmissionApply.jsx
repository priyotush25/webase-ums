import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { toast } from "react-toastify";

import { submitApplication } from "../../api/admissionApi";
import { getDepartments } from "../../api/publicApi";
import { Field, inputClass, primaryBtn } from "../../components/ui";
import siteConfig from "../../config/site";
import { PageBanner, Section } from "./PublicPage";

const INITIAL = {
    name: "", email: "", phone: "", dob: "", gender: "", address: "",
    department: "", program: "Bachelor",
    sscGpa: "", hscGpa: "", passingYear: String(new Date().getFullYear()),
    guardianName: "", guardianPhone: "", statement: "",
};

const FormSection = ({ title, children }) => (
    <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
        <legend className="px-2 text-lg font-bold text-blue-950">{title}</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
);

const AdmissionApply = () => {
    const [form, setForm] = useState(INITIAL);
    const [departments, setDepartments] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(null);

    useEffect(() => {
        getDepartments().then((r) => setDepartments(r.departments || [])).catch(() => {});
    }, []);

    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSubmitting(true);
            const response = await submitApplication(form);
            setDone({ applicationNo: response.applicationNo, email: form.email });
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (error) {
            toast.error(error.message || "Could not submit the application");
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <>
                <PageBanner title="Application received" crumbs={[["Admissions", "/admissions"], ["Apply online"]]} />
                <Section>
                    <div className="mx-auto max-w-xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                        <CheckCircle className="mx-auto text-emerald-600" size={44} />
                        <h2 className="mt-4 text-2xl font-bold text-slate-900">Thank you, your application is in.</h2>
                        <p className="mt-2 text-slate-600">Save your application number. You need it with your email to check the decision.</p>
                        <p className="my-5 rounded-lg bg-white py-4 font-display text-3xl font-bold tracking-wide text-blue-900">{done.applicationNo}</p>
                        <p className="text-sm text-slate-600">Sign-up later with <strong>{done.email}</strong> so your admission links to your account.</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <Link to="/admissions/track" className={primaryBtn}>Track application</Link>
                            <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">Back to home</Link>
                        </div>
                    </div>
                </Section>
            </>
        );
    }

    return (
        <>
            <PageBanner title="Apply online" crumbs={[["Admissions", "/admissions"], ["Apply online"]]} text={`Admission ${siteConfig.admission.session}. Applications close on ${siteConfig.admission.deadline}.`} />

            <Section>
                <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
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
                        <Field label="Email" hint="Use the email you will sign up with."><input required type="email" value={form.email} onChange={set("email")} className={inputClass} autoComplete="email" /></Field>
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

                    <fieldset className="rounded-xl border border-slate-200 bg-white p-6">
                        <legend className="px-2 text-lg font-bold text-blue-950">Statement (optional)</legend>
                        <textarea rows={4} maxLength={1500} value={form.statement} onChange={set("statement")} placeholder="Why do you want to study here?" className={`${inputClass} mt-2`} />
                    </fieldset>

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">By submitting you confirm the information is correct.</p>
                        <button type="submit" disabled={submitting} className={primaryBtn}>{submitting ? "Submitting..." : "Submit application"}</button>
                    </div>
                </form>
            </Section>
        </>
    );
};

export default AdmissionApply;
