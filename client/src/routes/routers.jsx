
import { createBrowserRouter } from "react-router";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";

import GuestRoute from "./GuestRoute";
import ProtectedRoute from "./ProtectedRoute";

const routers = createBrowserRouter([

    // Public Routes
    {
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
        ],
    },

    // Guest Only Routes (Login / Signup)
    {
        element: <GuestRoute />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "/login",
                        element: <Login />,
                    },
                    {
                        path: "/signup",
                        element: <Signup />,
                    },
                ],
            },
        ],
    },

    // Protected Routes (Only Logged In Users)
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    {
                        path: "/dashboard",
                        element: <Dashboard />,
                    },
                ],
            },
        ],
    },

]);

export default routers;
