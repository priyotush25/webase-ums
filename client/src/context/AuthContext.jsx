
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import {
    createUserWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

import { toast } from "react-toastify";

import {
    createUserProfile,
    getCurrentUser,
    loginUser,
    logoutAllDevices,
    logoutUser
} from "../api/authApi";

import { auth } from "../firebase/firebase";

// Create Context
const AuthContext = createContext(null);


// Auth Provider
export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Prevent Firebase Auth Listener Race Condition
    const authActionRef = useRef(false);


    // ========================================
    // HELPER: SET USER DATA
    // ========================================

    const setAuthenticatedUser = (firebaseUser, backendUser) => {

        if (!backendUser) {
            throw new Error("Backend user profile not found.");
        }

        const userData = {
            ...firebaseUser,
            ...backendUser
        };

        setUser(userData);
        setRole(
            backendUser.role?.toString().trim().toLowerCase() || null
        );

        return userData;
    };


    // ========================================
    // SIGNUP
    // ========================================

    const signup = async (name, email, password, image) => {

        authActionRef.current = true;

        let firebaseUser = null;

        try {

            // Step 1: Firebase Account Create
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            firebaseUser = result.user;

            // Step 2: Update Firebase Profile
            await updateProfile(firebaseUser, {
                displayName: name
            });

            // Step 3: Create MongoDB Profile + JWT session
            const backendResponse = await createUserProfile(
                firebaseUser,
                name,
                image
            );

            if (backendResponse.warning) {
                toast.warning(backendResponse.warning);
            }

            // Step 4: Set User and Role
            return setAuthenticatedUser(
                firebaseUser,
                backendResponse.user
            );

        } catch (error) {

            console.error("Signup Error:", error);

            // Remove the half-created Firebase account so the person can retry
            // with the same email instead of being locked out.
            if (firebaseUser) {
                try {
                    await deleteUser(firebaseUser);
                } catch (deleteError) {
                    console.error("Firebase Cleanup Error:", deleteError);
                    try {
                        await signOut(auth);
                    } catch {
                        // ignore
                    }
                }
            }

            setUser(null);
            setRole(null);

            throw error;

        } finally {

            authActionRef.current = false;

        }
    };


    // ========================================
    // LOGIN
    // ========================================

    const login = async (email, password) => {

        authActionRef.current = true;

        try {

            // Step 1: Firebase Login
            const result = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Step 2: Backend Login
            const backendResponse = await loginUser(result.user);

            // Step 3: Get MongoDB User
            const backendUser = backendResponse?.user;

            if (!backendUser) {
                throw new Error(
                    "User profile not received from backend."
                );
            }

            // Step 4: Validate Role
            const validRoles = [
                "student",
                "teacher",
                "admin"
            ];

            const databaseRole = backendUser.role
                ?.toString()
                .trim()
                .toLowerCase();

            if (!validRoles.includes(databaseRole)) {
                throw new Error("Invalid user role.");
            }

            // Step 5: Set User and Role
            const userData = setAuthenticatedUser(
                result.user,
                {
                    ...backendUser,
                    role: databaseRole
                }
            );

            console.log("Login Successful:", userData);
            console.log("Database Role:", databaseRole);

            // Step 6: Return MongoDB User
            return userData;

        } catch (error) {

            console.error("Login Error:", error);

            // Cleanup Firebase Session
            if (auth.currentUser) {
                try {
                    await signOut(auth);
                } catch (signOutError) {
                    console.error(
                        "Firebase Signout Error:",
                        signOutError
                    );
                }
            }

            setUser(null);
            setRole(null);

            throw error;

        } finally {

            authActionRef.current = false;

        }
    };


    // ========================================
    // LOGOUT
    // ========================================

    const logout = async () => {

        authActionRef.current = true;

        try {

            // Step 1: Clear Backend Cookie
            await logoutUser();

        } catch (error) {

            console.error("Backend Logout Error:", error);

        } finally {

            try {

                // Step 2: Clear Firebase Session
                if (auth.currentUser) {
                    await signOut(auth);
                }

            } catch (error) {

                console.error("Firebase Logout Error:", error);

            } finally {

                // Step 3: Clear React State
                setUser(null);
                setRole(null);

                authActionRef.current = false;

            }
        }
    };


    // ========================================
    // LOGOUT FROM ALL DEVICES
    // ========================================

    const logoutEverywhere = async () => {
        await logoutAllDevices();
        await logout();
    };


    // ========================================
    // SESSION EXPIRED (any API call answered with 401)
    // ========================================

    useEffect(() => {

        const API_URL = import.meta.env.VITE_API_URL || "";
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);

            const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
            const isAuthCall = /\/api\/auth\/(login|signup|logout|logout-all)/.test(url);
            const isOwnApi = !API_URL || url.startsWith(API_URL);

            if (response.status === 401 && isOwnApi && !isAuthCall && !authActionRef.current) {
                setUser(null);
                setRole(null);
                signOut(auth).catch(() => {});
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };

    }, []);


    // ========================================
    // AUTHENTICATION STATE RESTORE
    // ========================================

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {

                // Ignore Intermediate Events
                if (authActionRef.current) {
                    return;
                }

                // User Not Logged In
                if (!currentUser) {

                    setUser(null);
                    setRole(null);
                    setLoading(false);

                    return;
                }

                try {

                    // Step 1: Restore Backend Session
                    const backendResponse = await getCurrentUser();

                    // Step 2: Restore User Data
                    setAuthenticatedUser(
                        currentUser,
                        backendResponse.user
                    );

                } catch (error) {

                    console.error(
                        "Backend Session Restore Error:",
                        error.message
                    );

                    // Step 3: Recreate Backend Session
                    try {

                        const backendResponse = await loginUser(
                            currentUser
                        );

                        setAuthenticatedUser(
                            currentUser,
                            backendResponse.user
                        );

                    } catch (loginError) {

                        console.error(
                            "Session Restore Failed:",
                            loginError.message
                        );

                        await signOut(auth);

                        setUser(null);
                        setRole(null);

                    }

                } finally {

                    setLoading(false);

                }
            }
        );

        return () => unsubscribe();

    }, []);


    // ========================================
    // CONTEXT VALUES
    // ========================================

    // Merge updated backend profile fields (name, photo) into current user
    const updateUserData = (changes) => {
        setUser((previous) => (previous ? { ...previous, ...changes } : previous));
    };

    const authInfo = {
        user,
        role,
        loading,
        signup,
        login,
        logout,
        logoutEverywhere,
        updateUserData
    };


    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );

};


// ========================================
// CUSTOM AUTH HOOK
// ========================================

export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};


export default AuthContext;
