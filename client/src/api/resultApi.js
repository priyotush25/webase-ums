import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/results");

export const getMyResults = () => request("/my");
export const getCourseResults = (courseId) => request(`/course/${courseId}`);
export const saveCourseResults = (courseId, results) =>
    request(`/course/${courseId}`, jsonBody("POST", { results }));
export const getAllResults = (courseId) =>
    request(courseId ? `?courseId=${courseId}` : "");
export const publishCourseResults = (courseId) =>
    request(`/course/${courseId}/publish`, { method: "POST" });
