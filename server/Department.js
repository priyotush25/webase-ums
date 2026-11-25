
import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Department name is required"],
            trim: true,
            unique: true,
        },

        code: {
            type: String,
            required: [true, "Department code is required"],
            trim: true,
            uppercase: true,
            unique: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
