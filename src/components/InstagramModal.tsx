"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { AtSign, X } from "lucide-react";

export function InstagramModal() {
  const { user, profile, updateInstagram } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only on the pics page, for signed-in members who have not answered yet
    if (
      pathname === "/photos" &&
      user &&
      profile &&
      !profile.instagram_popup_dismissed &&
      !profile.instagram_username
    ) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pathname, user, profile]);

  const handleSkip = async () => {
    setIsSubmitting(true);
    await updateInstagram(null, true);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Clean the username (strip leading @ and spaces)
    const cleaned = username.replace(/^@+/, "").trim();
    await updateInstagram(cleaned.length > 0 ? cleaned : null, true);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div className="auth-backdrop" style={{ zIndex: 150 }}>
      <div className="auth-card" role="dialog" aria-modal="true" aria-label="Instagram">
        <button className="auth-close" onClick={handleSkip} aria-label="Close">
          <X className="w-4 h-4" />
        </button>

        <h2>What&apos;s your Instagram?</h2>

        <form onSubmit={handleSave} style={{ marginTop: "22px" }}>
          <div style={{ position: "relative" }}>
            <AtSign
              className="w-4 h-4"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.5,
              }}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={30}
              autoFocus
              style={{
                width: "100%",
                padding: "11px 12px 11px 36px",
                fontSize: "15px",
                fontFamily: "inherit",
                color: "inherit",
                background: "transparent",
                border: "0.5px solid var(--hr-color)",
                borderRadius: "10px",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginTop: "20px" }}>
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                opacity: 0.6,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: "transparent",
                color: "inherit",
                border: "0.5px solid currentColor",
                borderRadius: "999px",
                padding: "6px 22px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {isSubmitting ? "saving..." : "save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
