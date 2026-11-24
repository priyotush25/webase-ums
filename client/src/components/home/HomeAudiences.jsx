const groups = [
    {
        title: "For students",
        items: [
            "Apply online and enroll in courses",
            "See your weekly class routine",
            "Track attendance for every course",
            "View results, grades and CGPA",
            "Check fees and payment history",
        ],
    },
    {
        title: "For teachers",
        items: [
            "See your courses and enrolled students",
            "Take attendance in a few clicks",
            "Post assignments with due dates",
            "Enter marks with live grade preview",
            "Read notices from the administration",
        ],
    },
    {
        title: "For administrators",
        items: [
            "Manage departments, courses and users",
            "Approve or reject enrollments",
            "Build the routine without room clashes",
            "Publish notices and the academic calendar",
            "Charge fees and record payments",
        ],
    },
];

const HomeAudiences = () => (
    <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
            <h2 className="max-w-lg text-3xl font-bold text-blue-950">One portal, three roles</h2>
            <p className="mt-3 max-w-xl text-slate-600">Everyone sees only what they need, nothing more.</p>

            <div className="mt-10 grid gap-8 md:grid-cols-3">
                {groups.map((group) => (
                    <div key={group.title} className="border-t-2 border-gold-500 pt-5">
                        <h3 className="text-lg font-semibold text-slate-900">{group.title}</h3>
                        <ul className="mt-4 space-y-3 text-slate-600">
                            {group.items.map((item) => (
                                <li key={item} className="flex gap-3 text-[15px] leading-6">
                                    <span className="mt-2.5 h-1 w-3 shrink-0 bg-blue-900" aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default HomeAudiences;
