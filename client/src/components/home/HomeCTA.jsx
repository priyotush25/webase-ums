import { Link } from "react-router";

const HomeCTA = () => (
    <section className="bg-blue-900">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
            <div>
                <h2 className="text-3xl font-bold text-white">Ready to start?</h2>
                <p className="mt-2 text-blue-100">Create your account in two minutes. You can enroll in courses right after.</p>
            </div>

            <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-lg bg-gold-500 px-6 py-3 font-semibold text-blue-950 hover:bg-gold-400">Apply for admission</Link>
                <Link to="/contact" className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">Talk to us</Link>
            </div>
        </div>
    </section>
);

export default HomeCTA;
