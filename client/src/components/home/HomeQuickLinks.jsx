import { Bell, CalendarDays, ClipboardList, LogIn, Search } from "lucide-react";
import { Link } from "react-router";

const links = [
    { icon: ClipboardList, label: "Apply online", text: "Start your application", to: "/admissions/apply" },
    { icon: Search, label: "Track application", text: "Check your status", to: "/admissions/track" },
    { icon: Bell, label: "Notice board", text: "Latest announcements", to: "/notices" },
    { icon: CalendarDays, label: "Academic calendar", text: "Exams and holidays", to: "/notices#calendar" },
    { icon: LogIn, label: "Student portal", text: "Results, routine, fees", to: "/login" },
];

const HomeQuickLinks = () => (
    <section className="relative z-10 -mt-8" aria-label="Quick links">
        <ul className="mx-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 shadow-lg md:grid-cols-5 xl:mx-auto xl:max-w-7xl">
            {links.map(({ icon: Icon, label, text, to }) => (
                <li key={to} className="bg-white">
                    <Link to={to} className="flex h-full items-center gap-3 px-5 py-5 hover:bg-blue-50">
                        <Icon size={24} className="shrink-0 text-blue-900" />
                        <span>
                            <span className="block text-sm font-semibold text-slate-900">{label}</span>
                            <span className="block text-xs text-slate-500">{text}</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    </section>
);

export default HomeQuickLinks;
