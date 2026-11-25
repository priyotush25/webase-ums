// Usage: npm run seed
// Adds sample departments and courses (safe to run more than once).
import dotenv from "dotenv";
import mongoose from "mongoose";

import Course from "../models/Course.js";
import Department from "../models/Department.js";

dotenv.config();

const departments = [
    { name: "Computer Science & Engineering", code: "CSE", description: "Software, AI, networks and systems." },
    { name: "Electrical & Electronic Engineering", code: "EEE", description: "Power, electronics and communication." },
    { name: "Business Administration", code: "BBA", description: "Management, marketing and finance." },
    { name: "English", code: "ENG", description: "Literature, linguistics and communication." },
];

const courses = {
    CSE: [
        ["Introduction to Programming", "CSE101", 3, "1st Semester"],
        ["Data Structures", "CSE201", 3, "3rd Semester"],
        ["Database Management Systems", "CSE301", 3, "5th Semester"],
        ["Operating Systems", "CSE305", 3, "5th Semester"],
    ],
    EEE: [
        ["Basic Electrical Engineering", "EEE101", 3, "1st Semester"],
        ["Digital Electronics", "EEE203", 3, "3rd Semester"],
    ],
    BBA: [
        ["Principles of Management", "BBA101", 3, "1st Semester"],
        ["Marketing Management", "BBA202", 3, "3rd Semester"],
    ],
    ENG: [["English Composition", "ENG101", 3, "1st Semester"]],
};

try {
    await mongoose.connect(process.env.MONGODB_URI);

    for (const dept of departments) {
        const department = await Department.findOneAndUpdate(
            { code: dept.code },
            { $setOnInsert: dept },
            { upsert: true, new: true }
        );

        for (const [title, code, credit, semester] of courses[dept.code] || []) {
            await Course.findOneAndUpdate(
                { code },
                { $setOnInsert: { title, code, credit, semester, department: department._id, isPublished: true } },
                { upsert: true }
            );
        }
    }

    console.log("Seed completed: departments and courses are ready.");
} catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
