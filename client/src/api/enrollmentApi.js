
import { auth } from "../firebase/firebase";

// ========================================
// API BASE URL
// ========================================

const API_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// ========================================
// GET FIREBASE AUTH TOKEN
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
// STUDENT: APPLY FOR COURSE
// ========================================

export const createEnrollment = async (courseId) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(`${API_URL}/api/enrollments`, {
        method: "POST",
        credentials: "include",
        headers,
        body: JSON.stringify({ courseId }),
    });

    return await handleResponse(response);
};

// ========================================
// STUDENT: GET MY ENROLLMENTS
// ========================================

export const getMyEnrollments = async () => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/api/enrollments/my`, {
        method: "GET",
        credentials: "include",
        headers,
    });

    return await handleResponse(response);
};

// ========================================
// ADMIN: GET ALL ENROLLMENTS
// ========================================

export const getAllEnrollments = async ({
    search = "",
    status = "all",
    course = "all",
} = {}) => {
    const headers = await getAuthHeaders();

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
            headers,
        }
    );

    return await handleResponse(response);
};

// ========================================
// ADMIN: UPDATE ENROLLMENT STATUS
// ========================================

export const updateEnrollmentStatus = async (
    enrollmentId,
    status,
    remarks = ""
) => {
    const headers = await getAuthHeaders(true);

    const response = await fetch(
        `${API_URL}/api/enrollments/${enrollmentId}/status`,
        {
            method: "PATCH",
            credentials: "include",
            headers,
            body: JSON.stringify({
                status,
                remarks,
            }),
        }
    );

    return await handleResponse(response);
};

// ========================================
// ADMIN: DELETE ENROLLMENT
// ========================================

export const deleteEnrollment = async (enrollmentId) => {
    const headers = await getAuthHeaders();

    const response = await fetch(
        `${API_URL}/api/enrollments/${enrollmentId}`,
        {
            method: "DELETE",
            credentials: "include",
            headers,
        }
    );

    return await handleResponse(response);
};
