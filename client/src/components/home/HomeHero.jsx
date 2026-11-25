import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import siteConfig from "../../config/site";
import CampusIllustration from "../public/CampusIllustration";

const HomeHero = () => (
    <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
            <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                    Admission {siteConfig.admission.session} is open
                </p>

                <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-[1.15] tracking-tight text-blue-950 md:text-5xl">
                    One portal for your entire university life.
                </h1>

                <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                    {siteConfig.name} runs admission, enrollment, attendance, results and fees on a single secure platform, so students, teachers and staff spend less time on paperwork.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/admissions/apply" className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800">
                        Apply online <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50">
                        Sign in to portal
                    </Link>
                </div>

                <p className="mt-5 text-sm text-slate-500">Last date to apply: {siteConfig.admission.deadline}</p>
            </div>

            <div className="hidden lg:block">
                <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                    <CampusIllustration className="block h-auto w-full" />
                </div>
            </div>
        </div>
    </section>
);

export default HomeHero;
