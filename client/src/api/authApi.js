
const API_URL = import.meta.env.VITE_API_URL;

/// CREATE MONGODB USER PROFILE
export const createUserProfile = async (user, name, image) => {
    try {
        const idToken = await user.getIdToken();

        const formData = new FormData();

        formData.append("name", name);

        if (image) formData.append("image", image);

        const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Profile creation failed");
        }

        return data;

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
        const idToken = await user.getIdToken();

        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Backend login failed");
        }

        return data;

    } catch (error) {
        console.error("Backend Login Error:", error.message);
        throw error;
    }
};


// ========================================
// GET CURRENT LOGGED-IN USER
// ========================================

export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch current user");
        }

        return data;

    } catch (error) {
        console.error("Get Current User Error:", error.message);
        throw error;
    }
};


// ========================================
// BACKEND LOGOUT
// ========================================

export const logoutUser = async () => {
    try {
        const response = await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Logout failed");
        }

        return data;

    } catch (error) {
        console.error("Backend Logout Error:", error.message);
        throw error;
    }
};


// ========================================
// LOGOUT FROM ALL DEVICES
// ========================================

export const logoutAllDevices = async () => {
    const response = await fetch(`${API_URL}/api/auth/logout-all`, {
        method: "POST",
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to log out from all devices");

    return data;
};


// ========================================
// OWN PROFILE (full details)
// ========================================

export const getMyProfile = async () => {
    const response = await fetch(`${API_URL}/api/auth/profile`, { credentials: "include" });
    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to load profile");

    return data;
};

export const updateProfileRequest = async ({ image, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
    });

    if (image) formData.append("image", image);

    const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Profile update failed");

    return data;
};
