import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/routines");

export const getMyRoutine = () => request("/my");
export const getAllRoutines = () => request("");
export const createRoutine = (data) => request("", jsonBody("POST", data));
export const updateRoutine = (id, data) => request(`/${id}`, jsonBody("PATCH", data));
export const deleteRoutine = (id) => request(`/${id}`, { method: "DELETE" });
