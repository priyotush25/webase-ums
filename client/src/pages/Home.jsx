
import AboutUniversity from "../components/home/AboutUniversity";
import AdmissionCTA from "../components/home/AdmissionCTA";
import CampusFacilities from "../components/home/CampusFacilities";
import Faculty from "../components/home/Faculty";
import Hero from "../components/home/Hero";
import LatestNews from "../components/home/LatestNews";
import Programs from "../components/home/Programs";
import Testimonials from "../components/home/Testimonials";
import UniversityStats from "../components/home/UniversityStats";

const Home = () => {
    return (
        <>
            <Hero />
            <UniversityStats />
            <Programs />
            <AboutUniversity />
            <CampusFacilities />
            <LatestNews />
            <Faculty />
            <Testimonials />
            <AdmissionCTA />
        </>
    );
};

export default Home;
