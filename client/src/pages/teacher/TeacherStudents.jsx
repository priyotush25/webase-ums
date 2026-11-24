import { RefreshCw, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import { getMyTeachingStudents } from "../../api/teacherApi";
import {
    Avatar,
    Badge,
    EmptyState,
    PageHeader,
    Spinner,
    StatCard,
    ghostBtn,
    inputClass,
} from "../../components/ui";

const TeacherStudents = () => {
    const [data, setData] = useState({ courses: [], enrollments: [] });
    const [loading, setLoading] = useState(true);
    const [courseFilter, setCourseFilter] = useState("all");
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getMyTeachingStudents());
        } catch (error) {
            toast.error(error.message || "Failed to load students");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase();

        return data.enrollments.filter((item) => {
            const matchesCourse = courseFilter === "all" || item.course._id === courseFilter;
            const matchesSearch =
                !term ||
                `${item.student.name} ${item.student.email}`.toLowerCase().includes(term);

            return matchesCourse && matchesSearch;
        });
    }, [data.enrollments, courseFilter, search]);

    const uniqueStudents = new Set(data.enrollments.map((item) => item.student._id)).size;

    return (
        <div className="space-y-6">
            <PageHeader title="My Students" subtitle="Students with approved enrollment in your courses.">
                <button onClick={load} disabled={loading} className={ghostBtn}>
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                </button>
            </PageHeader>

            <div className="grid gap-4 sm:grid-cols-2">
                <StatCard title="Unique students" value={uniqueStudents} icon={Users} />
                <StatCard title="Course enrollments" value={data.enrollments.length} icon={Users} color="bg-purple-100 text-purple-700" />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name or email"
                    aria-label="Search students"
                    className={`${inputClass} sm:max-w-xs`}
                />
                <select
                    value={courseFilter}
                    onChange={(event) => setCourseFilter(event.target.value)}
                    aria-label="Filter by course"
                    className={`${inputClass} sm:max-w-xs`}
                >
                    <option value="all">All courses</option>
                    {data.courses.map((course) => (
                        <option key={course._id} value={course._id}>
                            {course.code} - {course.title}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <Spinner />
            ) : rows.length === 0 ? (
                <EmptyState icon={Users} title="No students found" text="Approved students will be listed here." />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Student</th>
                                <th className="px-4 py-3">Course</th>
                                <th className="px-4 py-3">Semester</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rows.map((item) => (
                                <tr key={item._id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar user={item.student} />
                                            <div>
                                                <p className="font-medium text-slate-900">{item.student.name}</p>
                                                <p className="text-xs text-slate-400">{item.student.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge color="blue">{item.course.code}</Badge>{" "}
                                        <span className="text-slate-600">{item.course.title}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{item.course.semester}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;
