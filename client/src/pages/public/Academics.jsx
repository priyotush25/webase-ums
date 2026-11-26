import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getDepartments } from "../../api/publicApi";
import { PageBanner, Section } from "./PublicPage";

const levels = [
    { name: "Bachelor", duration: "4 years · 8 semesters", credits: "140 credits", text: "Core courses in the first two years, then specialization, a project and an internship." },
    { name: "Masters", duration: "1.5 – 2 years", credits: "36 credits", text: "Coursework with a thesis or project option, designed for working professionals too." },
];

const Academics = () => {
    const [departments, setDepartments] = useState([]);

    useEffect(() => {
        getDepartments().then((r) => setDepartments(r.departments || [])).catch(() => {});
    }, []);

    return (
        <>
            <PageBanner title="Academic programs" crumbs={[["Academics"]]} text="Two program levels across every department." />

            <Section>
                <div className="grid gap-6 md:grid-cols-2">
                    {levels.map((level) => (
                        <div key={level.name} className="rounded-xl border border-slate-200 bg-white p-8">
                            <h2 className="text-2xl font-bold text-blue-950">{level.name}</h2>
                            <p className="mt-1 text-sm font-semibold text-gold-700">{level.duration} · {level.credits}</p>
                            <p className="mt-3 leading-7 text-slate-600">{level.text}</p>
                        </div>
                    ))}
                </div>

                <h2 className="mt-14 text-2xl font-bold text-blue-950">Departments offering these programs</h2>
                {departments.length === 0 ? (
                    <p className="mt-4 text-slate-500">Departments will be listed here soon.</p>
                ) : (
                    <ul className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                        {departments.map((dept) => (
                            <li key={dept._id}>
                                <Link to={`/departments/${dept.code}`} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-blue-50">
                                    <span>
                                        <span className="font-semibold text-slate-900">{dept.name}</span>
                                        <span className="ml-2 text-sm text-slate-500">{dept.courseCount} courses · {dept.teacherCount} teachers</span>
                                    </span>
                                    <span className="text-sm font-semibold text-blue-900">{dept.code}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </>
    );
};

export default Academics;
