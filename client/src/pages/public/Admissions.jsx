import { Link } from "react-router";

import siteConfig from "../../config/site";
import { PageBanner, Section } from "./PublicPage";

const steps = [
    "Choose a department and check eligibility below.",
    "Fill in the online application form and note your application number.",
    "The admission office reviews your application.",
    "Check your decision with Track application.",
    "If approved, create a portal account using the same email, then enroll in your courses.",
];

const Admissions = () => {
    const { admission } = siteConfig;

    return (
        <>
            <PageBanner title={`Admission ${admission.session}`} crumbs={[["Admissions"]]} text={`Applications close on ${admission.deadline}.`} />

            <Section>
                <div className="grid gap-12 lg:grid-cols-3">
                    <div className="space-y-10 lg:col-span-2">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-950">Eligibility</h2>
                            <ul className="mt-4 space-y-3 text-slate-600">
                                {admission.eligibility.map((item) => (
                                    <li key={item} className="flex gap-3 leading-7"><span className="mt-3 h-1 w-3 shrink-0 bg-blue-900" aria-hidden="true" />{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-blue-950">Documents to keep ready</h2>
                            <ul className="mt-4 space-y-3 text-slate-600">
                                {admission.documents.map((item) => (
                                    <li key={item} className="flex gap-3 leading-7"><span className="mt-3 h-1 w-3 shrink-0 bg-gold-500" aria-hidden="true" />{item}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-sm text-slate-500">Bring the originals when you visit the admission office after approval.</p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-blue-950">Process</h2>
                            <ol className="mt-4 space-y-4">
                                {steps.map((step, index) => (
                                    <li key={step} className="flex gap-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">{index + 1}</span>
                                        <p className="pt-1 text-slate-700">{step}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="text-lg font-bold text-blue-950">Ready to apply?</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">The form takes about 10 minutes. There is no application fee.</p>
                        <Link to="/admissions/apply" className="mt-5 block rounded-lg bg-gold-500 px-5 py-3 text-center font-semibold text-blue-950 hover:bg-gold-400">Apply online</Link>
                        <Link to="/admissions/track" className="mt-3 block rounded-lg border border-slate-300 px-5 py-3 text-center font-semibold text-blue-900 hover:bg-slate-50">Track application</Link>
                        <p className="mt-5 text-sm text-slate-500">Questions? Email <a href={`mailto:${siteConfig.admissionEmail}`} className="font-semibold text-blue-900">{siteConfig.admissionEmail}</a></p>
                    </aside>
                </div>
            </Section>
        </>
    );
};

export default Admissions;
