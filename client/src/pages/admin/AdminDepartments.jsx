
import { useCallback, useEffect, useState } from "react";

import {
    BookOpen,
    Building2,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
    createDepartment,
    deleteDepartment,
    getAllDepartments,
    updateDepartment,
} from "../../api/academicApi";

const initialForm = {
    name: "",
    code: "",
    description: "",
    status: "active",
};

const AdminDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

    const fetchDepartments = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getAllDepartments({
                search,
                status: statusFilter,
            });

            setDepartments(response.data || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setModalOpen(true);
    };

    const openEditModal = (department) => {
        setEditingId(department._id);

        setForm({
            name: department.name,
            code: department.code,
            description: department.description || "",
            status: department.status,
        });

        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.code.trim()) {
            toast.error("Department name and code are required");
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                await updateDepartment(editingId, form);
                toast.success("Department updated successfully");
            } else {
                await createDepartment(form);
                toast.success("Department created successfully");
            }

            setModalOpen(false);
            setForm(initialForm);
            setEditingId(null);

            await fetchDepartments();

        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (department) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${department.name}?`
        );

        if (!confirmed) return;

        try {
            await deleteDepartment(department._id);

            toast.success("Department deleted successfully");

            await fetchDepartments();

        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-900 rounded-xl">
                        <Building2 size={26} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Department Management
                        </h1>

                        <p className="text-sm text-slate-500">
                            Create and manage university departments
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchDepartments}
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-slate-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                    >
                        <Plus size={18} />
                        Add Department
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-slate-500">
                        Total Departments
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {departments.length}
                    </h2>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-slate-500">
                        Active Departments
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                        {departments.filter(
                            (item) => item.status === "active"
                        ).length}
                    </h2>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-slate-500">
                        Total Courses
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-blue-900">
                        {departments.reduce(
                            (total, item) => total + (item.courseCount || 0),
                            0
                        )}
                    </h2>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border rounded-xl p-4 flex flex-col sm:flex-row gap-3">

                <div className="relative flex-1">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search department..."
                        className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-3 outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Department Table */}
            <div className="bg-white border rounded-xl overflow-hidden">

                <div className="p-5 border-b">
                    <h2 className="font-semibold text-slate-800">
                        Department List
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">

                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-5 py-4">Department</th>
                                <th className="px-5 py-4">Code</th>
                                <th className="px-5 py-4">Courses</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">

                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10">
                                        Loading departments...
                                    </td>
                                </tr>
                            ) : departments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-slate-500">
                                        No departments found
                                    </td>
                                </tr>
                            ) : (
                                departments.map((department) => (
                                    <tr
                                        key={department._id}
                                        className="hover:bg-slate-50"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800">
                                                {department.name}
                                            </div>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {department.description || "No description"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">
                                                {department.code}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-2">
                                                <BookOpen size={16} />
                                                {department.courseCount || 0}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                department.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-slate-100 text-slate-600"
                                            }`}>
                                                {department.status}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(department)}
                                                    className="p-2 text-blue-900 bg-blue-50 rounded-lg hover:bg-blue-100"
                                                    title="Edit"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(department)}
                                                    className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">

                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">

                        <div className="flex justify-between items-center p-5 border-b">
                            <h2 className="text-lg font-bold">
                                {editingId ? "Edit Department" : "Create Department"}
                            </h2>

                            <button
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Department Name
                                </label>

                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Computer Science & Engineering"
                                    required
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Department Code
                                </label>

                                <input
                                    name="code"
                                    value={form.code}
                                    onChange={handleChange}
                                    placeholder="CSE"
                                    required
                                    className="w-full border rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Department description..."
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {editingId && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={form.status}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-3"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Department"
                                        : "Create Department"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminDepartments;
