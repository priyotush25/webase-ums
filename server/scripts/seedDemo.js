// Usage: npm run seed:demo
// Adds DEMO teachers (cannot log in) and sample notices so the public website looks populated.
// Run `npm run seed` first. Remove demo data later from the admin panel / database.
import dotenv from "dotenv";
import mongoose from "mongoose";

import Department from "../models/Department.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";

dotenv.config();

const teachers = [
    ["Dr. Abdul Karim", "Professor", "CSE"],
    ["Dr. Farhana Rahman", "Associate Professor", "EEE"],
    ["Md. Shahidul Islam", "Assistant Professor", "BBA"],
    ["Nasrin Sultana", "Lecturer", "ENG"],
    ["Tanvir Hasan", "Lecturer", "CSE"],
];

try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const [name, designation, code] of teachers) {
        const department = await Department.findOne({ code });
        const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@demo.university.edu`;

        if (await User.exists({ email })) continue;

        await new User({
            firebaseUid: `demo-${email}`,
            name,
            email,
            role: "teacher",
            designation,
            department: department?._id ?? null,
            bio: "Demo profile. Replace with the real faculty member's details.",
        }).save();
    }

    const admin = await User.findOne({ role: "admin" });

    if (admin && (await Notice.countDocuments()) === 0) {
        await Notice.insertMany([
            { title: "Admission Spring 2027 is open", body: "Applications are open for all departments. Apply online and track your application with the application number.", priority: "important", pinned: true, author: admin._id },
            { title: "Course registration schedule", body: "Students must send enrollment requests for the new semester before the registration deadline shown in the academic calendar.", author: admin._id },
            { title: "Library hours during exams", body: "The library will stay open until 10:00 PM during the examination period.", author: admin._id },
        ]);
    } else if (!admin) {
        console.log("No admin found, skipped sample notices. Run make-admin first, then seed:demo again.");
    }

    console.log("Demo data ready.");
} catch (error) {
    console.error("Seed demo failed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
