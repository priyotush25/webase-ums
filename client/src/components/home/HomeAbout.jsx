import { Link } from "react-router";

import siteConfig from "../../config/site";

const HomeAbout = ({ stats }) => {
    const items = stats
        ? [
              ["Students", stats.students],
              ["Teachers", stats.teachers],
              ["Departments", stats.departments],
              ["Active courses", stats.courses],
          ]
        : [];

    return (
        <section className="bg-slate-50 py-16">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
                <div>
                    <h2 className="text-3xl font-semibold text-blue-950">A university built around its students</h2>
                    <p className="mt-4 leading-7 text-slate-600">
                        Since {siteConfig.established}, {siteConfig.name} has focused on practical, well-taught programs and a campus where students are known by name. From online admission to results, everything runs through one secure portal.
                    </p>
                    <p className="mt-3 leading-7 text-slate-600">
                        Teachers publish assignments, take attendance and enter marks online. Students follow their routine and results from any device.
                    </p>
                    <Link to="/about" className="mt-6 inline-block font-semibold text-blue-900 hover:underline">Read about the university</Link>
                </div>

                {items.length > 0 && (
                    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200">
                        {items.map(([label, value]) => (
                            <div key={label} className="bg-white p-8">
                                <dd className="font-display text-4xl font-bold text-blue-900">{value.toLocaleString()}</dd>
                                <dt className="mt-1 text-sm text-slate-500">{label}</dt>
                            </div>
                        ))}
                    </dl>
                )}
            </div>
        </section>
    );
};

export default HomeAbout;
