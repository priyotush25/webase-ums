import { useEffect, useState } from "react";

import { getOverview } from "../api/publicApi";
import HomeAudiences from "../components/home/HomeAudiences";
import HomeCTA from "../components/home/HomeCTA";
import HomeDepartments from "../components/home/HomeDepartments";
import HomeHero from "../components/home/HomeHero";
import HomeStats from "../components/home/HomeStats";

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
            <HomeHero overview={overview} loading={loading} />
            <HomeStats stats={overview?.stats} />
            <HomeAudiences />
            <HomeDepartments departments={overview?.departments} />
            <HomeCTA />
        </>
    );
};

export default Home;
