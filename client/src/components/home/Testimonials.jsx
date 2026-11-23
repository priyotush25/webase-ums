
import { Quote, Star } from "lucide-react";

const Testimonials = () => {

    const testimonials = [
        {
            name: "Rahim Ahmed",
            role: "Computer Science Student",
            rating: 5,
            message:
                "This university provides a great learning environment. The teachers are very helpful and supportive."
        },
        {
            name: "Nusrat Jahan",
            role: "Business Student",
            rating: 5,
            message:
                "I really appreciate the academic facilities and friendly environment. It helps me improve my skills."
        },
        {
            name: "Tanvir Hasan",
            role: "Engineering Student",
            rating: 4,
            message:
                "The university offers quality education and excellent learning opportunities for students."
        }
    ];

    return (
        <section className="bg-gray-50 py-16 px-4">

            <div className="max-w-6xl mx-auto">

                {/* Heading */}
                <div className="text-center mb-10">

                    <p className="text-blue-900 font-semibold text-sm">
                        TESTIMONIALS
                    </p>

                    <h2 className="text-3xl font-bold text-gray-800 mt-2">
                        What Our Students Say
                    </h2>

                    <p className="text-gray-500 mt-3">
                        Hear from our students about their learning experience.
                    </p>

                </div>

                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {testimonials.map((item, index) => (

                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6"
                        >

                            <Quote
                                size={30}
                                className="text-blue-900 mb-4"
                            />

                            {/* Message */}
                            <p className="text-gray-600 leading-7 mb-5">
                                "{item.message}"
                            </p>

                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-5">

                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={17}
                                        className={
                                            i < item.rating
                                                ? "text-yellow-500 fill-yellow-500"
                                                : "text-gray-300"
                                        }
                                    />
                                ))}

                            </div>

                            {/* User Info */}
                            <div className="border-t border-gray-100 pt-4">

                                <h3 className="font-bold text-gray-800">
                                    {item.name}
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {item.role}
                                </p>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </section>
    );
};

export default Testimonials;
