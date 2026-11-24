// Usage: npm run make-admin -- user@example.com
// Promotes an existing (already signed-up) user to admin.
import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
    console.error("Usage: npm run make-admin -- <email>");
    process.exit(1);
}

try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOneAndUpdate(
        { email },
        { $set: { role: "admin" } },
        { returnDocument: "after" }
    );

    if (!user) {
        console.error(`No user found with email: ${email}. Sign up on the website first.`);
        process.exitCode = 1;
    } else {
        console.log(`${user.name} (${user.email}) is now an admin.`);
    }
} catch (error) {
    console.error("Failed:", error.message);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
