import { BookOpen, Briefcase, FlaskConical, Trophy, Users } from "lucide-react";

const items = [
    { icon: FlaskConical, title: "Labs", text: "Computer, electronics and language labs open through the week." },
    { icon: Users, title: "Clubs", text: "Debate, programming, cultural and volunteer clubs run by students." },
    { icon: Trophy, title: "Sports", text: "Cricket, football and indoor games with an annual sports day." },
    { icon: Briefcase, title: "Career center", text: "CV reviews, internships and employer meetups every semester." },
    { icon: BookOpen, title: "Student support", text: "Advisors, counseling and scholarship guidance for every batch." },
];

const HomeCampusLife = () => (
    <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-semibold text-blue-950">Life on campus</h2>
            <p className="mt-3 max-w-xl text-slate-600">Learning continues outside the classroom.</p>

            <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(({ icon: Icon, title, text }) => (
                    <li key={title} className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-900"><Icon size={22} /></span>
                        <div>
                            <h3 className="font-semibold text-slate-900">{title}</h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    </section>
);

export default HomeCampusLife;
