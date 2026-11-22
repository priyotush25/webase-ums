
import {
    ArrowRight,
    BriefcaseBusiness,
    FlaskConical,
    GraduationCap,
    Monitor,
    Scale
} from "lucide-react";

import { Link } from "react-router";

const Programs = () => {

    const programs = [
        {
            id: 1,
            title: "Computer Science & Engineering",
            shortName: "CSE",
            description:
                "Develop your technical skills in programming, software engineering, networking, and modern technologies.",
            degree: "Bachelor Degree",
            duration: "4 Years",
            icon: Monitor,
        },
        {
            id: 2,
            title: "Business Administration",
            shortName: "BBA",
            description:
                "Build your business knowledge, leadership abilities, management skills, and entrepreneurial mindset.",
            degree: "Bachelor Degree",
            duration: "4 Years",
            icon: BriefcaseBusiness,
        },
        {
            id: 3,
            title: "Law",
            shortName: "LLB",
            description:
                "Explore legal systems, constitutional law, human rights, and the principles of justice.",
            degree: "Bachelor Degree",
            duration: "4 Years",
            icon: Scale,
        },
        {
            id: 4,
            title: "Pharmacy",
            shortName: "PHARM",
            description:
                "Learn pharmaceutical sciences, drug development, healthcare, and modern medicine.",
            degree: "Bachelor Degree",
            duration: "4 Years",
            icon: FlaskConical,
        },
    ];

    return (
        <section className="py-20 bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Heading */}

                <div className="text-center max-w-2xl mx-auto mb-14">

                    <span className="text-blue-800 font-semibold text-sm uppercase tracking-widest">
                        Academic Excellence
                    </span>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-3">
                        Explore Our Academic Programs
                    </h2>

                    <p className="text-gray-500 mt-4 leading-relaxed">
                        Discover a wide range of academic programs designed
                        to prepare students for successful careers and
                        lifelong learning.
                    </p>

                </div>

                {/* Programs Grid */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {programs.map((program) => {

                        const Icon = program.icon;

                        return (
                            <div
                                key={program.id}
                                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-800 hover:shadow-xl transition-all duration-300"
                            >

                                {/* Icon */}

                                <div className="w-14 h-14 flex items-center justify-center bg-blue-50 text-blue-900 rounded-xl group-hover:bg-blue-900 group-hover:text-white transition-all duration-300">

                                    <Icon size={28} />

                                </div>

                                {/* Program Info */}

                                <div className="mt-6">

                                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
                                        {program.shortName}
                                    </span>

                                    <h3 className="text-lg font-bold text-gray-900 mt-4 min-h-14">
                                        {program.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 leading-relaxed mt-3 min-h-20">
                                        {program.description}
                                    </p>

                                </div>

                                {/* Degree Information */}

                                <div className="border-t border-gray-100 mt-5 pt-5 space-y-2">

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            Degree
                                        </span>

                                        <span className="font-medium text-gray-800">
                                            {program.degree}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            Duration
                                        </span>

                                        <span className="font-medium text-gray-800">
                                            {program.duration}
                                        </span>
                                    </div>

                                </div>

                                {/* Learn More */}

                                <Link
                                    to="/academics"
                                    className="flex items-center justify-between text-blue-900 font-semibold text-sm mt-6 group-hover:text-blue-700"
                                >
                                    Learn More

                                    <ArrowRight
                                        size={18}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />

                                </Link>

                            </div>
                        );
                    })}

                </div>

                {/* View All Programs */}

                <div className="text-center mt-12">

                    <Link
                        to="/academics"
                        className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-7 py-3 rounded-lg font-semibold transition"
                    >
                        <GraduationCap size={20} />
                        View All Programs
                    </Link>

                </div>

            </div>

        </section>
    );
};

export default Programs;
    