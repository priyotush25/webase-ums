import mongoose from "mongoose";

// Reuses one connection (important on serverless platforms like Vercel)
let connecting = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;

    if (!connecting) {
        connecting = mongoose
            .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
            .then((connection) => {
                console.log(`MongoDB Connected: ${connection.connection.host}`);
                return connection.connection;
            })
            .catch((error) => {
                connecting = null;
                console.error("MongoDB Connection Error:", error.message);
                throw error;
            });
    }

    return connecting;
};

export default connectDB;
