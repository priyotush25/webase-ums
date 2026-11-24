import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { Field, inputClass, primaryBtn } from "../../components/ui";
import { PageBanner } from "./PublicPage";

const CONTACT_EMAIL = "info@university.edu";

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    // Opens the visitor's mail app with the message pre-filled (no backend needed)
    const handleSubmit = (event) => {
        event.preventDefault();

        const subject = encodeURIComponent(form.subject || "Website enquiry");
        const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);

        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        toast.info("Opening your email app...");
    };

    const info = [
        { icon: MapPin, label: "Campus", value: "University Road, Dhaka, Bangladesh" },
        { icon: Phone, label: "Phone", value: "+880 1234 567890", href: "tel:+8801234567890" },
        { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
    ];

    return (
        <>
            <PageBanner eyebrow="Contact" title="We'd Love to Hear From You" text="Questions about admission, courses or your account? Send us a message." />

            <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-5">
                <div className="space-y-4 lg:col-span-2">
                    {info.map(({ icon: Icon, label, value, href }) => (
                        <div key={label} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="rounded-lg bg-blue-100 p-3 text-blue-900"><Icon size={20} /></div>
                            <div>
                                <p className="text-sm text-slate-500">{label}</p>
                                {href ? (
                                    <a href={href} className="font-medium text-slate-900 hover:text-blue-800">{value}</a>
                                ) : (
                                    <p className="font-medium text-slate-900">{value}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Your name"><input required value={form.name} onChange={set("name")} className={inputClass} /></Field>
                        <Field label="Your email"><input required type="email" value={form.email} onChange={set("email")} className={inputClass} /></Field>
                    </div>
                    <Field label="Subject"><input value={form.subject} onChange={set("subject")} className={inputClass} /></Field>
                    <Field label="Message"><textarea required rows={5} value={form.message} onChange={set("message")} className={inputClass} /></Field>
                    <button type="submit" className={primaryBtn}>Send Message</button>
                </form>
            </section>
        </>
    );
};

export default Contact;
