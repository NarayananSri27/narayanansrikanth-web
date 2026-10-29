"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";

export function ActivityTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track signed-in members, once per page
    if (!user || pathname === lastTrackedPath.current) return;
    const supabase = createClient();
    if (!supabase) return;

    const path = pathname;
    // Short delay so the member row exists before the first visit is logged
    const timer = setTimeout(async () => {
      lastTrackedPath.current = path;
      await supabase.from("visitor_activity").insert({
        user_id: user.id,
        page_path: path,
        event_type: "page_visit",
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [pathname, user]);

  return null;
}
