
const API_URL = import.meta.env.VITE_API_URL;

// Get All Users
export const getAllUsers = async ({
    page = 1,
    limit = 10,
    search = "",
    role = "all"
} = {}) => {
    const params = new URLSearchParams({
        page,
        limit,
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


// Get Single User
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


// Update User Role
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
        throw new Error(data.message || "Failed to update role");
    }

    return data;
};
