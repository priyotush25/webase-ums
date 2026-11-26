const MESSAGES = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-login-credentials": "Incorrect email or password.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Contact the administration.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled for this project.",
    "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
    "auth/weak-password": "Please choose a stronger password.",
    "auth/missing-password": "Please enter your password.",
    "auth/popup-closed-by-user": "The sign-in window was closed.",
};

// Turns Firebase/backend errors into a message that is safe to show to users
export const getAuthErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
    if (error?.code && MESSAGES[error.code]) return MESSAGES[error.code];

    // Raw Firebase messages look like "Firebase: Error (auth/...)"
    if (error?.message && !error.message.startsWith("Firebase:")) return error.message;

    return fallback;
};
