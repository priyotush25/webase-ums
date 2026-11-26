import { Link } from "react-router";

const HomeDepartments = ({ departments = [] }) => (
    <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                    <h2 className="text-3xl font-semibold text-blue-950">Departments</h2>
                    <p className="mt-3 max-w-xl text-slate-600">Choose a department to see its courses, faculty and how to apply.</p>
                </div>
                <Link to="/departments" className="text-sm font-semibold text-blue-900 hover:underline">All departments</Link>
            </div>

            {departments.length === 0 ? (
                <p className="mt-10 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                    Departments will appear here once the administrator adds them.
                </p>
            ) : (
                <ul className="mt-10 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                    {departments.slice(0, 8).map((dept) => (
                        <li key={dept._id} className="bg-white">
                            <Link to={`/departments/${dept.code}`} className="block h-full p-6 hover:bg-blue-50">
                                <p className="font-display text-2xl font-bold text-blue-900">{dept.code}</p>
                                <h3 className="mt-2 font-semibold text-slate-900">{dept.name}</h3>
                                {dept.description && <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-500">{dept.description}</p>}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </section>
);

export default HomeDepartments;
