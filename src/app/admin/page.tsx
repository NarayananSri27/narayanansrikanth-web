"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  name: string;
  email: string;
  instagram: string | null;
  createdAt: string | null;
  lastActive: string | null;
}

interface Visit {
  id: string;
  visitorId: string;
  userId: string | null;
  name: string;
  email: string;
  path: string;
  referrer: string | null;
  isEntry: boolean;
  country: string | null;
  city: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  at: string;
}

type Range = "7d" | "30d" | "all";
type Segment = "all" | "signed" | "anon";
type Item = { label: string; count: number };

const ADMIN_CSS = `
.adm-controls { display: flex; justify-content: center; flex-wrap: wrap; gap: 6px; margin-bottom: 22px; }
.adm-pill {
  background: transparent; color: inherit; cursor: pointer;
  border: 0.5px solid var(--hr-color); padding: 3px 14px; font-size: 13px; font-weight: 200;
  border-radius: 999px; transition: background 0.2s ease;
}
.adm-pill:hover { background: rgba(128, 128, 128, 0.12); }
.adm-pill.on { border-color: currentColor; font-weight: 400; }
.adv { margin: 0 0 36px; text-align: center; }
.adv > summary {
  display: inline-block; cursor: pointer; list-style: none;
  font-size: 15px; font-weight: 200; letter-spacing: 0.04em;
  border-bottom: 0.5px dashed currentColor; padding-bottom: 2px;
}
.adv > summary::-webkit-details-marker { display: none; }
.adv > summary::after { content: " \\25BE"; display: inline-block; transition: transform 0.25s ease; }
.adv[open] > summary::after { transform: rotate(180deg); }
.adv-body { text-align: left; margin-top: 26px; animation: admDrop 0.3s ease; }
.adv-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 34px 40px; margin-top: 24px; }
.adv-card h4 {
  margin: 0 0 14px; font-size: 12px; font-weight: 300; letter-spacing: 0.08em;
  text-transform: uppercase; opacity: 0.6;
}
.bar-row { display: grid; grid-template-columns: 1fr auto; gap: 5px 12px; margin-bottom: 13px; font-size: 14px; font-weight: 200; }
.bar-row .v { opacity: 0.6; font-size: 13px; }
.bar-track { grid-column: 1 / -1; height: 3px; border-radius: 2px; background: rgba(128, 128, 128, 0.2); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 2px; background: currentColor; opacity: 0.7; transition: width 0.5s ease; }
.adv-empty { font-size: 13px; font-weight: 200; opacity: 0.5; }
@keyframes admDrop { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
`;

function fmt(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-CA", { dateStyle: "medium", timeStyle: "short" });
}

function ago(iso: string | null) {
  if (!iso) return "";
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return "";
}

function countryName(code: string | null) {
  if (!code) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}

function prettyRef(host: string | null) {
  if (!host || host === "direct") return "Direct / unknown";
  const h = host.toLowerCase();
  if (/(^|\.)google\./.test(h)) return "Google";
  if (/instagram\.com$/.test(h)) return "Instagram";
  if (/linkedin\.com$|^lnkd\.in$/.test(h)) return "LinkedIn";
  if (/^t\.co$|twitter\.com$|(^|\.)x\.com$/.test(h)) return "X (Twitter)";
  if (/facebook\.com$|^fb\.com$|^l\.facebook\.com$/.test(h)) return "Facebook";
  if (/github\.com$/.test(h)) return "GitHub";
  if (/whatsapp/.test(h)) return "WhatsApp";
  if (/youtube\.com$|^youtu\.be$/.test(h)) return "YouTube";
  if (/reddit\.com$/.test(h)) return "Reddit";
  if (/bing\.com$/.test(h)) return "Bing";
  if (/duckduckgo\.com$/.test(h)) return "DuckDuckGo";
  return host;
}

