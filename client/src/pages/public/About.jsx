import { Link } from "react-router";

import siteConfig from "../../config/site";
import { PageBanner, Section } from "./PublicPage";

const About = () => (
    <>
        <PageBanner title="About the university" crumbs={[["About"]]} text={`${siteConfig.name} has served students since ${siteConfig.established}.`} />

        <Section>
            <div className="grid gap-12 lg:grid-cols-2">
                <div>
                    <h2 className="text-2xl font-bold text-blue-950">Our mission</h2>
                    <p className="mt-3 leading-7 text-slate-600">
                        To give every capable student access to well-taught, affordable higher education that leads to real careers and responsible citizenship.
                    </p>

                    <h2 className="mt-8 text-2xl font-bold text-blue-950">Our vision</h2>
                    <p className="mt-3 leading-7 text-slate-600">
                        A university known for teaching quality, honest assessment and graduates who are trusted by employers.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-blue-950">Milestones</h2>
                    <ol className="mt-4 space-y-5 border-l-2 border-gold-500 pl-6">
                        {siteConfig.milestones.map((item) => (
                            <li key={item.year}>
                                <p className="font-display text-lg font-bold text-blue-900">{item.year}</p>
                                <p className="text-slate-600">{item.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </Section>

        <section className="bg-slate-50">
            <Section>
                <h2 className="text-2xl font-bold text-blue-950">What we stand for</h2>
                <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {siteConfig.values.map((value) => (
                        <li key={value.title} className="border-t-2 border-gold-500 pt-4">
                            <h3 className="font-semibold text-slate-900">{value.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{value.text}</p>
                        </li>
                    ))}
                </ul>
            </Section>
        </section>

        <Section className="text-center">
            <h2 className="text-2xl font-bold text-blue-950">Join the next batch</h2>
            <Link to="/admissions/apply" className="mt-5 inline-block rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">Apply online</Link>
        </Section>
    </>
);

export default About;
