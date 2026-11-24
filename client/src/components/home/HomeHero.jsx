import { Link } from "react-router";

import siteConfig from "../../config/site";
import CampusIllustration from "../public/CampusIllustration";

const HomeHero = () => (
    <section className="relative overflow-hidden bg-blue-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
                <p className="inline-block border-l-2 border-gold-500 pl-3 text-sm font-medium text-gold-400">
                    Admission {siteConfig.admission.session} is open
                </p>

                <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.1] md:text-5xl">
                    Education that prepares you for work and for life.
                </h1>

                <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">
                    {siteConfig.name} offers Bachelor and Masters programs taught by experienced faculty, with a fully digital campus from application to graduation.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/admissions/apply" className="rounded-lg bg-gold-500 px-6 py-3 font-semibold text-blue-950 hover:bg-gold-400">
                        Apply online
                    </Link>
                    <Link to="/departments" className="rounded-lg border border-white/40 px-6 py-3 font-semibold hover:bg-white/10">
                        Explore departments
                    </Link>
                </div>

                <p className="mt-5 text-sm text-blue-200">Last date to apply: {siteConfig.admission.deadline}</p>
            </div>

            <div className="hidden lg:block">
                <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                    <CampusIllustration className="block h-auto w-full" />
                </div>
            </div>
        </div>
    </section>
);

export default HomeHero;
