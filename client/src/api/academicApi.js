
import { auth } from "../firebase/firebase";

// ========================================
// API BASE URL
// ========================================

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ========================================
// GET FIREBASE AUTH HEADERS
// ========================================

const getAuthHeaders = async (contentType = false) => {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Authentication required. Please login first.");
    }

    const idToken = await user.getIdToken();

    const headers = {
        Authorization: `Bearer ${idToken}`,
    };

    if (contentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
};

// ========================================
// COMMON RESPONSE HANDLER
// ========================================

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || `API Error: ${response.status}`
        );
    }

    return data;
};

// ========================================
// DEPARTMENT APIs
// ========================================

// GET ALL DEPARTMENTS

export const getAllDepartments = async ({
    search = "",
    status = "all",
} = {}) => {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({ search, status });

    const response = await fetch(
        `${API_URL}/api/departments?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};

// GET DEPARTMENT BY ID

export const getDepartmentById = async (departmentId) => {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            method: "GET",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};

// CREATE DEPARTMENT

export const createDepartment = async (departmentData) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(`${API_URL}/api/departments`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(departmentData),
    });

    return await handleResponse(response);
};

// UPDATE DEPARTMENT

export const updateDepartment = async (departmentId, departmentData) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers,
            body: JSON.stringify(departmentData),
        }
    );

    return await handleResponse(response);
};

// DELETE DEPARTMENT

export const deleteDepartment = async (departmentId) => {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            method: "DELETE",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};

// ========================================
// COURSE APIs
// ========================================

// GET ALL COURSES

export const getAllCourses = async ({
    search = "",
    department = "all",
    status = "all",
} = {}) => {
    const headers = await getAuthHeaders();

    const params = new URLSearchParams({
        search,
        department,
        status,
    });

    const response = await fetch(
        `${API_URL}/api/courses?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};

// GET COURSE BY ID

export const getCourseById = async (courseId) => {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            method: "GET",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};

// CREATE COURSE

export const createCourse = async (courseData) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify(courseData),
    });

    return await handleResponse(response);
};

// UPDATE COURSE

export const updateCourse = async (courseId, courseData) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers,
            body: JSON.stringify(courseData),
        }
    );

    return await handleResponse(response);
};

// DELETE COURSE

export const deleteCourse = async (courseId) => {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            method: "DELETE",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};
