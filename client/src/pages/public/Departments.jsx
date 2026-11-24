import { useEffect, useState } from "react";
import { Link } from "react-router";

import { getDepartments } from "../../api/publicApi";
import { EmptyState, Spinner } from "../../components/ui";
import { PageBanner, Section } from "./PublicPage";

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDepartments()
            .then((r) => setDepartments(r.departments || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <PageBanner title="Departments" crumbs={[["Departments"]]} text="Each department lists its courses by semester and its teachers." />

            <Section>
                {loading ? (
                    <Spinner />
                ) : departments.length === 0 ? (
                    <EmptyState title="No departments yet" text="Departments appear here after the administrator adds them." />
                ) : (
                    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {departments.map((dept) => (
                            <li key={dept._id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
                                <p className="font-display text-3xl font-bold text-blue-900">{dept.code}</p>
                                <h2 className="mt-2 text-lg font-semibold text-slate-900">{dept.name}</h2>
                                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{dept.description || "Explore the courses and faculty of this department."}</p>
                                <p className="mt-4 text-xs text-slate-500">{dept.courseCount} courses · {dept.teacherCount} teachers</p>
                                <Link to={`/departments/${dept.code}`} className="mt-3 text-sm font-semibold text-blue-900 hover:underline">View department</Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </>
    );
};

export default Departments;