function cap(s: string | null) {
  if (!s) return "Unknown";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function uniqueBy(rows: Visit[], key: (v: Visit) => string | null): Item[] {
  const map = new Map<string, Set<string>>();
  rows.forEach((r) => {
    const k = key(r);
    if (!k) return;
    if (!map.has(k)) map.set(k, new Set());
    map.get(k)!.add(r.visitorId);
  });
  return Array.from(map, ([label, set]) => ({ label, count: set.size })).sort(
    (a, b) => b.count - a.count
  );
}

function countBy(rows: Visit[], key: (v: Visit) => string | null): Item[] {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r);
    if (!k) return;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map, ([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function BarList({
  title,
  items,
  total,
  limit = 6,
}: {
  title: string;
  items: Item[];
  total: number;
  limit?: number;
}) {
  return (
    <div className="adv-card">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="adv-empty">no data yet</p>
      ) : (
        items.slice(0, limit).map((it) => {
          const pct = total > 0 ? Math.round((it.count / total) * 100) : 0;
          return (
            <div className="bar-row" key={it.label}>
              <span>{it.label}</span>
              <span className="v">
                {it.count} · {pct}%
              </span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isOwner, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"members" | "activity">("members");
  const [range, setRange] = useState<Range>("30d");
  const [segment, setSegment] = useState<Segment>("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setBusy(false);
      return;
    }
    setBusy(true);
    setError("");
    const [m, v] = await Promise.all([
      supabase.from("members").select("*").order("last_sign_in_at", { ascending: false }),
      supabase
        .from("site_visits")
        .select(
          "id, visitor_id, user_id, page_path, referrer, is_entry, country, city, device, os, browser, visited_at, members(display_name, email)"
        )
        .order("visited_at", { ascending: false })
        .limit(5000),
    ]);
    if (m.error) setError(m.error.message);
    if (v.error) setError(v.error.message);

    setMembers(
      (m.data || []).map((r) => ({
        id: r.id,
        name: r.display_name || "-",
        email: r.email || "-",
        instagram: r.instagram_username,
        createdAt: r.created_at,
        lastActive: r.last_sign_in_at,
      }))
    );
    setVisits(
      (v.data || []).map((r) => {
        const mem = Array.isArray(r.members) ? r.members[0] : r.members;
        return {
          id: r.id,
          visitorId: r.visitor_id,
          userId: r.user_id,
          name: mem?.display_name || "",
          email: mem?.email || "",
          path: r.page_path,
          referrer: r.referrer,
          isEntry: r.is_entry,
          country: r.country,
          city: r.city,
          device: r.device,
          os: r.os,
          browser: r.browser,
          at: r.visited_at,
        };
      })
    );
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  const inRange = useMemo(() => {
    if (range === "all") return visits;
    const ms = (range === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - ms;
    return visits.filter((v) => new Date(v.at).getTime() >= cutoff);
  }, [visits, range]);

  const stats = useMemo(() => {
    const all = new Set<string>();
    const signed = new Set<string>();
    inRange.forEach((v) => {
      all.add(v.visitorId);
      if (v.userId) signed.add(v.visitorId);
    });
    return {
      visitors: all.size,
      signed: signed.size,
      anon: all.size - signed.size,
      views: inRange.length,
      signedSet: signed,
    };
  }, [inRange]);

  const segRows = useMemo(() => {
    if (segment === "all") return inRange;
    return inRange.filter((v) =>
      segment === "signed" ? stats.signedSet.has(v.visitorId) : !stats.signedSet.has(v.visitorId)
    );
  }, [inRange, segment, stats]);

  const adv = useMemo(() => {
    const visitorTotal = new Set(segRows.map((r) => r.visitorId)).size;
    const entries = segRows.filter((r) => r.isEntry);
    return {
      visitorTotal,
      entryTotal: entries.length,
      countries: uniqueBy(segRows, (r) => countryName(r.country)),
      cities: uniqueBy(segRows, (r) => (r.city ? `${r.city}, ${r.country || ""}` : null)),
      sources: countBy(entries, (r) => prettyRef(r.referrer)),
      devices: uniqueBy(segRows, (r) => cap(r.device)),
      browsers: uniqueBy(segRows, (r) => r.browser || "Unknown"),
      systems: uniqueBy(segRows, (r) => r.os || "Unknown"),
      pages: countBy(segRows, (r) => r.path),
    };
  }, [segRows]);

  const visitsByMember = useMemo(() => {
    const m = new Map<string, number>();
    visits.forEach((v) => {
      if (v.userId) m.set(v.userId, (m.get(v.userId) || 0) + 1);
    });
    return m;
  }, [visits]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontWeight: 100 }}>verifying owner access...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontWeight: 100, marginBottom: "15px" }}>admin</h1>
        <p className="subtitle">owner authorization required</p>
        <p style={{ fontWeight: 200, fontSize: "16px" }}>
          This page is restricted to the site owner.
        </p>
      </div>
    );
  }

  const tabStyle = (on: boolean) =>
    ({
      background: "transparent",
      border: "none",
      borderBottom: on ? "1px solid currentColor" : "none",
      fontWeight: on ? 400 : 200,
      color: "inherit",
      cursor: "pointer",
      fontSize: "16px",
    }) as const;

  const rangeLabel = range === "7d" ? "last 7 days" : range === "30d" ? "last 30 days" : "all time";
  const logRows = inRange.slice(0, 300);

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "0 20px" }}>
      <style>{ADMIN_CSS}</style>
      <h1 style={{ textAlign: "center", fontWeight: 100, marginTop: "30px", marginBottom: "10px" }}>
        admin
      </h1>
      <p className="subtitle">owner dashboard · signed in as {user?.email} · your own visits are not counted</p>

      <div className="adm-controls">
        {(["7d", "30d", "all"] as Range[]).map((r) => (
          <button
            key={r}
            className={`adm-pill ${range === r ? "on" : ""}`}
            onClick={() => setRange(r)}
          >
            {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "all time"}
          </button>
        ))}
        <button className="adm-pill" onClick={load}>
          refresh
        </button>
      </div>

      {error && (
        <p style={{ textAlign: "center", fontSize: "14px", opacity: 0.8 }}>error: {error}</p>
      )}

      {busy ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>loading...</p>
      ) : (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span className="num">{members.length}</span>
              <span className="lbl">members</span>
            </div>
            <div className="admin-stat">
              <span className="num">{stats.visitors}</span>
              <span className="lbl">visitors</span>
            </div>
            <div className="admin-stat">
              <span className="num">{stats.signed}</span>
              <span className="lbl">signed in</span>
            </div>
            <div className="admin-stat">
              <span className="num">{stats.anon}</span>
              <span className="lbl">not signed in</span>
            </div>
            <div className="admin-stat">
              <span className="num">{stats.views}</span>
              <span className="lbl">page views</span>
            </div>
          </div>

          <details className="adv">
            <summary>advanced stats</summary>
            <div className="adv-body">
              <div className="adm-controls">
                {(
                  [
                    ["all", "everyone"],
                    ["signed", "signed in"],
                    ["anon", "not signed in"],
                  ] as [Segment, string][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={`adm-pill ${segment === key ? "on" : ""}`}
                    onClick={() => setSegment(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ textAlign: "center", fontSize: "13px", fontWeight: 200, opacity: 0.6, margin: 0 }}>
                {adv.visitorTotal} visitor{adv.visitorTotal === 1 ? "" : "s"} · {rangeLabel}
              </p>
              <div className="adv-grid">
                <BarList title="Countries (visitors)" items={adv.countries} total={adv.visitorTotal} limit={8} />
                <BarList title="Cities (visitors)" items={adv.cities} total={adv.visitorTotal} limit={8} />
                <BarList title="Came from (visits)" items={adv.sources} total={adv.entryTotal} limit={8} />
                <BarList title="Devices (visitors)" items={adv.devices} total={adv.visitorTotal} />
                <BarList title="Browsers (visitors)" items={adv.browsers} total={adv.visitorTotal} />
                <BarList title="Systems (visitors)" items={adv.systems} total={adv.visitorTotal} />
                <BarList title="Top pages (views)" items={adv.pages} total={segRows.length} limit={8} />
              </div>
            </div>
          </details>

          <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
            <button onClick={() => setActiveTab("members")} style={tabStyle(activeTab === "members")}>
              members ({members.length})
            </button>
            <button onClick={() => setActiveTab("activity")} style={tabStyle(activeTab === "activity")}>
              visit log ({inRange.length})
            </button>
          </div>

          {activeTab === "members" ? (
            members.length === 0 ? (
              <p style={{ textAlign: "center", fontWeight: 100 }}>no members yet.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Instagram</th>
                      <th>Registered</th>
                      <th>Last active</th>
                      <th className="num">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td>
                          {m.name}
                          <span className="sub">{m.email}</span>
                        </td>
                        <td>
                          {m.instagram ? (
                            <a
                              href={`https://instagram.com/${m.instagram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              @{m.instagram}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{fmt(m.createdAt)}</td>
                        <td>
                          {fmt(m.lastActive)}
                          <span className="sub">{ago(m.lastActive)}</span>
                        </td>
                        <td className="num">{visitsByMember.get(m.id) || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : logRows.length === 0 ? (
            <p style={{ textAlign: "center", fontWeight: 100 }}>no visits yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Who</th>
                    <th>Page</th>
                    <th>From</th>
                    <th>Device</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {logRows.map((v) => (
                    <tr key={v.id}>
                      <td>
                        {v.userId ? v.name || v.email || "Member" : `Visitor #${v.visitorId.slice(0, 4)}`}
                        <span className="sub">{v.userId ? v.email : "not signed in"}</span>
                      </td>
                      <td>
                        <code>{v.path}</code>
                        {v.isEntry && <span className="sub">via {prettyRef(v.referrer)}</span>}
                      </td>
                      <td>
                        {countryName(v.country)}
                        {v.city && <span className="sub">{v.city}</span>}
                      </td>
                      <td>
                        {cap(v.device)}
                        <span className="sub">
                          {v.browser || "-"} · {v.os || "-"}
                        </span>
                      </td>
                      <td>
                        {fmt(v.at)}
                        <span className="sub">{ago(v.at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
