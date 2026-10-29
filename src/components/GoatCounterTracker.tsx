"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    goatcounter?: { count?: (vars?: { path?: string }) => void };
  }
}

// GoatCounter counts the first page load by itself.
// This counts every later page change inside the site (no full reload).
export function GoatCounterTracker() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    window.goatcounter?.count?.({ path: pathname });
  }, [pathname]);

  return null;
}
