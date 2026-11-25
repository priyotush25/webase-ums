
import { useCallback, useEffect, useState } from "react";

import {
    BookOpen,
    GraduationCap,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X,
} from "lucide-react";

import { toast } from "react-toastify";

import {
    createCourse,
    deleteCourse,
    getAllCourses,
    getAllDepartments,
    updateCourse,
} from "../../api/academicApi";

import { getAllUsers } from "../../api/userApi";

const initialForm = {
    title: "",
    code: "",
    description: "",
    credit: "3",
    department: "",
    teacher: "",
    semester: "",
    capacity: "60",
    status: "active",
    isPublished: false,
};

const AdminCourses = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);

    // ========================================
    // FETCH COURSES
    // ========================================

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getAllCourses({
                search,
                department: departmentFilter,
                status: statusFilter,
            });

            setCourses(response.data || []);

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [search, departmentFilter, statusFilter]);

    // ========================================
    // FETCH DEPARTMENTS & TEACHERS
    // ========================================

    const fetchFormData = useCallback(async () => {
        try {
            const [departmentResponse, teacherResponse] =
                await Promise.all([
                    getAllDepartments({ status: "active" }),
                    getAllUsers({
                        page: 1,
                        limit: 100,
                        role: "teacher",
                    }),
                ]);

            setDepartments(departmentResponse.data || []);
            setTeachers(teacherResponse.data?.users || []);

        } catch (error) {
            toast.error(error.message);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    useEffect(() => {
        fetchFormData();
    }, [fetchFormData]);

    // ========================================
    // MODAL
    // ========================================

    const openCreateModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setEditingId(course._id);

        setForm({
            title: course.title || "",
            code: course.code || "",
            description: course.description || "",
            credit: String(course.credit ?? 3),
            department: course.department?._id || "",
            teacher: course.teacher?._id || "",
            semester: course.semester || "",
            capacity: String(course.capacity ?? 60),
            status: course.status || "active",
            isPublished: Boolean(course.isPublished),
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

    // ========================================
    // CREATE / UPDATE COURSE
    // ========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.title.trim() ||
            !form.code.trim() ||
            !form.department ||
            !form.semester.trim() ||
            !form.credit
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setSaving(true);

            const courseData = {
                ...form,
                credit: Number(form.credit),
                capacity: Number(form.capacity) || 60,
                teacher: form.teacher || null,
            };

            if (editingId) {
                await updateCourse(editingId, courseData);

                toast.success("Course updated successfully");
            } else {
                await createCourse(courseData);

                toast.success("Course created successfully");
            }

            setModalOpen(false);
            setEditingId(null);
            setForm(initialForm);

            await fetchCourses();

        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    // ========================================
    // DELETE COURSE
    // ========================================

    const handleDelete = async (course) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${course.title}?`
        );

        if (!confirmed) return;

        try {
            await deleteCourse(course._id);

            toast.success("Course deleted successfully");

            await fetchCourses();

        } catch (error) {
            toast.error(error.message);
        }
    };

    // ========================================
    // UI
    // ========================================

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <BookOpen size={26} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Course Management
                        </h1>

                        <p className="text-sm text-gray-500">
                            Create courses and assign teachers
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            fetchCourses();
                            fetchFormData();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        Add Course
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-gray-500">
                        Total Courses
                    </p>

                    <h2 className="text-3xl font-bold mt-2">
                        {courses.length}
                    </h2>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-gray-500">
                        Active Courses
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-green-600">
                        {courses.filter(
                            (course) => course.status === "active"
                        ).length}
                    </h2>
                </div>

                <div className="bg-white border rounded-xl p-5">
                    <p className="text-sm text-gray-500">
                        Assigned Teachers
                    </p>

                    <h2 className="text-3xl font-bold mt-2 text-purple-600">
                        {courses.filter((course) => course.teacher).length}
                    </h2>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">

                <div className="relative">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search course..."
                        className="w-full border rounded-lg pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="border rounded-lg px-4 py-3 outline-none"
                >
                    <option value="all">All Departments</option>

                    {departments.map((department) => (
                        <option
                            key={department._id}
                            value={department._id}
                        >
                            {department.name}
                        </option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-lg px-4 py-3 outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Course Table */}
            <div className="bg-white border rounded-xl overflow-hidden">

                <div className="p-5 border-b">
                    <h2 className="font-semibold text-gray-800">
                        Course List
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">

                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-5 py-4">Course</th>
                                <th className="px-5 py-4">Department</th>
                                <th className="px-5 py-4">Credit</th>
                                <th className="px-5 py-4">Teacher</th>
                                <th className="px-5 py-4">Semester</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">

                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10">
                                        Loading courses...
                                    </td>
                                </tr>
                            ) : courses.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-10 text-gray-500">
                                        No courses found
                                    </td>
                                </tr>
                            ) : (
                                courses.map((course) => (
                                    <tr
                                        key={course._id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800">
                                                {course.title}
                                            </p>

                                            <p className="text-xs text-blue-600 mt-1">
                                                {course.code}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            {course.department?.name || "N/A"}
                                        </td>

                                        <td className="px-5 py-4">
                                            {course.credit}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap
                                                    size={17}
                                                    className="text-gray-400"
                                                />

                                                {course.teacher?.name || "Not Assigned"}
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            {course.semester}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                course.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : course.status === "completed"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-gray-100 text-gray-600"
                                            }`}>
                                                {course.status}
                                            </span>
                                            <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${
                                                course.isPublished
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                            }`}>
                                                {course.isPublished ? "Published" : "Draft"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                                                    title="Edit"
                                                >
                                                    <Pencil size={17} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(course)}
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
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">

                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl my-8">

                        <div className="flex justify-between items-center p-5 border-b">
                            <div>
                                <h2 className="text-lg font-bold">
                                    {editingId ? "Edit Course" : "Create Course"}
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Enter course information
                                </p>
                            </div>

                            <button
                                onClick={() => setModalOpen(false)}
                                disabled={saving}
                                className="p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Course Title *
                                    </label>

                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Database Management System"
                                        required
                                        className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Course Code *
                                    </label>

                                    <input
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="CSE-301"
                                        required
                                        className="w-full border rounded-lg px-4 py-3 uppercase outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Department *
                                    </label>

                                    <select
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded-lg px-4 py-3"
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map((department) => (
                                            <option
                                                key={department._id}
                                                value={department._id}
                                            >
                                                {department.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Assign Teacher
                                    </label>

                                    <select
                                        name="teacher"
                                        value={form.teacher}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg px-4 py-3"
                                    >
                                        <option value="">
                                            Select Teacher (Optional)
                                        </option>

                                        {teachers.map((teacher) => (
                                            <option
                                                key={teacher._id}
                                                value={teacher._id}
                                            >
                                                {teacher.name} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Credit *
                                    </label>

                                    <input
                                        type="number"
                                        name="credit"
                                        value={form.credit}
                                        onChange={handleChange}
                                        min="0.5"
                                        max="10"
                                        step="0.5"
                                        required
                                        className="w-full border rounded-lg px-4 py-3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Semester *
                                    </label>

                                    <input
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleChange}
                                        placeholder="Spring 2027"
                                        required
                                        className="w-full border rounded-lg px-4 py-3"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Seat capacity
                                </label>

                                <input
                                    type="number"
                                    name="capacity"
                                    value={form.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                    className="w-full border rounded-lg px-4 py-3"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Enrollment approvals stop when this many students are approved.
                                </p>
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
                                    placeholder="Course description..."
                                    className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <label className="flex items-start gap-3 rounded-lg border px-4 py-3 text-sm">
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="font-medium">Publish for students</span>
                                    <span className="block text-xs text-gray-500">
                                        Students of this department see it only when its semester is their current semester.
                                    </span>
                                </span>
                            </label>

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
                                        <option value="completed">Completed (semester finished)</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={saving || departments.length === 0}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Course"
                                        : "Create Course"}
                            </button>

                            {departments.length === 0 && (
                                <p className="text-sm text-red-600 text-center">
                                    Create an active department before creating a course.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminCourses;
