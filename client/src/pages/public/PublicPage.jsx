export const PageBanner = ({ eyebrow, title, text }) => (
    <section className="bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 px-4 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
            {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">{eyebrow}</p>
            )}
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{title}</h1>
            {text && <p className="mx-auto mt-4 max-w-2xl text-blue-100">{text}</p>}
        </div>
    </section>
);
