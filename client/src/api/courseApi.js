
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const request = async (endpoint, options = {}) => {
    const response = await fetch(
        `${API_URL}/api/courses${endpoint}`,
        {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
};

// Get all courses
export const getAllCourses = (params = {}) => {
    const query = new URLSearchParams(params).toString();

    return request(query ? `?${query}` : "");
};

// Get single course
export const getCourseById = (courseId) => {
    return request(`/${courseId}`);
};

// Create course
export const createCourse = (courseData) => {
    return request("", {
        method: "POST",
        body: JSON.stringify(courseData),
    });
};

// Update course
export const updateCourse = (courseId, courseData) => {
    return request(`/${courseId}`, {
        method: "PATCH",
        body: JSON.stringify(courseData),
    });
};

// Delete course
export const deleteCourse = (courseId) => {
    return request(`/${courseId}`, {
        method: "DELETE",
    });
};

// Get teacher's assigned courses
export const getMyTeachingCourses = () => {
    return request("/my");
};
