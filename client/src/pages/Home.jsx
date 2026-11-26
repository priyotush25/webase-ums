import { useEffect, useState } from "react";

import { getOverview } from "../api/publicApi";
import HomeAbout from "../components/home/HomeAbout";
import HomeCampusLife from "../components/home/HomeCampusLife";
import HomeDepartments from "../components/home/HomeDepartments";
import HomeFaculty from "../components/home/HomeFaculty";
import HomeHero from "../components/home/HomeHero";
import HomeProcess from "../components/home/HomeProcess";
import HomeQuickLinks from "../components/home/HomeQuickLinks";
import HomeUpdates from "../components/home/HomeUpdates";

const Home = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getOverview()
            .then(setOverview)
            .catch(() => setOverview(null))
            .finally(() => setLoading(false));
    }, []);

    return (
        <>
            <HomeHero />
            <HomeQuickLinks />
            <HomeUpdates notices={overview?.notices} loading={loading} />
            <HomeAbout stats={overview?.stats} />
            <HomeDepartments departments={overview?.departments} />
            <HomeProcess />
            <HomeFaculty faculty={overview?.faculty} />
            <HomeCampusLife />
        </>
    );
};

export default Home;
