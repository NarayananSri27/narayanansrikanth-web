"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { AtSign, X } from "lucide-react";

export function InstagramModal() {
  const { user, profile, updateInstagram } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Show only if authenticated and neither saved nor previously dismissed
    if (
      user &&
      profile &&
      !profile.instagram_popup_dismissed &&
      !profile.instagram_username
    ) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Clean and normalize username (strip leading @ and spaces)
    const cleaned = username.replace(/^@+/, "").trim();
    await updateInstagram(cleaned.length > 0 ? cleaned : null, true);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await updateInstagram(null, true);
    setIsSubmitting(false);
    setIsOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="instagram-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xl">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-4">
          <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mb-1">
            A little introduction
          </p>
          <h2
            id="instagram-modal-title"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            What&apos;s your Instagram?
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            It&apos;s completely optional — it just helps me put a face to the name when friends or McGill peers visit.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <AtSign className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              maxLength={30}
              autoFocus
              className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-100"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
