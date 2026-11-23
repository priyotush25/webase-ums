
import { useEffect, useState } from "react";

import {
    BookOpen,
    Building2,
    GraduationCap,
    RefreshCw
} from "lucide-react";

import { toast } from "react-toastify";

import { getMyTeachingCourses } from "../../api/courseApi";

const TeacherCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            setLoading(true);

            const response = await getMyTeachingCourses();

            setCourses(response.courses || []);
        } catch (error) {
            console.error("Teacher Courses Error:", error);

            toast.error(
                error.message || "Failed to load assigned courses"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const totalCredits = courses.reduce(
        (total, course) => total + Number(course.credit || 0),
        0
    );

    const stats = [
        {
            title: "Assigned Courses",
            value: courses.length,
            icon: BookOpen,
            color: "bg-blue-100 text-blue-700",
        },
        {
            title: "Total Credits",
            value: totalCredits,
            icon: GraduationCap,
            color: "bg-purple-100 text-purple-700",
        },
    ];

    return (
        <div className="space-y-6">

            {/* Header */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        My Teaching Courses
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        View all courses assigned to you by the administrator.
                    </p>
                </div>

                <button
                    onClick={fetchCourses}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>

            {/* Statistics */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        {stat.title}
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                        {stat.value}
                                    </h3>
                                </div>

                                <div className={`rounded-xl p-3 ${stat.color}`}>
                                    <Icon size={22} />
                                </div>

                            </div>
                        </div>
                    );
                })}

            </div>

            {/* Courses */}

            <div>
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    Assigned Courses
                </h3>

                {loading ? (
                    <div className="flex justify-center rounded-xl border border-slate-200 bg-white py-16">
                        <RefreshCw
                            size={28}
                            className="animate-spin text-blue-700"
                        />
                    </div>
                ) : courses.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white px-5 py-16 text-center">

                        <BookOpen
                            size={42}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 font-semibold text-slate-800">
                            No courses assigned
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Contact your administrator to get courses assigned.
                        </p>

                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {courses.map((course) => (
                            <div
                                key={course._id}
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white">

                                    <div className="flex items-center justify-between">

                                        <div className="rounded-lg bg-white/15 p-2">
                                            <BookOpen size={23} />
                                        </div>

                                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                                            {course.status || "active"}
                                        </span>

                                    </div>

                                    <h3 className="mt-5 text-lg font-semibold">
                                        {course.title}
                                    </h3>

                                    <p className="mt-1 text-sm text-blue-100">
                                        Course Code: {course.code}
                                    </p>

                                </div>

                                <div className="space-y-4 p-5">

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-slate-500">
                                            Credit
                                        </span>

                                        <span className="font-semibold text-slate-800">
                                            {course.credit ?? "N/A"}
                                        </span>

                                    </div>

                                    <div className="flex items-center justify-between text-sm">

                                        <span className="text-slate-500">
                                            Semester
                                        </span>

                                        <span className="font-semibold text-slate-800">
                                            {course.semester || "N/A"}
                                        </span>

                                    </div>

                                    <div className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-600">

                                        <Building2 size={16} />

                                        <span>
                                            {course.department?.name || "No Department"}
                                        </span>

                                    </div>

                                </div>

                            </div>
                        ))}

                    </div>
                )}
            </div>

        </div>
    );
};

export default TeacherCourses;
