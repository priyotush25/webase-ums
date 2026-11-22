
import {
    ArrowRight,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
} from "lucide-react";

import {
    FaFacebookF,
    FaInstagram,
    FaLinkedinIn,
    FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {
    const year = new Date().getFullYear();

    const quickLinks = [
        "Home",
        "About University",
        "Academic Programs",
        "Departments",
        "Contact Us",
    ];

    const studentLinks = [
        "Student Portal",
        "Teacher Portal",
        "Admission",
        "Academic Calendar",
        "Examination",
    ];

    // Social Media Links
    const socialLinks = [
        {
            Icon: FaFacebookF,
            href: "https://facebook.com",
            name: "Facebook",
        },
        {
            Icon: FaInstagram,
            href: "https://instagram.com",
            name: "Instagram",
        },
        {
            Icon: FaLinkedinIn,
            href: "https://linkedin.com",
            name: "LinkedIn",
        },
        {
            Icon: FaXTwitter,
            href: "https://x.com",
            name: "Twitter",
        },
    ];

    return (
        <footer className="bg-blue-950 text-gray-300">

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* University Information */}
                    <div>
                        <div className="flex items-center gap-3 mb-6">

                            <div className="bg-white/10 p-2.5 rounded-xl">
                                <GraduationCap
                                    size={30}
                                    className="text-white"
                                />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    UMS
                                </h2>

                                <p className="text-xs text-blue-200">
                                    University Management System
                                </p>
                            </div>
                        </div>

                        <p className="text-sm leading-7 text-blue-100/70">
                            Empowering education through technology.
                            Manage academic activities, students,
                            teachers and university administration
                            in one centralized platform.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-3 mt-6">
                            {socialLinks.map(({ Icon, href, name }) => (
                                <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={name}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-blue-600 text-white transition duration-300"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Quick Links
                        </h3>

                        <ul className="space-y-4 text-sm">
                            {quickLinks.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="hover:text-white hover:translate-x-1 inline-block transition"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Student Resources */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Student Resources
                        </h3>

                        <ul className="space-y-4 text-sm">
                            {studentLinks.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        className="hover:text-white hover:translate-x-1 inline-block transition"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Contact Information
                        </h3>

                        <ul className="space-y-5 text-sm">

                            <li className="flex gap-3 items-start">
                                <MapPin
                                    size={19}
                                    className="text-blue-300 shrink-0"
                                />
                                <span>
                                    University Campus, Dhaka, Bangladesh
                                </span>
                            </li>

                            <li className="flex gap-3 items-center">
                                <Phone
                                    size={19}
                                    className="text-blue-300 shrink-0"
                                />
                                <a
                                    href="tel:+8801234567890"
                                    className="hover:text-white transition"
                                >
                                    +880 1234-567890
                                </a>
                            </li>

                            <li className="flex gap-3 items-center">
                                <Mail
                                    size={19}
                                    className="text-blue-300 shrink-0"
                                />
                                <a
                                    href="mailto:info@university.edu"
                                    className="hover:text-white transition"
                                >
                                    info@university.edu
                                </a>
                            </li>

                        </ul>

                        {/* Newsletter */}
                        <div className="mt-7">
                            <h4 className="text-white font-semibold mb-3">
                                Stay Updated
                            </h4>

                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="flex bg-white/10 rounded-lg p-1"
                            >
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    className="w-full min-w-0 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-blue-200"
                                />

                                <button
                                    type="submit"
                                    aria-label="Subscribe"
                                    className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-md text-white transition"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">

                        <p className="text-blue-200/70">
                            © {year} UMS. All rights reserved.
                        </p>

                        <div className="flex gap-6">
                            <a
                                href="/privacy"
                                className="hover:text-white transition"
                            >
                                Privacy Policy
                            </a>

                            <a
                                href="/terms"
                                className="hover:text-white transition"
                            >
                                Terms & Conditions
                            </a>
                        </div>

                        <p className="text-blue-200/70">
                            Designed for Better Education
                        </p>

                    </div>
                </div>
            </div>

        </footer>
    );
};

export default Footer;
