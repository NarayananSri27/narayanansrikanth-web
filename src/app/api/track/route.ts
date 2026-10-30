import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface TrackBody {
  path?: unknown;
  referrer?: unknown;
  entry?: unknown;
  visitorId?: unknown;
}

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor|uptime|curl|wget/i;

function parseDevice(ua: string) {
  let device = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) device = "tablet";
  else if (/mobi|iphone|ipod|android.*mobile/i.test(ua)) device = "mobile";

  let os = "Other";
  if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/cros/i.test(ua)) os = "ChromeOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/edg\//i.test(ua) || /edga\//i.test(ua) || /edgios\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";

  return { device, os, browser };
}

function refHost(raw: unknown, ownHost: string | null) {
  if (typeof raw !== "string" || !raw) return "direct";
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    const own = (ownHost || "").split(":")[0].replace(/^www\./, "");
    if (!host || host === own) return "direct";
    return host.slice(0, 100);
  } catch {
    return "direct";
  }
}

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const ua = request.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : "/";
  const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 64) : "";
  if (!visitorId) return new NextResponse(null, { status: 400 });

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // read-only here
        },
      },
    }
  );

  // Never record the site owner
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerEmail = (
    process.env.NEXT_PUBLIC_OWNER_EMAIL || "narayanansri2007@gmail.com"
  ).toLowerCase();
  if (user?.email && user.email.toLowerCase() === ownerEmail) {
    return new NextResponse(null, { status: 204 });
  }

  const isEntry = body.entry === true;
  const { device, os, browser } = parseDevice(ua);
  const country = request.headers.get("x-vercel-ip-country");
  let city = request.headers.get("x-vercel-ip-city");
  if (city) {
    try {
      city = decodeURIComponent(city);
    } catch {
      // keep as-is
    }
  }

  await supabase.from("site_visits").insert({
    visitor_id: visitorId,
    user_id: user?.id ?? null,
    page_path: path,
    referrer: isEntry ? refHost(body.referrer, request.headers.get("host")) : null,
    is_entry: isEntry,
    country: country ? country.slice(0, 8) : null,
    city: city ? city.slice(0, 100) : null,
    device,
    os,
    browser,
  });

  return new NextResponse(null, { status: 204 });
}
