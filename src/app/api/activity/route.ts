import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { path, userId } = body;

    if (!userId || !path) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const supabase = createClient();
    if (supabase) {
      // Record visit to Supabase visitor_activity table
      await supabase.from("visitor_activity").insert({
        user_id: userId,
        page_path: path,
        event_type: "page_visit",
        visited_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to record activity" },
      { status: 500 }
    );
  }
}
