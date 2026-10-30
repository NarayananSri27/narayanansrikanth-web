"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

function getVisitorId(): string {
  try {
    let id = localStorage.getItem("ns_vid");
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("ns_vid", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

export function ActivityTracker() {
  const pathname = usePathname();
  const { isOwner, isLoading } = useAuth();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    // The owner is never counted. Once you sign in on a browser, it is ignored from then on.
    try {
      if (isOwner) localStorage.setItem("ns_ignore", "1");
      if (localStorage.getItem("ns_ignore")) return;
    } catch {
      // storage unavailable
    }

    // Do not count local testing
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return;

    if (pathname === last.current) return;

    // Ignore the same page being reported again within 20 seconds (reloads, double fires)
    try {
      const prev = sessionStorage.getItem("ns_last");
      if (prev) {
        const cut = prev.lastIndexOf("|");
        const prevPath = prev.slice(0, cut);
        const prevTime = Number(prev.slice(cut + 1));
        if (prevPath === pathname && Date.now() - prevTime < 20000) {
          last.current = pathname;
          return;
        }
      }
      sessionStorage.setItem("ns_last", `${pathname}|${Date.now()}`);
    } catch {
      // storage unavailable
    }

    last.current = pathname;

    // The first page of a browsing session records where the visitor came from
    let entry = false;
    try {
      if (!sessionStorage.getItem("ns_sess")) {
        sessionStorage.setItem("ns_sess", "1");
        entry = true;
      }
    } catch {
      // storage unavailable
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: entry ? document.referrer : "",
        entry,
        visitorId: getVisitorId(),
      }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, isLoading, isOwner]);

  return null;
}
