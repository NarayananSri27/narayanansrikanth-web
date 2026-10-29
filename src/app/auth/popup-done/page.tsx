"use client";

import { useEffect } from "react";

// This page loads inside the Google sign-in popup once sign-in has finished.
// It tells the main window, then closes itself.
export default function PopupDonePage() {
  useEffect(() => {
    const msg = { type: "sb-auth-complete" };
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("ns-auth");
        channel.postMessage(msg);
        channel.close();
      }
    } catch {
      // ignore
    }
    if (window.opener) {
      window.opener.postMessage(msg, window.location.origin);
      window.close();
    } else {
      // Not a popup (for example, popups were blocked): just go to the homepage
      window.setTimeout(() => {
        window.close();
        window.location.replace("/");
      }, 800);
    }
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <p style={{ fontWeight: 100, fontSize: "20px" }}>signing you in...</p>
      <p className="subtitle">you can close this window</p>
    </div>
  );
}
