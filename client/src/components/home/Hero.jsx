
import { ArrowRight, GraduationCap, PlayCircle } from "lucide-react";
import { Link } from "react-router";

const Hero = () => {
    return (
        <section className="bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 lg:py-24">

                    {/* Left Content */}

                    <div>

                        <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold">
                            <GraduationCap size={18} />
                            Welcome to Our University
                        </span>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-950 leading-tight mt-6">
                            Build Your Future
                            <span className="text-blue-700 block">
                                Through Education
                            </span>
                        </h1>

                        <p className="text-gray-600 text-base md:text-lg leading-relaxed mt-6 max-w-xl">
                            Discover your potential with quality education,
                            experienced faculty, and modern learning facilities.
                            Start your journey towards a successful future today.
                        </p>

                        {/* Buttons */}

                        <div className="flex flex-wrap items-center gap-4 mt-8">

                            <Link
                                to="/academics"
                                className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-6 py-3.5 rounded-lg font-semibold transition shadow-lg shadow-blue-900/20"
                            >
                                Explore Programs
                                <ArrowRight size={19} />
                            </Link>

                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 border border-blue-900 text-blue-900 hover:bg-blue-50 px-6 py-3.5 rounded-lg font-semibold transition"
                            >
                                <PlayCircle size={20} />
                                Discover More
                            </Link>

                        </div>

                        {/* Statistics */}

                        <div className="grid grid-cols-3 gap-5 mt-12 border-t border-blue-100 pt-8">

                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-blue-950">
                                    10+
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    Departments
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-blue-950">
                                    5K+
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    Students
                                </p>
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-blue-950">
                                    100+
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    Teachers
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Right Image */}

                    <div className="relative">

                        <div className="absolute -top-8 -right-8 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-60"></div>

                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">

                            <img
                                src="https://images.unsplash.com/photo-1562774053-701939374585?w=1000"
                                alt="University campus"
                                className="w-full h-[350px] md:h-[450px] object-cover"
                            />

                        </div>

                        {/* Floating Card */}

                        <div className="absolute -bottom-6 -left-4 md:-left-8 bg-white p-5 rounded-2xl shadow-xl flex items-center gap-4">

                            <div className="bg-blue-100 text-blue-900 p-3 rounded-xl">
                                <GraduationCap size={28} />
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900">
                                    Quality Education
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Shape Your Future
                                </p>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
};

export default Hero;
