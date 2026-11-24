import { PageBanner } from "./PublicPage";

const CONTENT = {
    terms: {
        title: "Terms of Service",
        sections: [
            ["Acceptable use", "Use the portal only for legitimate academic and administrative purposes. Do not attempt to access data that is not yours."],
            ["Accounts", "You are responsible for keeping your login credentials secure and for all activity under your account."],
            ["Academic records", "Attendance, enrollment and results shown in the portal are maintained by the university and may be corrected by authorized staff."],
            ["Changes", "These terms may be updated from time to time. Continued use of the portal means you accept the updated terms."],
        ],
    },
    privacy: {
        title: "Privacy Policy",
        sections: [
            ["Information we store", "Your name, email address, profile photo, role, enrollments, attendance and results."],
            ["How it is used", "To operate the portal, show you your academic information and let teachers and administrators manage courses."],
            ["Who can see it", "Teachers see students of their own courses. Administrators can manage all records. Other students cannot see your data."],
            ["Your choices", "You can update your name and photo from your profile. Contact the administration to request corrections."],
        ],
    },
};

const Legal = ({ type }) => {
    const page = CONTENT[type];

    return (
        <>
            <PageBanner title={page.title} />
            <section className="mx-auto max-w-3xl space-y-6 px-4 py-14">
                {page.sections.map(([heading, text]) => (
                    <div key={heading}>
                        <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
                        <p className="mt-1 leading-7 text-slate-600">{text}</p>
                    </div>
                ))}
            </section>
        </>
    );
};

export default Legal;
