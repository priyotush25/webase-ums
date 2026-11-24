import { BookOpen, Briefcase, Cpu, Languages, Zap } from "lucide-react";
import { Link } from "react-router";

import { PageBanner } from "./PublicPage";

const programs = [
    { icon: Cpu, name: "Computer Science & Engineering", degree: "B.Sc. · 4 years", text: "Programming, algorithms, databases, AI and software engineering." },
    { icon: Zap, name: "Electrical & Electronic Engineering", degree: "B.Sc. · 4 years", text: "Power systems, electronics, communication and control." },
    { icon: Briefcase, name: "Business Administration", degree: "BBA · 4 years", text: "Management, marketing, finance and entrepreneurship." },
    { icon: Languages, name: "English", degree: "B.A. · 4 years", text: "Literature, linguistics, translation and professional communication." },
];

const Academics = () => (
    <>
        <PageBanner
            eyebrow="Academics"
            title="Programs & Departments"
            text="Choose a program, register for courses online and track your attendance and results in one place."
        />

        <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-6 md:grid-cols-2">
                {programs.map(({ icon: Icon, name, degree, text }) => (
                    <div key={name} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="h-fit rounded-lg bg-blue-100 p-3 text-blue-900">
                            <Icon size={22} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">{name}</h3>
                            <p className="text-xs font-medium text-blue-800">{degree}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-3 text-center">
                <BookOpen className="text-blue-900" />
                <p className="text-slate-600">Already a student? Log in to browse and enroll in this semester's courses.</p>
                <Link to="/login" className="rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">
                    Go to Student Portal
                </Link>
            </div>
        </section>
    </>
);

export default Academics;
