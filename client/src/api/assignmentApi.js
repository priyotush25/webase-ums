import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/assignments");

export const getStudentAssignments = () => request("/student");
export const getMyAssignments = () => request("/my");
export const getAllAssignments = () => request("");
export const createAssignment = (data) => request("", jsonBody("POST", data));
export const updateAssignment = (id, data) => request(`/${id}`, jsonBody("PATCH", data));
export const deleteAssignment = (id) => request(`/${id}`, { method: "DELETE" });

// Student: submit / update own work
export const submitAssignment = (id, data) => request(`/${id}/submit`, jsonBody("POST", data));

// Teacher: check submissions and give marks
export const getSubmissions = (id) => request(`/${id}/submissions`);
export const markSubmission = (submissionId, data) =>
    request(`/submissions/${submissionId}`, jsonBody("PATCH", data));
