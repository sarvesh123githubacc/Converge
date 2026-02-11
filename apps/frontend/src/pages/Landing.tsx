import Navbar from "../components/Navbar"
import landingImage from "../assets//landing3.png"
import { Link } from "react-router-dom"
import Footer from "../components/Footer"
import avatarsDemo from "../assets/avatarsDemo.png"

const Landing = () => {
    return (
        <div className="bg-[#F5F6FD]">
            <Navbar />

            <section className="bg-gradient-to-b from-[#3E74E7] to-[#2B5EDC] py-24">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

                    <div>
                        <h1 className="text-[#FED767] font-extrabold text-7xl leading-tight">
                            Presence,
                        </h1>
                        <h1 className="text-white font-extrabold text-6xl leading-tight">
                            reimagined online.
                        </h1>

                        <p className="text-white text-2xl mt-6 max-w-xl tracking-tight">
                            A spatial virtual office where work feels human, natural,
                            and truly interactive.
                        </p>

                        <div className="flex gap-4 mt-8">
                            <Link
                                to="/signup"
                                className="bg-[#FED767] text-[#CC6933] px-8 py-3 font-bold rounded-xl text-xl hover:scale-105 transition"
                            >
                                Start now
                            </Link>
                            <Link to={"https://youtu.be/b5Sfs6aK6Eo"}>
                            <button className="border border-white/40 text-white px-8 py-3 rounded-xl text-xl hover:bg-white/10 transition">
                                Watch Demo
                            </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <img
                            className="rounded-2xl shadow-xl"
                            src={landingImage}
                            alt="Converge workspace preview"
                        />
                        {/* Placeholder for animation / video */}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#F5F6FD]">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center text-[#0B2A2F] mb-14">
                        Built for real interaction
                    </h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            {
                                title: "Proximity-based Media",
                                desc: "Audio & video activate only when you’re inside a private area — no noise, no chaos."
                            },
                            {
                                title: "Move with Avatars",
                                desc: "Walk, gather, leave conversations naturally using spatial avatars."
                            },
                            {
                                title: "Private Areas",
                                desc: "Create focused rooms using intuitive snipping tools directly on the map."
                            }
                        ].map((f, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition"
                            >
                                <h3 className="text-2xl font-semibold mb-3 text-[#0B2A2F]">
                                    {f.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                    <div>
                        <h2 className="text-4xl font-bold text-[#0B2A2F] mb-6">
                            How Converge works
                        </h2>

                        <ul className="space-y-5 text-lg text-gray-700">
                            <li>✔ Choose your avatar</li>
                            <li>✔ Enter a shared virtual office</li>
                            <li>✔ Walk into private areas to talk</li>
                            <li>✔ Collaborate like you’re actually there</li>
                        </ul>
                    </div>

                    <div className="h-80 flex w-xl items-center justify-center text-gray-400">
                        <img src={avatarsDemo} className="rounded-2xl border-transparent h-64 shadow-2xl" alt="" />
                    </div>
                </div>
            </section>

            <section className="py-24 bg-[#F5F6FD]">
                <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                    <div className="h-80  flex items-center justify-center text-gray-400">
                        <video src={"https://res.cloudinary.com/dydssujzh/video/upload/v1770815913/create_space_evxbgv.mp4"} loop controls autoPlay muted className="rounded-2xl border-transparent shadow-2xl"></video>
                    </div>

                    <div>
                        <h2 className="text-4xl font-bold text-[#0B2A2F] mb-6">
                            Design your own space
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Build customizable offices using pre-designed elements curated
                            by Converge admins — ensuring performance, consistency, and style.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold text-[#0B2A2F] mb-6">
                        Built for teams & organizations
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Admins can design maps, manage elements, add avatars,
                        and help organizations create immersive digital offices.
                    </p>
                </div>
            </section>

            <section className="py-24 bg-gradient-to-br from-[#3E74E7] to-[#2B5EDC] text-center">
                <h2 className="text-5xl font-bold text-white mb-6">
                    Work doesn’t have to feel distant.
                </h2>
                <p className="text-xl text-white/90 mb-8">
                    Step into a workspace that feels alive.
                </p>
                <Link
                    to="/signup"
                    className="bg-[#FED767] text-[#CC6933] px-10 py-4 font-bold rounded-2xl text-xl hover:scale-105 transition inline-block"
                >
                    Get Started Free
                </Link>
            </section>

            <section className="py-24 bg-white">
                <div className="max-w-6xl mx-auto px-6">

                    <h2 className="text-4xl font-bold text-center text-[#0B2A2F] mb-14">
                        Why teams choose Converge
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12">

                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-[#0B2A2F] mb-3">
                                Feels Human
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Conversations happen naturally — you join, leave,
                                and interact just like a real office.
                            </p>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-[#0B2A2F] mb-3">
                                Designed for Focus
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                No global noise. Media is shared only inside
                                private areas when it actually matters.
                            </p>
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-[#0B2A2F] mb-3">
                                Built to Scale
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                From small teams to large organizations,
                                Converge adapts without losing performance.
                            </p>
                        </div>

                    </div>

                    {/* Optional placeholder for logos / testimonials */}
                    {/* <div className="mt-20 border-2 border-dashed border-gray-300 rounded-2xl h-40 flex items-center justify-center text-gray-400">
                        Company logos / testimonials can go here
                    </div> */}

                </div>
            </section>

            <Footer />
        </div>
    )
}

export default Landing
