import { Link } from "react-router";

const FALLBACK = [
    { _id: "cse", code: "CSE", name: "Computer Science & Engineering", description: "Programming, algorithms, databases and AI." },
    { _id: "eee", code: "EEE", name: "Electrical & Electronic Engineering", description: "Power, electronics and communication." },
    { _id: "bba", code: "BBA", name: "Business Administration", description: "Management, marketing and finance." },
    { _id: "eng", code: "ENG", name: "English", description: "Literature, linguistics and communication." },
];

const HomeDepartments = ({ departments }) => {
    const list = departments?.length ? departments : FALLBACK;

    return (
        <section className="border-t border-slate-200 bg-slate-50 py-20">
            <div className="mx-auto max-w-6xl px-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-blue-950">Departments</h2>
                        <p className="mt-3 max-w-xl text-slate-600">Browse departments, then enroll in their courses from your portal.</p>
                    </div>
                    <Link to="/academics" className="text-sm font-semibold text-blue-900 hover:underline">All programs</Link>
                </div>

                <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                    {list.slice(0, 8).map((dept) => (
                        <li key={dept._id} className="bg-white p-6">
                            <p className="font-display text-2xl font-bold text-blue-900">{dept.code}</p>
                            <h3 className="mt-2 font-semibold text-slate-900">{dept.name}</h3>
                            {dept.description && <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">{dept.description}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default HomeDepartments;
