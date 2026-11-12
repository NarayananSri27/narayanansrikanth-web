"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { geoDistance, geoOrthographic, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { useTheme } from "next-themes";
import worldData from "world-atlas/countries-110m.json";
import { createClient } from "@/lib/supabase/client";

type Spot = { lat: number; lon: number; label: string; visitors: number };

const world = worldData as unknown as Topology<{
  land: GeometryCollection;
  countries: GeometryCollection;
}>;
const LAND = feature(world, world.objects.land);
const BORDERS = mesh(world, world.objects.countries, (a, b) => a !== b);

// Matches the site's light (cream/brown) and dark (navy/teal) themes
const PALETTE = {
  light: { ocean: "#efece4", edge: "#ddd6c8", land: "#ddd3c0", dot: "#8a5a1c" },
  dark: { ocean: "#16222a", edge: "#26353f", land: "#24343e", dot: "#4fb0c6" },
};

const HEIGHT = 380;

function countryName(code: string | null) {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function Globe({ spots }: { spots: Spot[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const themeRef = useRef(resolvedTheme);
  themeRef.current = resolvedTheme;
  const spotsRef = useRef(spots);
  spotsRef.current = spots;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const tip = tipRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const proj = geoOrthographic().clipAngle(90);
    const path = geoPath(proj, ctx);

    let width = 0;
    let radius = 0;
    let rot: [number, number] = [-20, -20];
    let spinning = !reduceMotion;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    let drag: { x: number; y: number } | null = null;
    let mouse: { x: number; y: number } | null = null;
    let hovered: Spot | null = null;
    let frame = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = wrap.clientWidth;
      canvas.width = width * dpr;
      canvas.height = HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = Math.min(width, HEIGHT) / 2 - 20;
      proj.scale(radius).translate([width / 2, HEIGHT / 2]);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const draw = (now: number) => {
      const c = themeRef.current === "dark" ? PALETTE.dark : PALETTE.light;
      const list = spotsRef.current;
      const max = Math.max(1, ...list.map((s) => s.visitors));
      const t = (now - start) / 1000;

      if (spinning && !drag) rot = [rot[0] + 0.15, rot[1]];
      proj.rotate(rot);
      const center: [number, number] = [-rot[0], -rot[1]];

      ctx.clearRect(0, 0, width, HEIGHT);
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = c.ocean;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = c.edge;
      ctx.stroke();

      ctx.beginPath();
      path(LAND);
      ctx.fillStyle = c.land;
      ctx.fill();
      ctx.beginPath();
      path(BORDERS);
      ctx.strokeStyle = c.ocean;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      let nearest: Spot | null = null;
      let nearestDist = 14;
      for (const s of list) {
        if (geoDistance([s.lon, s.lat], center) >= Math.PI / 2) continue;
        const xy = proj([s.lon, s.lat]);
        if (!xy) continue;
        const [x, y] = xy;
        const size = 2.5 + 6 * Math.sqrt(s.visitors / max);
        const isHover = hovered === s;

        // two staggered rings per city, bigger cities send bigger rings
        for (let i = 0; i < 2; i++) {
          const phase = reduceMotion ? 0.5 + i * 0.25 : (t * 0.6 + i * 0.5 + s.lat * 0.01) % 1;
          ctx.beginPath();
          ctx.arc(x, y, size + phase * size * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = c.dot;
          ctx.globalAlpha = (1 - phase) * 0.7;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, isHover ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = c.dot;
        ctx.fill();

        if (mouse && !drag) {
          const d = Math.hypot(x - mouse.x, y - mouse.y);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = s;
          }
        }
      }

      if (nearest !== hovered) {
        hovered = nearest;
        if (hovered) {
          tip.textContent = `${hovered.label} · ${hovered.visitors} visitor${hovered.visitors === 1 ? "" : "s"}`;
          tip.style.display = "block";
        } else {
          tip.style.display = "none";
        }
      }
      if (hovered && mouse) {
        tip.style.left = `${Math.min(mouse.x + 12, width - tip.offsetWidth - 4)}px`;
        tip.style.top = `${mouse.y + 12}px`;
      }
      canvas.style.cursor = drag ? "grabbing" : hovered ? "pointer" : "grab";

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onDown = (e: PointerEvent) => {
      drag = local(e);
      canvas.setPointerCapture(e.pointerId);
      clearTimeout(resumeTimer);
      spinning = false;
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      mouse = p;
      if (!drag) return;
      const k = 70 / radius;
      rot = [rot[0] + (p.x - drag.x) * k, Math.max(-70, Math.min(70, rot[1] - (p.y - drag.y) * k))];
      drag = p;
    };
    const onUp = () => {
      drag = null;
      if (!reduceMotion) resumeTimer = setTimeout(() => (spinning = true), 2500);
    };
    const onLeave = () => {
      mouse = null;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(resumeTimer);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative", width: "100%" }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Globe of visitor locations: ${spots
          .slice(0, 10)
          .map((s) => `${s.label} (${s.visitors})`)
          .join(", ")}`}
        style={{ display: "block", width: "100%", height: `${HEIGHT}px`, touchAction: "pan-y" }}
      />
      <div
        ref={tipRef}
        style={{
          position: "absolute",
          display: "none",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          fontSize: "13px",
          fontWeight: 300,
          padding: "4px 10px",
          borderRadius: "6px",
          border: "0.5px solid var(--hr-color)",
          background: "var(--bg-color)",
          color: "var(--text-color)",
        }}
      />
    </div>
  );
}

/** Loads located visits since `since` (ISO date, or null for all time) and shows them on the globe. */
export default function VisitorGlobe({ since, reloadKey }: { since: string | null; reloadKey: number }) {
  const [rows, setRows] = useState<
    { visitor_id: string; city: string | null; country: string | null; latitude: number; longitude: number }[]
  >([]);
  const [status, setStatus] = useState<"loading" | "ready" | "setup" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      if (!supabase) {
        setStatus("error");
        return;
      }
      setStatus("loading");
      let q = supabase
        .from("site_visits")
        .select("visitor_id, city, country, latitude, longitude")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .limit(10000);
      if (since) q = q.gte("visited_at", since);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        setStatus(/latitude|longitude/i.test(error.message) ? "setup" : "error");
        return;
      }
      setRows(data || []);
      setStatus("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, [since, reloadKey]);

  const spots = useMemo<Spot[]>(() => {
    const map = new Map<string, { lat: number; lon: number; label: string; ids: Set<string> }>();
    rows.forEach((r) => {
      const key = `${r.latitude},${r.longitude}`;
      let s = map.get(key);
      if (!s) {
        const label = r.city ? `${r.city}, ${countryName(r.country)}` : countryName(r.country);
        s = { lat: r.latitude, lon: r.longitude, label, ids: new Set() };
        map.set(key, s);
      }
      s.ids.add(r.visitor_id);
    });
    return Array.from(map.values())
      .map((s) => ({ lat: s.lat, lon: s.lon, label: s.label, visitors: s.ids.size }))
      .sort((a, b) => b.visitors - a.visitors);
  }, [rows]);

  const note = { fontSize: "13px", fontWeight: 200, opacity: 0.6, textAlign: "center" as const, margin: "10px 0 0" };

  if (status === "setup") {
    return (
      <p style={note}>
        the map needs two new database columns — run <code>supabase/add_visit_location.sql</code> in the Supabase SQL
        editor once.
      </p>
    );
  }
  if (status === "error") return <p style={note}>couldn&apos;t load the map right now.</p>;

  return (
    <div>
      <Globe spots={spots} />
      <p style={note}>
        {status === "loading"
          ? "loading map..."
          : spots.length === 0
            ? "no located visits yet — new visits will appear here."
            : `${spots.length} place${spots.length === 1 ? "" : "s"} · drag to spin · hover a dot for details · visits from before the map was added aren't shown`}
      </p>
    </div>
  );
}
