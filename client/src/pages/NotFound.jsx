import { Link } from "react-router";

const NotFound = () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <p className="text-6xl font-extrabold text-blue-900">404</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="mt-6 rounded-lg bg-blue-900 px-6 py-3 font-semibold text-white hover:bg-blue-800">
            Back to Home
        </Link>
    </div>
);

export default NotFound;
