import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";

import { getDepartment } from "../../api/publicApi";
import { Avatar, Spinner } from "../../components/ui";
import { PageBanner, Section } from "./PublicPage";

const DepartmentDetail = () => {
    const { code } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        setLoading(true);
        getDepartment(code)
            .then((response) => {
                setData(response);
                setNotFound(false);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [code]);

    const bySemester = useMemo(() => {
        const map = new Map();
        for (const course of data?.courses || []) {
            if (!map.has(course.semester)) map.set(course.semester, []);
            map.get(course.semester).push(course);
        }
        return [...map.entries()];
    }, [data]);

    if (loading) return <Section><Spinner /></Section>;

    if (notFound) {
        return (
            <Section className="text-center">
                <h1 className="text-2xl font-bold text-blue-950">Department not found</h1>
                <Link to="/departments" className="mt-4 inline-block font-semibold text-blue-900 hover:underline">Back to departments</Link>
            </Section>
        );
    }

    const { department, faculty } = data;

    return (
        <>
            <PageBanner title={department.name} crumbs={[["Departments", "/departments"], [department.code]]} text={department.description} />

            <Section>
                <div className="grid gap-12 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-blue-950">Courses</h2>

                        {bySemester.length === 0 ? (
                            <p className="mt-4 text-slate-500">Courses have not been added yet.</p>
                        ) : (
                            bySemester.map(([semester, courses]) => (
                                <div key={semester} className="mt-6">
                                    <h3 className="mb-2 font-semibold text-slate-900">{semester}</h3>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                        <table className="w-full min-w-[420px] text-left text-sm">
                                            <thead className="bg-slate-50 text-xs text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-2.5 font-medium">Code</th>
                                                    <th className="px-4 py-2.5 font-medium">Course</th>
                                                    <th className="px-4 py-2.5 font-medium">Credit</th>
                                                    <th className="px-4 py-2.5 font-medium">Teacher</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {courses.map((course) => (
                                                    <tr key={course._id}>
                                                        <td className="px-4 py-2.5 font-semibold text-blue-900">{course.code}</td>
                                                        <td className="px-4 py-2.5">{course.title}</td>
                                                        <td className="px-4 py-2.5">{course.credit}</td>
                                                        <td className="px-4 py-2.5 text-slate-600">{course.teacher?.name || "To be assigned"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <aside>
                        <h2 className="text-2xl font-bold text-blue-950">Faculty</h2>
                        {faculty.length === 0 ? (
                            <p className="mt-4 text-slate-500">Faculty list coming soon.</p>
                        ) : (
                            <ul className="mt-4 space-y-4">
                                {faculty.map((person) => (
                                    <li key={person._id} className="flex items-center gap-3">
                                        <Avatar user={person} size="h-12 w-12" />
                                        <div>
                                            <p className="font-semibold text-slate-900">{person.name}</p>
                                            <p className="text-sm text-slate-500">{person.designation || "Faculty member"}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <Link to="/admissions/apply" className="mt-8 block rounded-lg bg-gold-500 px-5 py-3 text-center font-semibold text-blue-950 hover:bg-gold-400">
                            Apply to this department
                        </Link>
                    </aside>
                </div>
            </Section>
        </>
    );
};

export default DepartmentDetail;
