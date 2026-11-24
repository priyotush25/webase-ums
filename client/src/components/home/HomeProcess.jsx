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
    <section className="bg-blue-900 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-bold">How admission works</h2>
            <p className="mt-3 max-w-xl text-blue-100">Admission {siteConfig.admission.session} closes on {siteConfig.admission.deadline}.</p>

            <ol className="mt-10 grid gap-6 md:grid-cols-5">
                {steps.map((step, index) => (
                    <li key={step.title} className="border-t border-white/30 pt-4">
                        <span className="text-sm font-semibold text-gold-400">Step {index + 1}</span>
                        <h3 className="mt-1 font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-blue-100">{step.text}</p>
                    </li>
                ))}
            </ol>

            <Link to="/admissions/apply" className="mt-10 inline-block rounded-lg bg-gold-500 px-6 py-3 font-semibold text-blue-950 hover:bg-gold-400">
                Start your application
            </Link>
        </div>
    </section>
);

export default HomeProcess;
