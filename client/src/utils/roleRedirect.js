
const roleRedirect = (role) => {

    const dashboardPaths = {
        student: "/student/dashboard",
        teacher: "/teacher/dashboard",
        admin: "/admin/dashboard"
    };

    return dashboardPaths[role] || "/login";
};

export default roleRedirect;
