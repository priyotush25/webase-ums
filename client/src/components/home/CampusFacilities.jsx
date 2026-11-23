
import {
    BookOpen,
    Bus,
    Coffee,
    Dumbbell,
    Library,
    Monitor,
    ShieldCheck,
    Wifi
} from "lucide-react";

const CampusFacilities = () => {

    const facilities = [
        {
            icon: Library,
            title: "Modern Library",
            description:
                "A well-organized library with books, journals and learning resources."
        },
        {
            icon: Monitor,
            title: "Computer Lab",
            description:
                "Modern computer labs with updated technology for practical learning."
        },
        {
            icon: Wifi,
            title: "Free Wi-Fi",
            description:
                "Internet access to support research, learning and academic activities."
        },
        {
            icon: BookOpen,
            title: "Smart Classrooms",
            description:
                "Comfortable classrooms with modern teaching and learning facilities."
        },
        {
            icon: Coffee,
            title: "Cafeteria",
            description:
                "A friendly cafeteria where students can relax and enjoy refreshments."
        },
        {
            icon: Dumbbell,
            title: "Sports Facilities",
            description:
                "Sports and recreational facilities for physical fitness and teamwork."
        },
        {
            icon: Bus,
            title: "Transport",
            description:
                "Convenient transportation facilities for students and staff."
        },
        {
            icon: ShieldCheck,
            title: "Campus Security",
            description:
                "Security facilities designed to maintain a safe campus environment."
        }
    ];

    return (
        <section className="bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="bg-blue-950 text-white py-16 px-4">

                <div className="max-w-6xl mx-auto text-center">

                    <h1 className="text-3xl md:text-4xl font-bold">
                        Campus Facilities
                    </h1>

                    <p className="text-blue-200 mt-4 max-w-2xl mx-auto leading-7">
                        Explore our campus facilities designed to provide
                        students with a comfortable and supportive
                        learning environment.
                    </p>

                </div>

            </div>

            {/* Facilities */}
            <div className="max-w-6xl mx-auto px-4 py-16">

                {/* Section Heading */}
                <div className="text-center mb-10">

                    <p className="text-blue-900 font-semibold text-sm">
                        OUR FACILITIES
                    </p>

                    <h2 className="text-3xl font-bold text-gray-800 mt-2">
                        Everything You Need to Learn
                    </h2>

                    <p className="text-gray-500 mt-3">
                        We provide essential facilities for academic
                        and personal development.
                    </p>

                </div>

                {/* Facilities Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

                    {facilities.map((item, index) => {

                        const Icon = item.icon;

                        return (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                            >

                                <div className="w-14 h-14 bg-blue-100 text-blue-900 rounded-lg flex items-center justify-center mb-5">

                                    <Icon size={28} />

                                </div>

                                <h3 className="text-lg font-bold text-gray-800 mb-2">
                                    {item.title}
                                </h3>

                                <p className="text-sm text-gray-500 leading-6">
                                    {item.description}
                                </p>

                            </div>
                        );

                    })}

                </div>

            </div>

            {/* Bottom Section */}
            <div className="bg-white border-t border-gray-200 py-12 px-4">

                <div className="max-w-4xl mx-auto text-center">

                    <h2 className="text-2xl font-bold text-gray-800">
                        A Better Campus Experience
                    </h2>

                    <p className="text-gray-500 mt-3 leading-7">
                        Our goal is to create a welcoming environment
                        where students can learn, grow and achieve success.
                    </p>

                </div>

            </div>

        </section>
    );
};

export default CampusFacilities;
