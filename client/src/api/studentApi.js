import { createRequest } from "./http";

const request = createRequest("/api/student");

// Dashboard data: admission state, current semester subjects, credits, CGPA
export const getMyOverview = () => request("/overview");
