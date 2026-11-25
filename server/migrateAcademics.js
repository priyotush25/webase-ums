import Admission from "../models/Admission.js";
import Course from "../models/Course.js";
import Result from "../models/Result.js";
import User from "../models/User.js";

// One-time, idempotent upgrade of data created before the admission-first workflow.
export const migrateAcademics = async () => {
    // Courses that already existed were visible to students: keep them published
    const courses = await Course.updateMany({ isPublished: { $exists: false } }, { $set: { isPublished: true } });

    // Results that already existed were visible to students: keep them published
    const results = await Result.updateMany(
        { published: { $exists: false } },
        { $set: { published: true, publishedAt: new Date() } }
    );

    // Students who were admitted by the old public application (matched by email)
    let linked = 0;

    const students = await User.find({ role: "student", admission: null });

    for (const student of students) {
        const admission = await Admission.findOne({ email: student.email, status: "approved" }).sort({ createdAt: -1 });
        if (!admission) continue;

        student.admission = admission._id;
        student.department = student.department || admission.department;
        student.program = student.program || admission.program;
        student.semester = student.semester || "1st Semester";
        await student.save();

        if (!admission.user) await Admission.updateOne({ _id: admission._id }, { $set: { user: student._id } });
        linked += 1;
    }

    return { courses: courses.modifiedCount, results: results.modifiedCount, linked };
};

export default migrateAcademics;
