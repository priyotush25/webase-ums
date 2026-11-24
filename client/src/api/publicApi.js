import { createRequest } from "./http";

const request = createRequest("/api/public");

export const getOverview = () => request("/overview");
