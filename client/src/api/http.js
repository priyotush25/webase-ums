const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Creates a small fetch wrapper for one API base path (e.g. "/api/notices")
export const createRequest = (basePath) => async (endpoint = "", options = {}) => {
    const response = await fetch(`${API_URL}${basePath}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        // non-JSON response
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const jsonBody = (method, body) => ({
    method,
    body: JSON.stringify(body),
});
