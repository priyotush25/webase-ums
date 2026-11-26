import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/notices");

export const getNotices = (limit = 50) => request(`?limit=${limit}`);
export const createNotice = (data) => request("", jsonBody("POST", data));
export const updateNotice = (id, data) => request(`/${id}`, jsonBody("PATCH", data));
export const deleteNotice = (id) => request(`/${id}`, { method: "DELETE" });
