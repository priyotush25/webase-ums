
import { BookOpen, GraduationCap, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { createEnrollment, getMyEnrollments } from "../../api/enrollmentApi";

const API_URL = import.meta.env.VITE_API_URL;

const StudentCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrollingId, setEnrollingId] = useState(null);
    const [search, setSearch] = useState("");
    const [applied, setApplied] = useState({});
    const [department, setDepartment] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/courses?status=active`,
                {
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to load courses");
            }

            const list = result.data || [];
            setCourses(list);
            setDepartment(list[0]?.department?.name || "");

            // Mark courses the student has already applied for
            try {
                const mine = await getMyEnrollments();
                const map = {};
                (mine.data || []).forEach((item) => {
                    if (item.course?._id) map[item.course._id] = item.status;
                });
                setApplied(map);
            } catch {
                // the list still works without this
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            setEnrollingId(courseId);

            const result = await createEnrollment(courseId);

            toast.success(result.message || "Enrollment request submitted");
            setApplied((previous) => ({ ...previous, [courseId]: "pending" }));

        } catch (error) {
            toast.error(error.message);
        } finally {
            setEnrollingId(null);
        }
    };

    const filteredCourses = courses.filter((course) => {
        const keyword = search.toLowerCase();

        return (
            course.title?.toLowerCase().includes(keyword) ||
            course.code?.toLowerCase().includes(keyword) ||
            course.semester?.toLowerCase().includes(keyword)
        );
    });

    if (loading) {
        return (
            <div className="py-20 text-center text-slate-500">
                Loading courses...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Available Courses
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    {department
                        ? `Published ${department} subjects of your current semester. Send an enrollment request; the course becomes active after approval.`
                        : "Published subjects of your department and current semester."}
                </p>
            </div>

            <div className="relative max-w-md">
                <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 outline-none focus:border-blue-600"
                />
            </div>

            {filteredCourses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
                    <BookOpen className="mx-auto mb-3 text-slate-400" size={36} />

                    <h3 className="font-semibold text-slate-800">
                        No courses found
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        No subject is published for your department and semester yet. Check again later.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                    {filteredCourses.map((course) => (
                        <div
                            key={course._id}
                            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 text-white">
                                <GraduationCap size={30} />

                                <p className="mt-4 text-xs font-medium text-blue-200">
                                    {course.code}
                                </p>

                                <h3 className="mt-1 text-lg font-bold">
                                    {course.title}
                                </h3>
                            </div>

                            <div className="space-y-3 p-5">

                                <p className="text-sm text-slate-600">
                                    {course.description || "No description available."}
                                </p>

                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="font-medium text-slate-700">
                                            Department:
                                        </span>{" "}
                                        {course.department?.name || "N/A"}
                                    </p>

                                    <p>
                                        <span className="font-medium text-slate-700">
                                            Credit:
                                        </span>{" "}
                                        {course.credit}
                                    </p>

                                    <p>
                                        <span className="font-medium text-slate-700">
                                            Semester:
                                        </span>{" "}
                                        {course.semester}
                                    </p>

                                    <p>
                                        <span className="font-medium text-slate-700">
                                            Teacher:
                                        </span>{" "}
                                        {course.teacher?.name || "Not assigned"}
                                    </p>
                                </div>

                                {["pending", "approved"].includes(applied[course._id]) ? (
                                    <p className="w-full rounded-lg bg-slate-100 px-4 py-3 text-center text-sm font-semibold capitalize text-slate-600">
                                        {applied[course._id] === "approved" ? "Enrolled" : "Application pending"}
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleEnroll(course._id)}
                                        disabled={enrollingId === course._id}
                                        className="w-full rounded-lg bg-blue-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {enrollingId === course._id
                                            ? "Submitting..."
                                            : "Apply for Enrollment"}
                                    </button>
                                )}

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
};

export default StudentCourses;
