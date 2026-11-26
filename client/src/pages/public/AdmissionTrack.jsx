import { useState } from "react";
import { Link } from "react-router";

import { trackApplication } from "../../api/admissionApi";
import { Badge, Field, formatDate, inputClass, primaryBtn } from "../../components/ui";
import { PageBanner, Section } from "./PublicPage";

export const STATUS_INFO = {
    pending: { label: "Received", color: "slate", text: "Your application has been received and is waiting for review." },
    under_review: { label: "Under review", color: "blue", text: "The admission office is reviewing your application." },
    approved: { label: "Approved", color: "green", text: "Congratulations. Your admission is approved. Sign in to your student dashboard to see your semester subjects and send enrollment requests." },
    waitlisted: { label: "Waitlisted", color: "amber", text: "You are on the waiting list. We will update this page if a seat opens." },
    rejected: { label: "Not selected", color: "red", text: "We could not offer you a seat this time. You may apply again next session." },
};

const AdmissionTrack = () => {
    const [applicationNo, setApplicationNo] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setResult(null);
            const response = await trackApplication(applicationNo.trim(), email.trim());
            setResult(response.application);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const info = result && STATUS_INFO[result.status];

    return (
        <>
            <PageBanner title="Track your application" crumbs={[["Admissions", "/admissions"], ["Track application"]]} />

            <Section>
                <div className="mx-auto max-w-xl">
                    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                        <Field label="Application number"><input required value={applicationNo} onChange={(e) => setApplicationNo(e.target.value)} placeholder="APP-2027-0001" className={inputClass} /></Field>
                        <Field label="Email used in the application"><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
                        <button type="submit" disabled={loading} className={`${primaryBtn} w-full`}>{loading ? "Checking..." : "Check status"}</button>
                    </form>

                    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}

                    {result && (
                        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6" role="status">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-display text-xl font-bold text-blue-900">{result.applicationNo}</p>
                                <Badge color={info.color}>{info.label}</Badge>
                            </div>
                            <p className="mt-3 text-slate-700">{info.text}</p>

                            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm">
                                <div><dt className="text-slate-400">Applicant</dt><dd className="font-medium text-slate-900">{result.name}</dd></div>
                                <div><dt className="text-slate-400">Department</dt><dd className="font-medium text-slate-900">{result.department?.name}</dd></div>
                                <div><dt className="text-slate-400">Program</dt><dd className="font-medium text-slate-900">{result.program}</dd></div>
                                <div><dt className="text-slate-400">Submitted</dt><dd className="font-medium text-slate-900">{formatDate(result.submittedAt)}</dd></div>
                            </dl>

                            {result.note && (
                                <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-700"><strong>Note from admission office:</strong> {result.note}</p>
                            )}

                            {result.status === "approved" && (
                                <Link to="/signup" className={`${primaryBtn} mt-5 w-full`}>Create your student account</Link>
                            )}
                        </div>
                    )}
                </div>
            </Section>
        </>
    );
};

export default AdmissionTrack;
