import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

import Logo from "./ui/Logo";

const Footer = () => (
    <footer className="bg-blue-950 text-blue-100">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
            <div className="md:col-span-2">
                <Logo light />
                <p className="mt-4 max-w-sm text-sm leading-6 text-blue-200">
                    One portal for admission, courses, attendance, results and fees. Built for students, teachers and administrators.
                </p>
            </div>

            <nav aria-label="Footer">
                <h3 className="text-sm font-semibold text-white">Explore</h3>
                <ul className="mt-4 space-y-2 text-sm">
                    <li><Link to="/about" className="hover:text-white">About</Link></li>
                    <li><Link to="/academics" className="hover:text-white">Academics</Link></li>
                    <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                    <li><Link to="/login" className="hover:text-white">Student portal</Link></li>
                </ul>
            </nav>

            <div>
                <h3 className="text-sm font-semibold text-white">Contact</h3>
                <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />University Road, Dhaka</li>
                    <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href="tel:+8801234567890" className="hover:text-white">+880 1234 567890</a></li>
                    <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href="mailto:info@university.edu" className="hover:text-white">info@university.edu</a></li>
                </ul>
            </div>
        </div>

        <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-blue-300 sm:flex-row">
                <p>© {new Date().getFullYear()} UMS. All rights reserved.</p>
                <div className="flex gap-5">
                    <Link to="/terms" className="hover:text-white">Terms</Link>
                    <Link to="/privacy" className="hover:text-white">Privacy</Link>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
