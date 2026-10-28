import { siteContent } from "@/data/content";

export const metadata = {
  title: "Links — Narayanan Srikanth",
};

export default function LinksPage() {
  const { links } = siteContent;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "0 20px" }}>
      <h1
        style={{
          textAlign: "center",
          fontWeight: 100,
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        Links
      </h1>
      <p className="subtitle">these will take you elsewhere in the interwebs</p>

      {links.map((link, idx) => (
        <div key={idx} className="link">
          <a
            target={link.url.startsWith("http") ? "_blank" : undefined}
            rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
            href={link.url}
          >
            {link.title.toLowerCase()}
          </a>
        </div>
      ))}
    </div>
  );
}
