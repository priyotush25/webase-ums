import { createRequest } from "./http";

const request = createRequest("/api/enrollments");

export const getMyTeachingStudents = () => request("/teacher/students");
