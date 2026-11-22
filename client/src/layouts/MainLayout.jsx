
import { Outlet } from "react-router";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white">

            {/* Website Navbar */}
            <Navbar />

            {/* Dynamic Page Content */}
            <main className="flex-1">
                <Outlet />
            </main>

            {/* Website Footer */}
            <Footer />

        </div>
    );
};

export default MainLayout;
