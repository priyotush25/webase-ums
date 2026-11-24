import { GraduationCap } from "lucide-react";
import { Link } from "react-router";

const Logo = ({ light = false, to = "/" }) => (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="UMS home">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-900 text-gold-400 ring-1 ring-gold-500/60">
            <GraduationCap size={20} />
        </span>
        <span className={`font-display text-xl font-bold ${light ? "text-white" : "text-blue-900"}`}>UMS</span>
    </Link>
);

export default Logo;
