
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

    // Prevent auth listener from racing with signup/login
    const authActionRef = useRef(false);


    // ========================================
    // SIGNUP
    // ========================================

    const signup = async (name, email, password, image) => {

        authActionRef.current = true;

        try {

            if (!image) {
                throw new Error("Profile image is required.");
            }

            // Step 1: Create Firebase Account
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Step 2: Update Firebase Profile
            await updateProfile(result.user, {
                displayName: name
            });

            // Step 3: Create MongoDB Profile + Upload Image
            const backendResponse = await createUserProfile(
                result.user,
                name,
                image
            );

            // Step 4: Merge Firebase + MongoDB User Data
            setUser({
                ...result.user,
                ...backendResponse.user
            });

            setRole(backendResponse.user.role);

            return backendResponse.user;

        } catch (error) {

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

            // Step 3: Merge Firebase + MongoDB User Data
            setUser({
                ...result.user,
                ...backendResponse.user
            });

            setRole(backendResponse.user.role);

            return backendResponse.user;

        } catch (error) {

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

            // Clear Backend JWT Cookie
            await logoutUser();

        } finally {

            try {

                // Clear Firebase Session
                if (auth.currentUser) {
                    await signOut(auth);
                }

            } finally {

                setUser(null);
                setRole(null);
                authActionRef.current = false;

            }
        }
    };


    // ========================================
    // AUTHENTICATION STATE
    // ========================================

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (currentUser) => {

                // Ignore intermediate Firebase events
                if (authActionRef.current) {
                    return;
                }

                if (!currentUser) {

                    setUser(null);
                    setRole(null);
                    setLoading(false);

                    return;
                }

                try {

                    // Restore Backend Session from HttpOnly Cookie
                    const backendResponse = await getCurrentUser();

                    // Merge Firebase + MongoDB User Data
                    setUser({
                        ...currentUser,
                        ...backendResponse.user
                    });

                    setRole(backendResponse.user.role);

                } catch (error) {

                    console.error(
                        "Authentication Restore Error:",
                        error.message
                    );

                    // Restore Backend Session if Cookie Expired
                    try {

                        const backendResponse = await loginUser(currentUser);

                        setUser({
                            ...currentUser,
                            ...backendResponse.user
                        });

                        setRole(backendResponse.user.role);

                    } catch (loginError) {

                        console.error(
                            "Backend Session Restore Failed:",
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

    const authInfo = {
        user,
        role,
        loading,
        signup,
        login,
        logout
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
