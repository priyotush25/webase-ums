
const API_URL = import.meta.env.VITE_API_URL;

export const createRequest = (basePath) => async (
    endpoint = "",
    options = {}
) => {
    const response = await fetch(
        `${API_URL}${basePath}${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {}

    if (!response.ok) {
        throw new Error(
            data.message || `API Error: ${response.status}`
        );
    }

    return data;
};

export const jsonBody = (method, body) => ({
    method,
    body: JSON.stringify(body),
});
