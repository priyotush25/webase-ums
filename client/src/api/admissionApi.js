import { createRequest, jsonBody } from "./http";

const publicRequest = createRequest("/api/admissions");

export const submitApplication = (data) => publicRequest("/apply", jsonBody("POST", data));

export const trackApplication = (applicationNo, email) =>
    publicRequest(
        `/track?applicationNo=${encodeURIComponent(applicationNo)}&email=${encodeURIComponent(email)}`
    );

// Admin
export const getApplications = ({ page = 1, status = "", search = "" } = {}) =>
    publicRequest(`?page=${page}&status=${status}&search=${encodeURIComponent(search)}`);

export const reviewApplication = (id, data) => publicRequest(`/${id}`, jsonBody("PATCH", data));
