import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getApplications, reviewApplication } from "../../api/admissionApi";
import {
    Badge,
    EmptyState,
    Field,
    Modal,
    PageHeader,
    Spinner,
    formatDate,
    ghostBtn,
    inputClass,
    primaryBtn,
} from "../../components/ui";
import { STATUS_INFO } from "../public/AdmissionTrack";

const TABS = [["", "All"], ["pending", "Received"], ["under_review", "Under review"], ["approved", "Approved"], ["waitlisted", "Waitlisted"], ["rejected", "Not selected"]];

const Detail = ({ label, value }) => (
    <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-sm font-medium text-slate-900">{value || "-"}</dd>
    </div>
);

const AdminAdmissions = () => {
    const [applications, setApplications] = useState([]);
    const [counts, setCounts] = useState({});
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState(null);
    const [decision, setDecision] = useState("approved");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getApplications({ page, status, search: search.trim() });
            setApplications(response.applications || []);
            setCounts(response.counts || {});
            setPagination(response.pagination);
        } catch (error) {
            toast.error(error.message || "Failed to load applications");
        } finally {
            setLoading(false);
        }
    }, [page, status, search]);

    useEffect(() => {
        const timer = setTimeout(load, 250);
        return () => clearTimeout(timer);
    }, [load]);

    const open = (application) => {
        setSelected(application);
        setDecision(application.status === "pending" ? "under_review" : application.status);
        setNote(application.adminNote || "");
    };

    const handleSave = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            await reviewApplication(selected._id, { status: decision, note });
            toast.success("Application updated");
            setSelected(null);
            load();
        } catch (error) {
            toast.error(error.message || "Failed to update application");
        } finally {
            setSaving(false);
        }
    };

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            <PageHeader title="Admissions" subtitle="Review online applications and publish decisions.">
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, email, number" aria-label="Search applications" className={`${inputClass} w-64`} />
                <button onClick={load} disabled={loading} className={ghostBtn}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
            </PageHeader>

            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
                {TABS.map(([value, label]) => (
                    <button
                        key={value || "all"}
                        role="tab"
                        aria-selected={status === value}
                        onClick={() => { setStatus(value); setPage(1); }}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium ${status === value ? "bg-blue-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                    >
                        {label} <span className="opacity-70">{value ? counts[value] || 0 : total}</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <Spinner />
            ) : applications.length === 0 ? (
                <EmptyState icon={ClipboardList} title="No applications" text="Applications submitted from the website appear here." />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Application</th>
                                <th className="px-4 py-3 font-medium">Applicant</th>
                                <th className="px-4 py-3 font-medium">Department</th>
                                <th className="px-4 py-3 font-medium">SSC / HSC</th>
                                <th className="px-4 py-3 font-medium">Submitted</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {applications.map((item) => (
                                <tr key={item._id}>
                                    <td className="px-4 py-3 font-semibold text-blue-900">{item.applicationNo}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.email}</p>
                                    </td>
                                    <td className="px-4 py-3">{item.department?.code} · {item.program}</td>
                                    <td className="px-4 py-3">{item.sscGpa.toFixed(2)} / {item.hscGpa.toFixed(2)}</td>
                                    <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                                    <td className="px-4 py-3"><Badge color={STATUS_INFO[item.status].color}>{STATUS_INFO[item.status].label}</Badge></td>
                                    <td className="px-4 py-3 text-right"><button onClick={() => open(item)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-900 hover:bg-blue-50">Review</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <button className={ghostBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /> Previous</button>
                    <span className="text-sm text-slate-500">Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <button className={ghostBtn} disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={16} /></button>
                </div>
            )}

            <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.applicationNo} · ${selected.name}` : ""} wide>
                {selected && (
                    <form onSubmit={handleSave} className="space-y-5">
                        <dl className="grid gap-4 sm:grid-cols-3">
                            <Detail label="Email" value={selected.email} />
                            <Detail label="Phone" value={selected.phone} />
                            <Detail label="Date of birth" value={formatDate(selected.dob)} />
                            <Detail label="Gender" value={selected.gender} />
                            <Detail label="Department" value={selected.department?.name} />
                            <Detail label="Program" value={selected.program} />
                            <Detail label="SSC GPA" value={selected.sscGpa.toFixed(2)} />
                            <Detail label="HSC GPA" value={selected.hscGpa.toFixed(2)} />
                            <Detail label="Passing year" value={selected.passingYear} />
                            <Detail label="Guardian" value={`${selected.guardianName} (${selected.guardianPhone})`} />
                            <div className="sm:col-span-2"><Detail label="Address" value={selected.address} /></div>
                        </dl>

                        {selected.statement && (
                            <div>
                                <p className="text-xs text-slate-400">Statement</p>
                                <p className="mt-1 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{selected.statement}</p>
                            </div>
                        )}

                        <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
                            <Field label="Decision">
                                <select value={decision} onChange={(e) => setDecision(e.target.value)} className={inputClass}>
                                    {Object.entries(STATUS_INFO).map(([key, info]) => <option key={key} value={key}>{info.label}</option>)}
                                </select>
                            </Field>
                            <Field label="Note to applicant" hint="Shown on the tracking page.">
                                <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={inputClass} />
                            </Field>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setSelected(null)} className={ghostBtn}>Cancel</button>
                            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Saving..." : "Save decision"}</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default AdminAdmissions;
