import Course from "../models/Course.js";

// "1st Semester", "1st  semester " -> "1st semester"
export const semesterKey = (value) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export const sameSemester = (a, b) => Boolean(semesterKey(a)) && semesterKey(a) === semesterKey(b);

const round2 = (n) => Number(Number(n).toFixed(2));

// Published subjects of the student's own department and current semester
export const getCurrentSemesterCourses = async (user) => {
    if (!user.department) return [];

    const courses = await Course.find({
        department: user.department,
        isPublished: true,
        status: { $ne: "inactive" },
    })
        .populate("department", "name code")
        .populate("teacher", "name email photoURL")
        .sort({ code: 1 });

    return courses.filter((course) => sameSemester(course.semester, user.semester));
};

// Course details of a result (falls back to the saved snapshot)
const courseOf = (result) => {
    const course = result.course && result.course.code ? result.course : null;
    const snap = result.snapshot || {};

    return {
        _id: course?._id ?? result.course ?? null,
        code: course?.code || snap.code || "",
        title: course?.title || snap.title || "",
        credit: Number(course?.credit ?? snap.credit ?? 0),
        semester: course?.semester || snap.semester || "Other",
    };
};

// Semester-wise history and CGPA from PUBLISHED results only.
// CGPA counts every graded subject (a fail counts with 0 points); earned credit excludes fails.
export const summarizeResults = (results) => {
    const semesters = new Map();
    let credits = 0;
    let points = 0;
    let earned = 0;

    for (const item of results) {
        const course = courseOf(item);
        const passed = item.gradePoint > 0;

        credits += course.credit;
        points += course.credit * item.gradePoint;
        if (passed) earned += course.credit;

        if (!semesters.has(course.semester)) semesters.set(course.semester, []);
        semesters.get(course.semester).push({ ...item.toObject(), course, passed });
    }

    const history = [...semesters.entries()].map(([semester, items]) => {
        const semCredits = items.reduce((sum, i) => sum + i.course.credit, 0);
        const semPoints = items.reduce((sum, i) => sum + i.course.credit * i.gradePoint, 0);
        const semEarned = items.reduce((sum, i) => sum + (i.passed ? i.course.credit : 0), 0);

        return {
            semester,
            credits: semCredits,
            earnedCredits: semEarned,
            sgpa: semCredits ? round2(semPoints / semCredits) : 0,
            results: items,
        };
    });

    return {
        cgpa: credits ? round2(points / credits) : 0,
        gradedCredits: credits,
        earnedCredits: earned,
        totalCourses: results.length,
        history,
    };
};

// Fresh snapshot of a course for a result document
export const courseSnapshot = (course) => ({
    code: course.code,
    title: course.title,
    credit: course.credit,
    semester: course.semester,
});
