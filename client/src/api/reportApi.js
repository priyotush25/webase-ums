import { createRequest } from "./http";

const request = createRequest("/api/reports");

export const getSummary = () => request("/summary");
