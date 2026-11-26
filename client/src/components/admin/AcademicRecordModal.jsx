import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { getAllDepartments } from "../../api/academicApi";
import { updateAcademicRecord } from "../../api/userApi";
import { Field, Modal, ghostBtn, inputClass, primaryBtn } from "../ui";

const SEMESTERS = ["1st Semester", "2nd Semester", "3rd Semester", "4th Semester", "5th Semester", "6th Semester", "7th Semester", "8th Semester"];

const AcademicRecordModal = ({ user, onClose, onSaved }) => {
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState({ department: "", program: "", semester: "", batch: "", designation: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;

        setForm({
            department: user.department?._id || "",
            program: user.program || "",
            semester: user.semester || "",
            batch: user.batch || "",
            designation: user.designation || "",
        });

        getAllDepartments({ status: "active" })
            .then((response) => setDepartments(response.data || []))
            .catch(() => {});
    }, [user]);

    if (!user) return null;

    const isStudent = user.role === "student";
    const set = (key) => (event) => setForm((previous) => ({ ...previous, [key]: event.target.value }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            await updateAcademicRecord(user._id, form);
            toast.success("Academic record updated");
            onSaved();
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to update record");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} title={`Academic record: ${user.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Department">
                    <select value={form.department} onChange={set("department")} className={inputClass}>
                        <option value="">Not assigned</option>
                        {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name} ({dept.code})</option>)}
                    </select>
                </Field>

                {isStudent ? (
                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Program">
                            <select value={form.program} onChange={set("program")} className={inputClass}>
                                <option value="">Not set</option>
                                <option>Bachelor</option>
                                <option>Masters</option>
                            </select>
                        </Field>
                        <Field label="Semester">
                            <select value={form.semester} onChange={set("semester")} className={inputClass}>
                                <option value="">Not set</option>
                                {SEMESTERS.map((item) => <option key={item}>{item}</option>)}
                            </select>
                        </Field>
                        <Field label="Batch (year)"><input value={form.batch} onChange={set("batch")} placeholder="2027" className={inputClass} /></Field>
                    </div>
                ) : (
                    <Field label="Designation"><input value={form.designation} onChange={set("designation")} placeholder="Lecturer, Assistant Professor…" className={inputClass} /></Field>
                )}

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className={ghostBtn}>Cancel</button>
                    <button type="submit" disabled={saving} className={primaryBtn}>{saving ? "Saving..." : "Save record"}</button>
                </div>
            </form>
        </Modal>
    );
};

export default AcademicRecordModal;
