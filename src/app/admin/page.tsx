"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";

interface Member {
  id: string;
  name: string;
  email: string;
  instagram: string | null;
  createdAt: string | null;
  lastActive: string | null;
  visits: number;
}

interface Activity {
  id: number;
  name: string;
  email: string;
  path: string;
  visitedAt: string;
}

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

export default function AdminDashboardPage() {
  const { user, isOwner, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"members" | "activity">("members");
  const [members, setMembers] = useState<Member[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
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
    const [m, a] = await Promise.all([
      supabase.from("members").select("*").order("last_sign_in_at", { ascending: false }),
      supabase
        .from("visitor_activity")
        .select("id, page_path, visited_at, user_id, members(display_name, email)")
        .order("visited_at", { ascending: false })
        .limit(1000),
    ]);
    if (m.error) setError(m.error.message);
    if (a.error) setError(a.error.message);

    const rows = a.data || [];
    const counts: Record<string, number> = {};
    rows.forEach((r) => {
      counts[r.user_id] = (counts[r.user_id] || 0) + 1;
    });

    setMembers(
      (m.data || []).map((r) => ({
        id: r.id,
        name: r.display_name || "-",
        email: r.email || "-",
        instagram: r.instagram_username,
        createdAt: r.created_at,
        lastActive: r.last_sign_in_at,
        visits: counts[r.id] || 0,
      }))
    );
    setActivity(
      rows.map((r) => {
        const mem = Array.isArray(r.members) ? r.members[0] : r.members;
        return {
          id: r.id,
          name: mem?.display_name || "-",
          email: mem?.email || "-",
          path: r.page_path,
          visitedAt: r.visited_at,
        };
      })
    );
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

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

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const activeThisWeek = members.filter(
    (m) => m.lastActive && new Date(m.lastActive).getTime() > weekAgo
  ).length;

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

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center", fontWeight: 100, marginTop: "30px", marginBottom: "10px" }}>
        admin
      </h1>
      <p className="subtitle">owner dashboard · signed in as {user?.email}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
        <button onClick={() => setActiveTab("members")} style={tabStyle(activeTab === "members")}>
          members ({members.length})
        </button>
        <button onClick={() => setActiveTab("activity")} style={tabStyle(activeTab === "activity")}>
          activity logs ({activity.length})
        </button>
        <button onClick={load} style={{ ...tabStyle(false), opacity: 0.6, fontSize: "13px" }}>
          refresh
        </button>
      </div>

      {error && (
        <p style={{ textAlign: "center", fontSize: "14px", opacity: 0.8 }}>error: {error}</p>
      )}

      {!busy && (
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="num">{members.length}</span>
            <span className="lbl">members</span>
          </div>
          <div className="admin-stat">
            <span className="num">{activity.length}</span>
            <span className="lbl">page visits</span>
          </div>
          <div className="admin-stat">
            <span className="num">{activeThisWeek}</span>
            <span className="lbl">active this week</span>
          </div>
        </div>
      )}

      {busy ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>loading...</p>
      ) : activeTab === "members" ? (
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
                    <td className="num">{m.visits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : activity.length === 0 ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>no activity yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Page</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a) => (
                <tr key={a.id}>
                  <td>
                    {a.name}
                    <span className="sub">{a.email}</span>
                  </td>
                  <td>
                    <code>{a.path}</code>
                  </td>
                  <td>
                    {fmt(a.visitedAt)}
                    <span className="sub">{ago(a.visitedAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
