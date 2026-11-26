import { Bell, ClipboardList, LogIn, Search } from "lucide-react";
import { Link } from "react-router";

const links = [
    { icon: ClipboardList, label: "Apply online", text: "Start your application", to: "/admissions/apply" },
    { icon: Search, label: "Track application", text: "Check your status", to: "/admissions/track" },
    { icon: Bell, label: "Notice board", text: "Latest announcements", to: "/notices" },
    { icon: LogIn, label: "Student portal", text: "Courses, results, routine", to: "/login" },
];

const HomeQuickLinks = () => (
    <section className="border-b border-slate-200 bg-slate-50" aria-label="Quick links">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 divide-slate-200 md:grid-cols-4 md:divide-x">
            {links.map(({ icon: Icon, label, text, to }) => (
                <li key={to}>
                    <Link to={to} className="flex h-full items-center gap-3 px-5 py-4 hover:bg-white">
                        <Icon size={18} className="shrink-0 text-blue-900" aria-hidden="true" />
                        <span>
                            <span className="block text-sm font-medium text-slate-900">{label}</span>
                            <span className="block text-xs text-slate-500">{text}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

export default HomeQuickLinks;
