import { Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

import { Field, inputClass, primaryBtn } from "../../components/ui";
import siteConfig from "../../config/site";
import { PageBanner, Section } from "./PublicPage";

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    // Opens the visitor's mail app with the message pre-filled
    const handleSubmit = (event) => {
        event.preventDefault();

        const subject = encodeURIComponent(form.subject || "Website enquiry");
        const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} (${form.email})`);

        window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
        toast.info("Opening your email app");
    };

    const info = [
        { icon: MapPin, label: "Campus", value: siteConfig.address },
        { icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone.replace(/\s/g, "")}` },
        { icon: Mail, label: "General enquiries", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
        { icon: Mail, label: "Admission office", value: siteConfig.admissionEmail, href: `mailto:${siteConfig.admissionEmail}` },
    ];

    return (
        <>
            <PageBanner title="Contact us" crumbs={[["Contact"]]} text="Office hours: Sunday to Thursday, 9:00 AM to 5:00 PM." />

            <Section>
                <div className="grid gap-8 lg:grid-cols-5">
                    <ul className="space-y-4 lg:col-span-2">
                        {info.map(({ icon: Icon, label, value, href }) => (
                            <li key={label} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5">
                                <span className="rounded-lg bg-blue-50 p-3 text-blue-900"><Icon size={20} /></span>
                                <div>
                                    <p className="text-sm text-slate-500">{label}</p>
                                    {href ? <a href={href} className="font-medium text-slate-900 hover:text-blue-800">{value}</a> : <p className="font-medium text-slate-900">{value}</p>}
                                </div>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 lg:col-span-3">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Your name"><input required value={form.name} onChange={set("name")} className={inputClass} /></Field>
                            <Field label="Your email"><input required type="email" value={form.email} onChange={set("email")} className={inputClass} /></Field>
                        </div>
                        <Field label="Subject"><input value={form.subject} onChange={set("subject")} className={inputClass} /></Field>
                        <Field label="Message"><textarea required rows={5} value={form.message} onChange={set("message")} className={inputClass} /></Field>
                        <button type="submit" className={primaryBtn}>Send message</button>
                    </form>
                </div>
            </Section>
        </>
    );
};

export default Contact;
