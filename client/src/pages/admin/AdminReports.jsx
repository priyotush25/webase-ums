import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getSummary } from "../../api/reportApi";
import { PageHeader, Spinner, StatCard, ghostBtn } from "../../components/ui";
import { Users } from "lucide-react";
import { taka } from "../../utils/format";

const Bars = ({ rows, color = "bg-blue-900", suffix = "" }) => {
    const max = Math.max(1, ...rows.map((row) => row.value));

    if (rows.length === 0) return <p className="py-4 text-sm text-slate-500">No data yet.</p>;

    return (
        <ul className="space-y-3">
            {rows.map((row) => (
                <li key={row.label}>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-700">{row.label}</span>
                        <span className="font-semibold text-slate-900">{row.value}{suffix}{row.note ? <span className="ml-1 font-normal text-slate-400">{row.note}</span> : null}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${(row.value / max) * 100}%` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
};

const Panel = ({ title, children }) => (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">{title}</h3>
        {children}
    </section>
);

const GRADE_ORDER = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"];

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getSummary());
        } catch (error) {
            toast.error(error.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading && !data) return <Spinner />;
    if (!data) return null;

    const admissionLabels = { pending: "Received", under_review: "Under review", approved: "Approved", waitlisted: "Waitlisted", rejected: "Not selected" };

    return (
        <div className="space-y-6">
            <PageHeader title="Reports" subtitle="A snapshot of the university right now.">
                <button onClick={load} disabled={loading} className={`${ghostBtn} no-print`}><RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh</button>
                <button onClick={() => window.print()} className={`${ghostBtn} no-print`}>Print report</button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Students" value={data.people.student || 0} icon={Users} />
                <StatCard title="Teachers" value={data.people.teacher || 0} icon={Users} color="bg-purple-100 text-purple-700" />
                <StatCard title="Approved enrollments" value={data.totals.enrollments} icon={Users} color="bg-emerald-100 text-emerald-700" />
                <StatCard title="Attendance rate" value={data.attendanceRate === null ? "-" : `${data.attendanceRate}%`} icon={Users} color="bg-amber-100 text-amber-700" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Students per department">
                    <Bars rows={data.departments.map((d) => ({ label: `${d.code} · ${d.name}`, value: d.students }))} />
                </Panel>

                <Panel title="Fee collection">
                    <Bars
                        color="bg-emerald-600"
                        rows={[
                            { label: "Collected", value: data.fees.collected },
                            { label: "Outstanding", value: data.fees.outstanding },
                        ]}
                    />
                    <p className="mt-4 text-sm text-slate-500">Collected {taka(data.fees.collected)}, outstanding {taka(data.fees.outstanding)}.</p>
                </Panel>

                <Panel title="Busiest courses (seats used)">
                    <Bars
                        rows={data.courseLoad.map((c) => ({ label: `${c.code} · ${c.title}`, value: c.enrolled, note: `/ ${c.capacity}` }))}
                    />
                </Panel>

                <Panel title="Admission applications">
                    <Bars
                        color="bg-gold-500"
                        rows={Object.entries(admissionLabels).map(([key, label]) => ({ label, value: data.admissions[key] || 0 }))}
                    />
                </Panel>

                <Panel title="Grade distribution">
                    <Bars
                        rows={GRADE_ORDER.filter((g) => data.grades[g]).map((g) => ({ label: g, value: data.grades[g] }))}
                    />
                </Panel>
            </div>
        </div>
    );
};

export default AdminReports;
