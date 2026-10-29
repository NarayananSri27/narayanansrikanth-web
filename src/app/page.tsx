import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-content">
      <div className="image-container">
        <div className="image-wrapper">
          <img
            src="/img/Narayanan_F1.jpeg"
            alt="Narayanan Srikanth"
            style={{ height: "700px", display: "block" }}
          />
        </div>
      </div>
      <div className="text-container">
        <h1>hey there</h1>

        <p>
          I&apos;m Narayanan, an engineering student at McGill University.
        </p>
        <p>
          I like building things; software systems, quantitative finance tools, risk analysis models, and aerospace/defence simulations.
        </p>
        <p>
          Outside of engineering, I&apos;m a retired Warrant Officer from the Royal Canadian Air Cadets who still flies. I enjoy films, music, cooking, and travelling.
        </p>
        <p>
          Check out my pics for cool people, places, cultures, and random moments or snoop around my private research notebook.
        </p>
        <p>
          Currently working on a Commodity Portfolio Risk Analyser &amp; an Aircraft Stress Tracker.
        </p>
        <p>
          If you wanna have a chat, <Link href="/contact">contact me</Link>.
        </p>
      </div>
    </div>
  );
}



