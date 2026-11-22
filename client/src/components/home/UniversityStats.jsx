
const statistics = [
    {
        value: "12,500",
        label: "Students enrolled",
    },
    {
        value: "38",
        label: "Academic programs",
    },
    {
        value: "420",
        label: "Faculty members",
    },
    {
        value: "2003",
        label: "Year established",
    },
];

const UniversityStats = () => {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* Section Introduction */}
                <div className="mb-14 grid gap-6 md:grid-cols-2 md:items-end">

                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                            Our University in Numbers
                        </p>

                        <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                            A community built around
                            <span className="text-slate-400"> learning and growth.</span>
                        </h2>
                    </div>

                    <p className="max-w-md text-sm leading-7 text-slate-500 md:justify-self-end">
                        We bring together ambitious students, dedicated
                        educators and a diverse academic community to create
                        opportunities for the next generation.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 border-y border-slate-200 md:grid-cols-4">

                    {statistics.map((item, index) => (
                        <div
                            key={item.label}
                            className={`py-9 pr-4 ${
                                index % 2 === 0 ? "border-r" : ""
                            } ${
                                index < 2 ? "border-b" : ""
                            } border-slate-200 md:border-b-0 md:pr-8 ${
                                index !== 3 ? "md:border-r" : "md:border-r-0"
                            } md:pl-8 first:md:pl-0`}
                        >
                            <p className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                                {item.value}
                            </p>

                            <p className="mt-3 text-sm text-slate-500">
                                {item.label}
                            </p>
                        </div>
                    ))}

                </div>

                {/* Bottom Note */}
                <div className="mt-5 flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">
                    <p>Growing together through education and innovation.</p>
                    <p>Knowledge · Opportunity · Excellence</p>
                </div>

            </div>
        </section>
    );
};

export default UniversityStats;
