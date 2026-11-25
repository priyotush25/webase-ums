import { createRequest, jsonBody } from "./http";

// apply + my need a signed-in student; track is public
const publicRequest = createRequest("/api/admissions");

export const submitApplication = (data) => publicRequest("/apply", jsonBody("POST", data));

export const trackApplication = (applicationNo, email) =>
    publicRequest(
        `/track?applicationNo=${encodeURIComponent(applicationNo)}&email=${encodeURIComponent(email)}`
    );

export const getMyApplication = () => publicRequest("/my");

// Admin
export const getApplications = ({ page = 1, status = "", search = "" } = {}) =>
    publicRequest(`?page=${page}&status=${status}&search=${encodeURIComponent(search)}`);

export const reviewApplication = (id, data) => publicRequest(`/${id}`, jsonBody("PATCH", data));
