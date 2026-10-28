import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="home-content">
      <div className="image-container">
        <div className="image-wrapper">
          <img
            src="/img/main.webp"
            alt="Narayanan Srikanth"
            style={{ height: "700px", display: "block" }}
          />
        </div>
      </div>
      <div className="text-container">
        <h1>hey there</h1>
        <p>
          I&apos;m Narayanan, an engineering student at{" "}
          <a
            href="https://www.mcgill.ca/engineering/"
            target="_blank"
            rel="noopener noreferrer"
          >
            McGill University
          </a>
          .
        </p>
        <p>
          I like building things: software systems, quantitative finance tools, risk models, and aerospace simulations.
        </p>
        <p>
          Outside of engineering, I spend my time watching cinema, analyzing music, writing, and practicing photography.
        </p>
        <p>
          You can explore my <Link href="/photos">pics</Link> (film scans &amp; campus moments) or check out my private{" "}
          <Link href="/research">research notebook</Link>.
        </p>
        <p>
          Selected ongoing projects include an{" "}
          <a
            href="https://github.com/placeholder-narayanan/telemetry-sim"
            target="_blank"
            rel="noopener noreferrer"
          >
            embedded guidance simulator
          </a>
          , a{" "}
          <a
            href="https://github.com/placeholder-narayanan/risk-research"
            target="_blank"
            rel="noopener noreferrer"
          >
            quantitative risk research notebook
          </a>
          , and an{" "}
          <a
            href="https://github.com/placeholder-narayanan/audio-enhancer"
            target="_blank"
            rel="noopener noreferrer"
          >
            audio signal analysis tool
          </a>
          .
        </p>
        <p>
          If you wanna have a chat, <Link href="/contact">contact me.</Link>
        </p>
      </div>
    </div>
  );
}
