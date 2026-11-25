import { Navigate, Link } from "react-router";

import { primaryBtn } from "../../components/ui";
import siteConfig from "../../config/site";
import { useAuth } from "../../context/AuthContext";
import { PageBanner, Section } from "./PublicPage";

// Admission is applied from the student dashboard, so an account comes first:
// Create account -> Login -> Apply for admission -> Admin approval
const AdmissionApply = () => {
    const { user, role, loading } = useAuth();

    if (!loading && user && role === "student") return <Navigate to="/student/admission" replace />;

    return (
        <>
            <PageBanner
                title="Apply online"
                crumbs={[["Admissions", "/admissions"], ["Apply online"]]}
                text={`Admission ${siteConfig.admission.session}. Applications close on ${siteConfig.admission.deadline}.`}
            />

            <Section>
                <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center">
                    <h2 className="text-xl font-bold text-slate-900">Create your student account first</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign up, log in, then open <strong>Apply for Admission</strong> on your dashboard and choose your department.
                        After the admin approves it you can see your semester subjects and enroll.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Link to="/signup" className={primaryBtn}>Create account</Link>
                        <Link to="/login" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">I already have an account</Link>
                    </div>
                </div>
            </Section>
        </>
    );
};

export default AdmissionApply;
