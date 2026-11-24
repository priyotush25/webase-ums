
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

import {
    createUserProfile,
    getCurrentUser,
    loginUser,
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

        try {

            if (!image) {
                throw new Error("Profile image is required.");
            }

            // Step 1: Firebase Account Create
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Step 2: Update Firebase Profile
            await updateProfile(result.user, {
                displayName: name
            });

            // Step 3: Create MongoDB Profile
            const backendResponse = await createUserProfile(
                result.user,
                name,
                image
            );

            // Step 4: Set User and Role
            const userData = setAuthenticatedUser(
                result.user,
                backendResponse.user
            );

            return userData;

        } catch (error) {

            console.error("Signup Error:", error);

            // Cleanup Firebase Account Session
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
