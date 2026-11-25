import { Link } from "react-router";

import siteConfig from "../../config/site";

const steps = [
    { title: "Choose a department", text: "Review programs and eligibility." },
    { title: "Apply online", text: "Fill in one form. Takes about 10 minutes." },
    { title: "We review", text: "The admission office checks your application." },
    { title: "Get your decision", text: "Track your result online with your application number." },
    { title: "Create your account", text: "Sign up with the same email and start enrolling." },
];

const HomeProcess = () => (
    <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-3xl font-semibold text-blue-950">How admission works</h2>
                    <p className="mt-3 max-w-xl text-slate-600">Admission {siteConfig.admission.session} closes on {siteConfig.admission.deadline}.</p>
                </div>

                <Link to="/admissions/apply" className="inline-block self-start rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 sm:self-auto">
                    Start your application
                </Link>
            </div>

            <ol className="mt-10 grid gap-4 md:grid-cols-5">
                {steps.map((step, index) => (
                    <li key={step.title} className="rounded-lg border border-slate-200 bg-white p-4">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-xs font-semibold text-white">{index + 1}</span>
                        <h3 className="mt-3 text-sm font-semibold text-slate-900">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{step.text}</p>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default HomeProcess;
