
import { auth } from "../firebase/firebase";

const API_URL = import.meta.env.VITE_API_URL;

// ========================================
// REUSABLE AUTHENTICATED API REQUEST
// ========================================

const authRequest = async (endpoint, options = {}, currentUser = auth.currentUser) => {
    if (!currentUser) {
        throw new Error("User is not authenticated");
    }

    const idToken = await currentUser.getIdToken();

    const headers = {
        ...options.headers,
        Authorization: `Bearer ${idToken}`,
    };

    // FormData হলে Content-Type নিজে সেট করবেন না
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}/api/auth${endpoint}`, {
        ...options,
        credentials: "include",
        headers,
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        // Non-JSON response
    }

    if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
};


// ========================================
// CREATE MONGODB USER PROFILE
// ========================================

export const createUserProfile = async (user, name, image) => {
    const formData = new FormData();

    formData.append("name", name);

    if (image) formData.append("image", image);

    return authRequest(
        "/signup",
        {
            method: "POST",
            body: formData,
        },
        user
    );
};


// ========================================
// BACKEND LOGIN
// ========================================

export const loginUser = async (user) => {
    return authRequest("/login", {
        method: "POST",
    }, user);
};


// ========================================
// GET CURRENT USER
// ========================================

export const getCurrentUser = async () => {
    return authRequest("/me");
};


// ========================================
// BACKEND LOGOUT
// ========================================

export const logoutUser = async () => {
    return authRequest("/logout", {
        method: "POST",
    });
};


// ========================================
// LOGOUT FROM ALL DEVICES
// ========================================

export const logoutAllDevices = async () => {
    return authRequest("/logout-all", {
        method: "POST",
    });
};


// ========================================
// GET MY PROFILE
// ========================================

export const getMyProfile = async () => {
    return authRequest("/profile");
};


// ========================================
// UPDATE MY PROFILE
// ========================================

export const updateProfileRequest = async ({ image, ...fields }) => {
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            formData.append(key, value);
        }
    });

    if (image) {
        formData.append("image", image);
    }

    return authRequest("/profile", {
        method: "PUT",
        body: formData,
    });
};
