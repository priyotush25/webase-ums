import { GraduationCap } from "lucide-react";
import { Link } from "react-router";

import siteConfig from "../../config/site";

const Logo = ({ light = false, to = "/", compact = false }) => (
    <Link to={to} className="inline-flex items-center gap-3" aria-label={`${siteConfig.name} home`}>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-900 text-gold-400 ring-1 ring-gold-500/60">
            <GraduationCap size={24} />
        </span>
        {compact ? (
            <span className={`font-display text-xl font-bold ${light ? "text-white" : "text-blue-900"}`}>{siteConfig.shortName}</span>
        ) : (
            <span className="leading-tight">
                <span className={`block font-display text-lg font-bold ${light ? "text-white" : "text-blue-900"}`}>{siteConfig.name}</span>
                <span className={`block text-xs ${light ? "text-blue-200" : "text-slate-500"}`}>Established {siteConfig.established}</span>
            </span>
        )}
    </Link>
);

export default Logo;
