import { Eye, GraduationCap, Target, Users } from "lucide-react";
import { Link } from "react-router";

import { PageBanner } from "./PublicPage";

const values = [
    { icon: Target, title: "Our Mission", text: "To deliver accessible, high-quality education that prepares students for real-world challenges." },
    { icon: Eye, title: "Our Vision", text: "To become a leading university known for innovation, research and community impact." },
    { icon: Users, title: "Our Community", text: "A diverse campus of students, teachers and staff learning and growing together." },
    { icon: GraduationCap, title: "Our Promise", text: "Modern teaching, transparent management and support for every learner." },
];

const About = () => (
    <>
        <PageBanner
            eyebrow="About Us"
            title="A University Built Around Students"
            text="From admission to graduation, our digital campus keeps students, teachers and administrators connected."
        />

        <section className="mx-auto max-w-6xl px-4 py-16">
            <div className="grid gap-6 sm:grid-cols-2">
                {values.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 text-blue-900">
                            <Icon size={22} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                ))}
            </div>

            <div className="mt-12 rounded-2xl bg-blue-50 p-8 text-center">
                <h2 className="text-2xl font-bold text-blue-950">Ready to join us?</h2>
                <p className="mt-2 text-slate-600">Create your student account and start enrolling in courses.</p>
                <Link to="/signup" className="mt-5 inline-block rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">
                    Apply Now
                </Link>
            </div>
        </section>
    </>
);

export default About;
