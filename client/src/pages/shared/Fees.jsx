import { Plus, Printer, RefreshCw, Trash2, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createFee, deleteFee, getAllFees, getMyFees, markFeePaid } from "../../api/feeApi";
import { getAllUsers } from "../../api/userApi";
import {
    Avatar,
    Badge,
    EmptyState,
    Field,
    Modal,
    PageHeader,
    Spinner,
    StatCard,
    formatDate,
    ghostBtn,
    inputClass,
    primaryBtn,
} from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { taka } from "../../utils/format";

const METHODS = { cash: "Cash", bkash: "bKash", nagad: "Nagad", bank: "Bank transfer" };

const isOverdue = (fee) => fee.status === "unpaid" && new Date(fee.dueDate) < new Date();

const statusBadge = (fee) =>
    fee.status === "paid" ? (
        <Badge color="green">Paid</Badge>
    ) : isOverdue(fee) ? (
        <Badge color="red">Overdue</Badge>
    ) : (
        <Badge color="amber">Unpaid</Badge>
    );

// ========================================
// STUDENT
// ========================================

const StudentFees = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getMyFees());
        } catch (error) {
            toast.error(error.message || "Failed to load fees");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <div className="space-y-6">
            <PageHeader title="Fees & Payments" subtitle="Your charges and payment history.">
                <button onClick={load} disabled={loading} className={`${ghostBtn} no-print`}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </PageHeader>

            {loading ? (
                <Spinner />
            ) : !data?.fees?.length ? (
                <EmptyState icon={Wallet} title="No fees yet" text="When the office adds a charge, it will show here." />
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard title="Amount due" value={taka(data.totalDue)} icon={Wallet} color="bg-amber-100 text-amber-700" />
                        <StatCard title="Total paid" value={taka(data.totalPaid)} icon={Wallet} color="bg-emerald-100 text-emerald-700" />
                        <StatCard title="Overdue items" value={data.overdueCount} icon={Wallet} color="bg-red-100 text-red-700" />
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Fee</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Due</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Paid on</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.fees.map((fee) => (
                                    <tr key={fee._id}>
                                        <td className="px-4 py-3 font-medium text-slate-900">{fee.title}</td>
                                        <td className="px-4 py-3">{taka(fee.amount)}</td>
                                        <td className="px-4 py-3">{formatDate(fee.dueDate)}</td>
                                        <td className="px-4 py-3">{statusBadge(fee)}</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {fee.paidAt ? `${formatDate(fee.paidAt)} · ${METHODS[fee.method] || ""}` : "-"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="print-only text-sm text-slate-500">Statement for {user?.name} · {formatDate(new Date())}</p>

                    <button onClick={() => window.print()} className={`${ghostBtn} no-print`}>
                        <Printer size={16} /> Print statement
                    </button>
                </>
            )}
        </div>
    );
};

// ========================================
// ADMIN
// ========================================

const AdminFees = () => {
    const [data, setData] = useState({ fees: [], collected: 0, outstanding: 0 });
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const [addOpen, setAddOpen] = useState(false);
    const [addForm, setAddForm] = useState({ studentId: "all", title: "", amount: "", dueDate: "" });

    const [payTarget, setPayTarget] = useState(null);
    const [payForm, setPayForm] = useState({ method: "cash", reference: "" });
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getAllFees(filter));
        } catch (error) {
            toast.error(error.message || "Failed to load fees");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        getAllUsers({ role: "student", limit: 100 })
            .then((response) => setStudents(response.data?.users || []))
            .catch(() => {});
    }, []);

    const handleAdd = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            const response = await createFee({ ...addForm, amount: Number(addForm.amount) });
            toast.success(response.message);
            setAddOpen(false);
            setAddForm({ studentId: "all", title: "", amount: "", dueDate: "" });
            load();
        } catch (error) {
            toast.error(error.message || "Failed to add fee");
        } finally {
            setSaving(false);
        }
    };

    const handlePay = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            await markFeePaid(payTarget._id, payForm);
            toast.success("Payment recorded");
            setPayTarget(null);
            setPayForm({ method: "cash", reference: "" });
            load();
        } catch (error) {
            toast.error(error.message || "Failed to record payment");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (fee) => {
        if (!window.confirm(`Delete "${fee.title}" for ${fee.student?.name}?`)) return;

        try {
            await deleteFee(fee._id);
            toast.success("Fee deleted");
            load();
        } catch (error) {
            toast.error(error.message || "Failed to delete fee");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader title="Fees & Payments" subtitle="Charge students and record payments.">
                <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status" className={`${inputClass} w-auto`}>
                    <option value="">All fees</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                </select>
                <button onClick={() => setAddOpen(true)} className={primaryBtn}>
                    <Plus size={16} /> Add fee
                </button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2">
                <StatCard title="Collected" value={taka(data.collected)} icon={Wallet} color="bg-emerald-100 text-emerald-700" />
                <StatCard title="Outstanding" value={taka(data.outstanding)} icon={Wallet} color="bg-amber-100 text-amber-700" />
            </div>

            {loading ? (
                <Spinner />
            ) : data.fees.length === 0 ? (
                <EmptyState icon={Wallet} title="No fees found" text="Add a fee for one student or for everyone at once." />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Student</th>
                                <th className="px-4 py-3 font-medium">Fee</th>
                                <th className="px-4 py-3 font-medium">Amount</th>
                                <th className="px-4 py-3 font-medium">Due</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.fees.map((fee) => (
                                <tr key={fee._id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={fee.student} />
                                            <div>
                                                <p className="font-medium text-slate-900">{fee.student?.name || "Removed user"}</p>
                                                <p className="text-xs text-slate-400">{fee.student?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{fee.title}</td>
                                    <td className="px-4 py-3">{taka(fee.amount)}</td>
                                    <td className="px-4 py-3">{formatDate(fee.dueDate)}</td>
                                    <td className="px-4 py-3">{statusBadge(fee)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            {fee.status === "unpaid" && (
                                                <button onClick={() => setPayTarget(fee)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                                                    Record payment
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(fee)} aria-label="Delete fee" className="rounded-md p-1.5 text-red-600 hover:bg-red-50">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add fee">
                <form onSubmit={handleAdd} className="space-y-4">
                    <Field label="Charge to">
                        <select value={addForm.studentId} onChange={(e) => setAddForm((p) => ({ ...p, studentId: e.target.value }))} className={inputClass}>
                            <option value="all">All students ({students.length})</option>
                            {students.map((student) => (
                                <option key={student._id} value={student._id}>{student.name} · {student.email}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Fee name"><input required minLength={3} value={addForm.title} onChange={(e) => setAddForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Spring 2027 tuition" className={inputClass} /></Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Amount (৳)"><input type="number" min={1} required value={addForm.amount} onChange={(e) => setAddForm((p) => ({ ...p, amount: e.target.value }))} className={inputClass} /></Field>
                        <Field label="Due date"><input type="date" required value={addForm.dueDate} onChange={(e) => setAddForm((p) => ({ ...p, dueDate: e.target.value }))} className={inputClass} /></Field>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setAddOpen(false)} className={ghostBtn}>Cancel</button>
                        <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Adding..." : "Add fee"}</button>
                    </div>
                </form>
            </Modal>

            <Modal open={Boolean(payTarget)} onClose={() => setPayTarget(null)} title="Record payment">
                {payTarget && (
                    <form onSubmit={handlePay} className="space-y-4">
                        <p className="text-sm text-slate-600">
                            {payTarget.student?.name} · {payTarget.title} · <strong>{taka(payTarget.amount)}</strong>
                        </p>
                        <Field label="Payment method">
                            <select value={payForm.method} onChange={(e) => setPayForm((p) => ({ ...p, method: e.target.value }))} className={inputClass}>
                                {Object.entries(METHODS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Transaction ID or receipt no." hint="Optional">
                            <input value={payForm.reference} onChange={(e) => setPayForm((p) => ({ ...p, reference: e.target.value }))} className={inputClass} />
                        </Field>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setPayTarget(null)} className={ghostBtn}>Cancel</button>
                            <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Saving..." : "Record payment"}</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

const Fees = () => {
    const { role } = useAuth();
    return role === "admin" ? <AdminFees /> : <StudentFees />;
};

export default Fees;
