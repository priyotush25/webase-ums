import { createRequest, jsonBody } from "./http";

const request = createRequest("/api/fees");

export const getMyFees = () => request("/my");
export const getAllFees = (status = "") => request(status ? `?status=${status}` : "");
export const createFee = (data) => request("", jsonBody("POST", data));
export const markFeePaid = (id, data) => request(`/${id}/pay`, jsonBody("PATCH", data));
export const deleteFee = (id) => request(`/${id}`, { method: "DELETE" });
