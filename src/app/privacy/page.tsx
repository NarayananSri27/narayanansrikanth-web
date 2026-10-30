export const metadata = {
  title: "Privacy Policy - Narayanan Srikanth",
};

const h2Style = { fontWeight: 300, fontSize: "24px", marginTop: "34px", marginBottom: "12px" };
const pStyle = { marginBottom: "16px" };

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "0 20px 40px" }}>
      <h1 style={{ textAlign: "center", fontWeight: 100, marginTop: "30px", marginBottom: "30px" }}>
        Privacy Policy
      </h1>
      <p style={pStyle}>Last updated: October 28, 2026</p>
      <p style={pStyle}>
        This is the personal website of Narayanan Srikanth, at narayanansrikanth-web.vercel.app. This page explains what information is collected when you sign in and how it is used.
      </p>

      <h2 style={h2Style}>What is collected</h2>
      <p style={pStyle}>
        When you sign in with Google, I receive your name, email address, and profile picture from your Google account. I never receive your Google password. If you choose to add an Instagram username, I store that as well. I also record which pages of this site are visited and when, along with the country, device type, and browser of the visitor and the website they came from. This applies to signed-in members and to visitors who are not signed in. A random ID stored in your browser is used instead of your name or IP address.
      </p>

      <h2 style={h2Style}>How it is used</h2>
      <p style={pStyle}>
        This information is used only to let you access the members-only pages of this site (pics and research), to know who is visiting, and to keep the site running. It is not sold, rented, or shared with advertisers.
      </p>

      <h2 style={h2Style}>Who can see it</h2>
      <p style={pStyle}>
        Only the site owner can view the list of members and the visit activity. Other members cannot see your information.
      </p>

      <h2 style={h2Style}>Services that process your data</h2>
      <p style={pStyle}>
        Sign-in is provided by Google. Member information is stored with Supabase, and the site is hosted by Vercel. These services process data on my behalf under their own privacy policies.
      </p>

      <h2 style={h2Style}>Deleting your data</h2>
      <p style={pStyle}>
        You can ask for your account and all of its stored information to be deleted at any time by emailing{" "}
        <a href="mailto:narayanansri2007@gmail.com">narayanansri2007@gmail.com</a>.
      </p>

      <h2 style={h2Style}>Changes</h2>
      <p style={pStyle}>
        If this policy changes, the updated version will be posted on this page with a new date.
      </p>
    </div>
  );
}

