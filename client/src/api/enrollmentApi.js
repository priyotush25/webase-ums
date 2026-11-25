
const API_URL = import.meta.env.VITE_API_URL;

// ========================================
// STUDENT: APPLY FOR COURSE
// ========================================

export const createEnrollment = async (courseId) => {
    const response = await fetch(`${API_URL}/api/enrollments`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Enrollment failed");
    }

    return data;
};

// ========================================
// STUDENT: GET MY ENROLLMENTS
// ========================================

export const getMyEnrollments = async () => {
    const response = await fetch(`${API_URL}/api/enrollments/my`, {
        method: "GET",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch enrollments");
    }

    return data;
};

// ========================================
// ADMIN: GET ALL ENROLLMENTS
// ========================================

export const getAllEnrollments = async ({
    search = "",
    status = "all",
    course = "all",
} = {}) => {
    const params = new URLSearchParams({
        search,
        status,
        course,
    });

    const response = await fetch(
        `${API_URL}/api/enrollments?${params.toString()}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch enrollments");
    }

    return data;
};

// ========================================
// ADMIN: UPDATE ENROLLMENT STATUS
// ========================================

export const updateEnrollmentStatus = async (
    enrollmentId,
    status,
    remarks = ""
) => {
    const response = await fetch(
        `${API_URL}/api/enrollments/${enrollmentId}/status`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status,
                remarks,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update enrollment");
    }

    return data;
};

// ========================================
// ADMIN: DELETE ENROLLMENT
// ========================================

export const deleteEnrollment = async (enrollmentId) => {
    const response = await fetch(
        `${API_URL}/api/enrollments/${enrollmentId}`,
        {
            method: "DELETE",
            credentials: "include",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to delete enrollment");
    }

    return data;
};
