
import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in environment variables");
        }

        cached.promise = mongoose
            .connect(MONGODB_URI)
            .then((mongoose) => {
                console.log(
                    `MongoDB Connected: ${mongoose.connection.host}`
                );

                return mongoose;
            })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;

    return cached.conn;
};

export default connectDB;
