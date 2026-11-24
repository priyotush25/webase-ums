import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/events");

export const getEvents = (upcoming = false) => request(upcoming ? "?upcoming=true" : "");
export const createEvent = (data) => request("", jsonBody("POST", data));
export const updateEvent = (id, data) => request(`/${id}`, jsonBody("PATCH", data));
export const deleteEvent = (id) => request(`/${id}`, { method: "DELETE" });
