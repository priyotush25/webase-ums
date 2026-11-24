const HomeStats = ({ stats }) => {
    if (!stats) return null;

    const items = [
        ["Students", stats.students],
        ["Teachers", stats.teachers],
        ["Departments", stats.departments],
        ["Active courses", stats.courses],
    ];

    return (
        <section className="border-b border-slate-200 bg-slate-50" aria-label="University at a glance">
            <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 px-4 md:grid-cols-4">
                {items.map(([label, value]) => (
                    <div key={label} className="px-4 py-6 first:pl-0">
                        <dt className="text-sm text-slate-500">{label}</dt>
                        <dd className="mt-1 font-display text-2xl font-bold text-blue-950">{value.toLocaleString()}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

export default HomeStats;
