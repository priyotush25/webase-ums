
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const request = async (endpoint, options = {}) => {
    const response = await fetch(
        `${API_URL}/api/attendance${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Attendance request failed");
    }

    return data;
};

// Teacher
export const getCourseStudentsForAttendance = (courseId) =>
    request(`/course/${courseId}/students`);

export const getCourseAttendance = (courseId, date) => {
    const params = new URLSearchParams({ date });

    return request(`/course/${courseId}?${params}`);
};

export const saveCourseAttendance = (courseId, date, records) =>
    request(`/course/${courseId}`, {
        method: "POST",
        body: JSON.stringify({ date, records })
    });

// Student
export const getMyAttendance = (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(query ? `/my?${query}` : "/my");
};

// Admin
export const getAllAttendance = (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(query ? `/?${query}` : "/");
};
