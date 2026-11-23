
import {
    BookOpen,
    Building2,
    Eye,
    GraduationCap,
    Target,
    Users
} from "lucide-react";

const AboutUniversity = () => {
    const features = [
        {
            icon: GraduationCap,
            title: "Quality Education",
            description: "Providing quality education and academic excellence for every student."
        },
        {
            icon: Users,
            title: "Expert Teachers",
            description: "Experienced teachers dedicated to student learning and development."
        },
        {
            icon: BookOpen,
            title: "Modern Learning",
            description: "Creating a modern learning environment with technology."
        },
        {
            icon: Building2,
            title: "Campus Facilities",
            description: "Providing a supportive environment for academic and personal growth."
        }
    ];

    return (
        <div className="bg-gray-50">

            {/* Hero Section */}
            <section className="bg-blue-950 text-white py-20 px-4">
                <div className="max-w-6xl mx-auto text-center">

                    <GraduationCap
                        size={50}
                        className="mx-auto mb-5"
                    />

                    <h1 className="text-3xl md:text-5xl font-bold">
                        About Our University
                    </h1>

                    <p className="text-blue-200 mt-4 max-w-2xl mx-auto leading-7">
                        Welcome to our University Management System.
                        We are committed to providing quality education,
                        academic excellence, and a better learning experience.
                    </p>

                </div>
            </section>

            {/* About Section */}
            <section className="max-w-6xl mx-auto px-4 py-16">

                <div className="grid md:grid-cols-2 gap-10 items-center">

                    <div>
                        <p className="text-blue-900 font-semibold mb-2">
                            WHO WE ARE
                        </p>

                        <h2 className="text-3xl font-bold text-gray-800 mb-5">
                            Building a Better Future Through Education
                        </h2>

                        <p className="text-gray-600 leading-7 mb-4">
                            Our university is dedicated to creating
                            opportunities for students to achieve
                            their academic and professional goals.
                        </p>

                        <p className="text-gray-600 leading-7">
                            Through quality education, experienced
                            teachers, and modern technology, we aim
                            to create a positive learning environment
                            for everyone.
                        </p>
                    </div>

                    <div className="bg-blue-100 rounded-lg p-10 flex items-center justify-center min-h-64">
                        <GraduationCap
                            size={130}
                            className="text-blue-900"
                        />
                    </div>

                </div>

            </section>

            {/* Mission & Vision */}
            <section className="bg-white py-16 px-4">

                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">

                    <div className="border border-gray-200 rounded-lg p-7">

                        <Target size={35} className="text-blue-900 mb-4" />

                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Our Mission
                        </h3>

                        <p className="text-gray-600 leading-7">
                            To provide quality education, develop
                            professional skills, and prepare students
                            for future challenges.
                        </p>

                    </div>

                    <div className="border border-gray-200 rounded-lg p-7">

                        <Eye size={35} className="text-blue-900 mb-4" />

                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Our Vision
                        </h3>

                        <p className="text-gray-600 leading-7">
                            To become a center of academic excellence
                            where students can learn, innovate, and
                            achieve their dreams.
                        </p>

                    </div>

                </div>

            </section>

            {/* Features */}
            <section className="max-w-6xl mx-auto px-4 py-16">

                <div className="text-center mb-10">

                    <h2 className="text-3xl font-bold text-gray-800">
                        Why Choose Us?
                    </h2>

                    <p className="text-gray-500 mt-3">
                        Creating a better educational experience for everyone.
                    </p>

                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition"
                            >
                                <div className="bg-blue-100 text-blue-900 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icon size={28} />
                                </div>

                                <h3 className="font-bold text-gray-800 mb-2">
                                    {feature.title}
                                </h3>

                                <p className="text-sm text-gray-500 leading-6">
                                    {feature.description}
                                </p>

                            </div>
                        );
                    })}

                </div>

            </section>

            {/* Bottom Section */}
            <section className="bg-blue-950 text-white py-12 px-4">

                <div className="max-w-4xl mx-auto text-center">

                    <h2 className="text-2xl md:text-3xl font-bold">
                        Education Is The Key To Success
                    </h2>

                    <p className="text-blue-200 mt-4">
                        Learn, Grow, and Build Your Future With Us.
                    </p>

                </div>

            </section>

        </div>
    );
};

export default AboutUniversity;
