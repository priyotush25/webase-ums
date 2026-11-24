import { createRequest } from "./http";

const request = createRequest("/api/public");

export const getOverview = () => request("/overview");

export const getDepartments = () => request("/departments");
export const getDepartment = (code) => request(`/departments/${code}`);
export const getFaculty = (search = "") =>
    request(search ? `/faculty?search=${encodeURIComponent(search)}` : "/faculty");
export const getPublicNotices = ({ page = 1, search = "" } = {}) =>
    request(`/notices?page=${page}&search=${encodeURIComponent(search)}`);
export const getPublicEvents = () => request("/events");
