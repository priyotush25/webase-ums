import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getMyProfile } from "../../api/authApi";
import { Avatar, PageHeader, Spinner, formatDate, ghostBtn } from "../../components/ui";
import siteConfig from "../../config/site";

const StudentIdCard = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        getMyProfile()
            .then((r) => setProfile(r.user))
            .catch((e) => toast.error(e.message || "Failed to load ID card"));
    }, []);

    if (!profile) return <Spinner />;

    const issueYear = new Date(profile.createdAt).getFullYear();

    return (
        <div className="space-y-6">
            <PageHeader title="Student ID card" subtitle="Show this card on campus. Print it or save as PDF.">
                <button onClick={() => window.print()} className={`${ghostBtn} no-print`}>
                    <Printer size={16} /> Print card
                </button>
            </PageHeader>

            <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-lg">
                <div className="bg-blue-900 px-6 py-4 text-white">
                    <p className="font-display text-lg font-bold leading-tight">{siteConfig.name}</p>
                    <p className="text-xs text-blue-200">Student identity card</p>
                </div>

                <div className="flex gap-5 p-6">
                    <Avatar user={profile} size="h-28 w-28 rounded-lg text-3xl" />

                    <div className="min-w-0">
                        <h2 className="font-display text-xl font-bold text-slate-900">{profile.name}</h2>
                        <p className="mt-1 font-display text-lg font-bold text-blue-900">{profile.universityId || "ID pending"}</p>

                        <dl className="mt-3 space-y-1 text-sm">
                            <div className="flex gap-2"><dt className="w-20 text-slate-500">Department</dt><dd className="font-medium">{profile.department?.code || "-"}</dd></div>
                            <div className="flex gap-2"><dt className="w-20 text-slate-500">Program</dt><dd className="font-medium">{profile.program || "-"}</dd></div>
                            <div className="flex gap-2"><dt className="w-20 text-slate-500">Batch</dt><dd className="font-medium">{profile.batch || "-"}</dd></div>
                            <div className="flex gap-2"><dt className="w-20 text-slate-500">Phone</dt><dd className="font-medium">{profile.phone || "-"}</dd></div>
                        </dl>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-500">
                    <span>Issued {issueYear}</span>
                    <span>{profile.email}</span>
                </div>
                <div className="h-1.5 bg-gold-500" />
            </div>

            <p className="no-print text-center text-xs text-slate-400">Joined {formatDate(profile.createdAt)}. If any detail is wrong, contact the registrar's office.</p>
        </div>
    );
};

export default StudentIdCard;
