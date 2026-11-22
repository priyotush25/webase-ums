
import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

import { auth } from "../firebase/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Signup
    const signup = async (name, email, password) => {

        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await updateProfile(result.user, {
            displayName: name
        });

        return result.user;
    };

    // Login
    const login = async (email, password) => {

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        return result.user;
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
    };

    // Authentication State
    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();

    }, []);

    const authInfo = {
        user,
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

// Custom Hook
export const useAuth = () => {

    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};

export default AuthContext;
