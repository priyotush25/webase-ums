
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

const getAuthHeaders = async (user = auth.currentUser) => {
    if (!user) {
        throw new Error("Authentication required. Please login first.");
    }

    const idToken = await user.getIdToken();

    return {
        Authorization: `Bearer ${idToken}`,
    };
};

// ========================================
// COMMON API RESPONSE HANDLER
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
// CREATE MONGODB USER PROFILE
// ========================================

export const createUserProfile = async (user, name, image) => {
    try {
        if (!user) {
            throw new Error("Firebase user not found.");
        }

        if (!image) {
            throw new Error("Profile image is missing from frontend.");
        }

        const headers = await getAuthHeaders(user);

        const formData = new FormData();

        formData.append("name", name);
        formData.append("image", image);

        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers,
            body: formData,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Profile Creation Error:", error);
        throw error;
    }
};

// ========================================
// BACKEND LOGIN
// ========================================

export const loginUser = async (user) => {
    try {
        const headers = await getAuthHeaders(user);

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Backend Login Error:", error);
        throw error;
    }
};

// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================

export const getCurrentUser = async () => {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            credentials: "include",
            headers,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Get Current User Error:", error);
        throw error;
    }
};

// ========================================
// BACKEND LOGOUT
// ========================================

export const logoutUser = async () => {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Backend Logout Error:", error);
        throw error;
    }
};

// ========================================
// GET OWN PROFILE
// ========================================

export const getMyProfile = async () => {
    try {
        const headers = await getAuthHeaders();

        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: "GET",
            credentials: "include",
            headers,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Get Profile Error:", error);
        throw error;
    }
};

// ========================================
// UPDATE OWN PROFILE
// ========================================

export const updateProfileRequest = async ({ image, ...fields }) => {
    try {
        const headers = await getAuthHeaders();

        const formData = new FormData();

        Object.entries(fields).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        if (image) {
            formData.append("image", image);
        }

        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: "PUT",
            credentials: "include",
            headers,
            body: formData,
        });

        return await handleResponse(response);

    } catch (error) {
        console.error("Update Profile Error:", error);
        throw error;
    }
};
