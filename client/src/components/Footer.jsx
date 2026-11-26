import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router";

import siteConfig from "../config/site";
import Logo from "./ui/Logo";

const columns = [
    {
        title: "Academics",
        links: [["Departments", "/departments"], ["Faculty", "/faculty"], ["Programs overview", "/academics"], ["Notice board", "/notices"]],
    },
    {
        title: "Admissions",
        links: [["Admission information", "/admissions"], ["Apply online", "/admissions/apply"], ["Track application", "/admissions/track"]],
    },
    {
        title: "University",
        links: [["About us", "/about"], ["Contact", "/contact"], ["Student & teacher portal", "/login"]],
    },
];

const Footer = () => (
    <footer className="bg-blue-950 text-blue-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-6">
            <div className="lg:col-span-2">
                <Logo light />
                <p className="mt-4 max-w-sm text-sm leading-6 text-blue-200">{siteConfig.tagline}</p>

                <ul className="mt-5 space-y-3 text-sm">
                    <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />{siteConfig.address}</li>
                    <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-white">{siteConfig.phone}</a></li>
                    <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-gold-400" /><a href={`mailto:${siteConfig.email}`} className="hover:text-white">{siteConfig.email}</a></li>
                </ul>
            </div>

            {columns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                    <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {column.links.map(([label, to]) => (
                            <li key={to}><Link to={to} className="text-blue-200 hover:text-white">{label}</Link></li>
                        ))}
                    </ul>
                </nav>
            ))}
        </div>

        <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-blue-300 sm:flex-row">
                <p>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
                <div className="flex gap-5">
                    <Link to="/terms" className="hover:text-white">Terms</Link>
                    <Link to="/privacy" className="hover:text-white">Privacy</Link>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
