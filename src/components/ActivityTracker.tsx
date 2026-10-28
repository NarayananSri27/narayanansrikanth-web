"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function ActivityTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track authenticated members and avoid duplicate calls for the same route
    if (!user || pathname === lastTrackedPath.current) {
      return;
    }

    lastTrackedPath.current = pathname;

    // Send visit log asynchronously
    fetch("/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: pathname,
        userId: user.id,
      }),
    }).catch((err) => {
      // Quietly handle network or offline errors
      console.debug("Activity log skipped (dev/offline):", err);
    });
  }, [pathname, user]);

  return null;
}
