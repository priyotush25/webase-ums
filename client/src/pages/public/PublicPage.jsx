import { Link } from "react-router";

export const PageBanner = ({ title, text, crumbs = [] }) => (
    <section className="bg-blue-950 px-4 py-14 text-white">
        <div className="mx-auto max-w-7xl">
            {crumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-3 text-sm text-blue-200">
                    <Link to="/" className="hover:text-white">Home</Link>
                    {crumbs.map(([label, to]) => (
                        <span key={label}>
                            {" / "}
                            {to ? <Link to={to} className="hover:text-white">{label}</Link> : <span className="text-white">{label}</span>}
                        </span>
                    ))}
                </nav>
            )}
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            {text && <p className="mt-3 max-w-2xl text-blue-100">{text}</p>}
        </div>
    </section>
);

export const Section = ({ children, className = "" }) => (
    <section className={`mx-auto max-w-7xl px-4 py-14 ${className}`}>{children}</section>
);
