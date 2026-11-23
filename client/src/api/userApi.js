
const API_URL = import.meta.env.VITE_API_URL;

// 1. Get All Users
export const getAllUsers = async ({
    page = 1,
    limit = 10,
    search = "",
    role = "all"
} = {}) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        role
    });

    const response = await fetch(
        `${API_URL}/api/users?${params.toString()}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users");
    }

    return data;
};

// 2. Get Single User
export const getUserById = async (userId) => {
    const response = await fetch(
        `${API_URL}/api/users/${userId}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user");
    }

    return data;
};

// 3. Update User Role
export const updateUserRole = async (userId, role) => {
    const response = await fetch(
        `${API_URL}/api/users/${userId}/role`,
        {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ role })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
    }

    return data;
};

// 4. Get User Statistics
export const getUserStats = async () => {
    const response = await fetch(
        `${API_URL}/api/users/stats`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch user statistics"
        );
    }

    return data;
};
