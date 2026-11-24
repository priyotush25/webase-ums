import { useEffect, useState } from "react";

import { getFaculty } from "../../api/publicApi";
import { Avatar, EmptyState, Spinner, inputClass } from "../../components/ui";
import { PageBanner, Section } from "./PublicPage";

const Faculty = () => {
    const [faculty, setFaculty] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(true);
            getFaculty(search.trim())
                .then((r) => setFaculty(r.faculty || []))
                .catch(() => setFaculty([]))
                .finally(() => setLoading(false));
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    return (
        <>
            <PageBanner title="Faculty directory" crumbs={[["Faculty"]]} text="Teachers across all departments." />

            <Section>
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name"
                    aria-label="Search faculty"
                    className={`${inputClass} max-w-sm`}
                />

                {loading ? (
                    <Spinner />
                ) : faculty.length === 0 ? (
                    <div className="mt-8"><EmptyState title="No faculty found" text="Try a different name." /></div>
                ) : (
                    <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {faculty.map((person) => (
                            <li key={person._id} className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                                <div className="flex justify-center"><Avatar user={person} size="h-24 w-24 text-2xl" /></div>
                                <h2 className="mt-4 font-semibold text-slate-900">{person.name}</h2>
                                <p className="text-sm text-slate-500">{person.designation || "Faculty member"}</p>
                                {person.department && <p className="mt-1 text-xs font-semibold text-blue-800">{person.department.name}</p>}
                                {person.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{person.bio}</p>}
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </>
    );
};

export default Faculty;
