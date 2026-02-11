import EmptyNavbar from "../components/EmptyNavbar";
import Footer from "../components/Footer";



const AboutUs = () => {
    return (
        <div className="bg-[#F4F7FD]">
            <EmptyNavbar />
            <div className="max-w-6xl mx-auto px-6 py-20">

                <section className="mb-20">
                    <h1 className="text-5xl font-bold mb-6">
                        About <span className="">Converge</span>
                    </h1>
                    <p className="text-xl max-w-3xl">
                        Converge is a virtual office metaverse that brings presence,
                        proximity, and real interaction back to remote work.
                    </p>
                </section>

                <section className="mb-16 border-t border-gray-300 pt-12">
                    <h2 className="text-3xl font-semibold mb-4">Why Converge?</h2>
                    <p className="leading-relaxed">
                        Remote work changed where we work—but broke how we connect.
                        Converge was built to restore spontaneous conversations,
                        natural collaboration, and shared presence through a
                        walkable digital workspace.
                    </p>
                </section>


                <section className="mb-16 grid md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-2xl font-semibold mb-3">Avatars & Movement</h3>
                        <p className="">
                            Every user is represented by an avatar that can move freely
                            within the space—enter rooms, join groups, or leave simply
                            by walking away.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-3">
                            Selective Media Sharing
                        </h3>
                        <p className="">
                            Audio and video activate only inside private areas.
                            This ensures focused discussions, reduced noise, and
                            privacy-first collaboration.
                        </p>
                    </div>
                </section>

                <section className="mb-16">
                    <h3 className="text-2xl font-semibold mb-3">Private Areas</h3>
                    <p className="">
                        Users can create private rooms using intuitive snipping tools.
                        Each private area enables proximity-based media and is
                        clearly defined within the space.
                    </p>
                </section>

                <section className="mb-16">
                    <h3 className="text-2xl font-semibold mb-3">
                        Customizable Workspaces
                    </h3>
                    <p className="">
                        Build offices using pre-designed static and interactive
                        elements curated by Converge admins—ensuring performance,
                        consistency, and flexibility.
                    </p>
                </section>

                <section className="mb-16 border-t border-gray-300 pt-12">
                    <h3 className="text-2xl font-semibold mb-3">How Converge Feels</h3>
                    <p className="">
                        Converge is not about scheduling meetings—it’s about creating presence.
                        Conversations start naturally, collaboration happens organically, and
                        teams feel connected without being forced into constant calls.
                    </p>
                    <p className="mt-4">
                        Whether it’s a quick sync, a focused discussion, or casual interaction,
                        Converge adapts to how people actually work together.
                    </p>
                </section>

                <section className="mb-16 border-t border-gray-300 pt-12">
                    <h3 className="text-2xl font-semibold mb-3">Who Converge Is For</h3>
                    <ul className="list-disc ml-5 space-y-2">
                        <li>Remote-first teams seeking better collaboration</li>
                        <li>Hybrid organizations bridging physical and virtual offices</li>
                        <li>Startups that value culture and spontaneity</li>
                        <li>Communities, events, and co-working groups</li>
                    </ul>
                </section>

                <section className="mb-16 grid md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-2xl font-semibold mb-3">Users</h3>
                        <ul className=" list-disc ml-5 space-y-2">
                            <li>Choose avatars</li>
                            <li>Move and interact freely</li>
                            <li>Create private areas</li>
                            <li>Collaborate naturally</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-2xl font-semibold mb-3">Admins</h3>
                        <ul className=" list-disc ml-5 space-y-2">
                            <li>Design maps</li>
                            <li>Add avatars and elements</li>
                            <li>Support organizations</li>
                            <li>Maintain ecosystem quality</li>
                        </ul>
                    </div>
                </section>

                <section className="border-t border-gray-300 pt-12">
                    <h2 className="text-3xl font-semibold mb-4">Our Vision</h2>
                    <p className=" max-w-3xl">
                        We believe the future of work is spatial, human, and interactive.
                        Converge exists to make remote collaboration feel real again.
                    </p>
                </section>

                <section id="terms" className="border-t border-gray-300 pt-16 mt-20">
                    <h2 className="text-3xl font-semibold mb-6">Terms & Conditions</h2>

                    <div className="space-y-6 leading-relaxed text-sm">
                        <p>
                            Converge is designed to provide a collaborative virtual environment
                            for teams and communities. By using the platform, users agree to use
                            Converge responsibly and in accordance with applicable laws.
                        </p>

                        <p>
                            Users are responsible for the content they share, create, or upload
                            within Converge spaces, including avatars, media, and private areas.
                            Converge does not claim ownership of user-generated content.
                        </p>

                        <p>
                            Audio and video interactions are proximity-based and activated only
                            within private areas. Users are expected to respect privacy and
                            consent when interacting with others.
                        </p>

                        <p>
                            Admin accounts are provided with additional capabilities to manage
                            spaces, elements, and assets. These privileges must be used fairly
                            and responsibly.
                        </p>

                        <p>
                            Converge reserves the right to update features, improve performance,
                            or modify services to enhance user experience, while maintaining
                            data security and platform integrity.
                        </p>

                        <p>
                            By continuing to use Converge, users acknowledge these terms and
                            agree to engage in a respectful and collaborative manner.
                        </p>
                    </div>
                </section>


            </div>
            <Footer />
        </div>
    );
};

export default AboutUs;
