import { Link } from "react-router";

import { Avatar } from "../ui";

const HomeFaculty = ({ faculty = [] }) => {
    if (faculty.length === 0) return null;

    return (
        <section className="bg-slate-50 py-16">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <h2 className="text-3xl font-semibold text-blue-950">Meet our faculty</h2>
                    <Link to="/faculty" className="text-sm font-semibold text-blue-900 hover:underline">Full directory</Link>
                </div>

                <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {faculty.slice(0, 4).map((person) => (
                        <li key={person._id} className="rounded-xl border border-slate-200 bg-white p-6 text-center">
                            <div className="flex justify-center"><Avatar user={person} size="h-20 w-20 text-xl" /></div>
                            <h3 className="mt-4 font-semibold text-slate-900">{person.name}</h3>
                            <p className="text-sm text-slate-500">{person.designation || "Faculty member"}</p>
                            {person.department && <p className="mt-1 text-xs font-semibold text-blue-800">{person.department.name}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default HomeFaculty;
