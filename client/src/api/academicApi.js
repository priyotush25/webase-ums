
const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// ========================================
// DEPARTMENT APIs
// ========================================

export const getAllDepartments = async ({
    search = "",
    status = "all",
} = {}) => {
    const params = new URLSearchParams({ search, status });

    const response = await fetch(
        `${API_URL}/api/departments?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch departments");
    }

    return data;
};

export const getDepartmentById = async (departmentId) => {
    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch department");
    }

    return data;
};

export const createDepartment = async (departmentData) => {
    const response = await fetch(`${API_URL}/api/departments`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create department");
    }

    return data;
};

export const updateDepartment = async (departmentId, departmentData) => {
    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(departmentData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update department");
    }

    return data;
};

export const deleteDepartment = async (departmentId) => {
    const response = await fetch(
        `${API_URL}/api/departments/${departmentId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete department");
    }

    return data;
};


// ========================================
// COURSE APIs
// ========================================

export const getAllCourses = async ({
    search = "",
    department = "all",
    status = "all",
} = {}) => {
    const params = new URLSearchParams({
        search,
        department,
        status,
    });

    const response = await fetch(
        `${API_URL}/api/courses?${params.toString()}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch courses");
    }

    return data;
};

export const getCourseById = async (courseId) => {
    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch course");
    }

    return data;
};

export const createCourse = async (courseData) => {
    const response = await fetch(`${API_URL}/api/courses`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create course");
    }

    return data;
};

export const updateCourse = async (courseId, courseData) => {
    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(courseData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update course");
    }

    return data;
};

export const deleteCourse = async (courseId) => {
    const response = await fetch(
        `${API_URL}/api/courses/${courseId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete course");
    }

    return data;
};
