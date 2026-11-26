// Original, generic campus illustration (no real building depicted).
const CampusIllustration = ({ className = "" }) => (
    <svg viewBox="0 0 640 420" className={className} role="img" aria-label="Illustration of a university campus with a main hall and trees">
        <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#dbe7f6" />
                <stop offset="1" stopColor="#f6f8fb" />
            </linearGradient>
        </defs>

        <rect width="640" height="420" fill="url(#sky)" />
        <circle cx="520" cy="80" r="34" fill="#f7edd3" />

        {/* ground */}
        <rect y="330" width="640" height="90" fill="#cfd9c8" />
        <path d="M250 420 L290 330 H350 L390 420Z" fill="#e9e4d6" />

        {/* main hall */}
        <rect x="140" y="190" width="360" height="140" fill="#f4efe3" stroke="#102a50" strokeWidth="3" />
        <rect x="120" y="170" width="400" height="26" fill="#102a50" />
        <path d="M290 170 L320 110 L350 170Z" fill="#f4efe3" stroke="#102a50" strokeWidth="3" />
        <circle cx="320" cy="148" r="9" fill="#c8962e" />

        {/* columns */}
        {[170, 215, 260, 360, 405, 450].map((x) => (
            <rect key={x} x={x} y="196" width="14" height="134" fill="#fff" stroke="#102a50" strokeWidth="2" />
        ))}

        {/* door and windows */}
        <rect x="298" y="262" width="44" height="68" rx="3" fill="#183560" />
        <rect x="298" y="262" width="44" height="68" rx="3" fill="none" stroke="#c8962e" strokeWidth="2" />
        {[196, 420].map((x) => (
            <g key={x}>
                <rect x={x} y="222" width="26" height="34" fill="#bcd0ea" stroke="#102a50" strokeWidth="2" />
                <rect x={x} y="272" width="26" height="34" fill="#bcd0ea" stroke="#102a50" strokeWidth="2" />
            </g>
        ))}

        {/* flag */}
        <line x1="320" y1="110" x2="320" y2="70" stroke="#102a50" strokeWidth="3" />
        <path d="M320 70 L350 80 L320 90Z" fill="#c8962e" />

        {/* steps */}
        <rect x="280" y="326" width="80" height="6" fill="#e9e4d6" stroke="#102a50" strokeWidth="1.5" />

        {/* trees */}
        {[70, 560, 40, 600].map((x, i) => (
            <g key={x}>
                <rect x={x - 4} y={i < 2 ? 292 : 306} width="8" height={i < 2 ? 40 : 28} fill="#6b5339" />
                <circle cx={x} cy={i < 2 ? 276 : 296} r={i < 2 ? 34 : 24} fill={i < 2 ? "#5d8a68" : "#7aa383"} />
            </g>
        ))}
    </svg>
);

export default CampusIllustration;
