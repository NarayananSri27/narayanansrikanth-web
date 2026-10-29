import { siteContent } from "@/data/content";

export const metadata = {
  title: "Contact — Narayanan Srikanth",
};

export default function ContactPage() {
  const { contact } = siteContent;

  // Format email as name [dot] surname [at] domain [dot] com
  const parts = contact.email.split("@");
  const localPart = parts[0].replace(/\./g, " [dot] ");
  const domainPart = (parts[1] || "example.com").replace(/\./g, " [dot] ");
  const formattedEmail = `${localPart} [at] ${domainPart}`;

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
        Contact
      </h1>
      <br />

      <div className="contact">
        <p>
          <a href="mailto:narayanansri2007@gmail.com">narayanansri2007@gmail.com</a>
        </p>
        <p style={{ fontSize: "15px", opacity: 0.65, marginTop: "20px" }}>
          {contact.note}
        </p>
      </div>
    </div>
  );
}

