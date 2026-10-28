"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

const MOCK_MEMBERS = [
  {
    id: "mem-01",
    name: "McGill Engineering Peer",
    email: "visitor@mcgill.ca",
    instagram: "mcgill_eng_student",
    createdAt: "2026-02-14",
    lastSignIn: "2026-02-28 14:22",
    totalVisits: 8,
  },
  {
    id: "mem-02",
    name: "Alex Tremblay",
    email: "alex.tremblay@mail.mcgill.ca",
    instagram: "alextremblay_mtl",
    createdAt: "2026-01-20",
    lastSignIn: "2026-02-25 09:15",
    totalVisits: 14,
  },
  {
    id: "mem-03",
    name: "Liam Chen",
    email: "liam.chen@alum.mit.edu",
    instagram: null,
    createdAt: "2026-02-01",
    lastSignIn: "2026-02-18 19:40",
    totalVisits: 4,
  },
];

const MOCK_ACTIVITY = [
  {
    id: "act-1",
    memberName: "Alex Tremblay",
    email: "alex.tremblay@mail.mcgill.ca",
    instagram: "alextremblay_mtl",
    path: "/photos",
    timestamp: "2026-02-28 15:45",
  },
  {
    id: "act-2",
    memberName: "Alex Tremblay",
    email: "alex.tremblay@mail.mcgill.ca",
    instagram: "alextremblay_mtl",
    path: "/research",
    timestamp: "2026-02-28 15:42",
  },
  {
    id: "act-3",
    memberName: "McGill Engineering Peer",
    email: "visitor@mcgill.ca",
    instagram: "mcgill_eng_student",
    path: "/research",
    timestamp: "2026-02-28 14:23",
  },
  {
    id: "act-4",
    memberName: "McGill Engineering Peer",
    email: "visitor@mcgill.ca",
    instagram: "mcgill_eng_student",
    path: "/",
    timestamp: "2026-02-28 14:22",
  },
];

export default function AdminDashboardPage() {
  const { user, isOwner, isLoading, devSignInAsOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<"members" | "activity">("members");

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
        <p style={{ fontWeight: 200, fontSize: "16px", marginBottom: "30px" }}>
          This page is restricted strictly to the designated owner email address.
        </p>
        <button
          onClick={devSignInAsOwner}
          style={{
            background: "transparent",
            color: "inherit",
            border: "0.5px dashed currentColor",
            padding: "8px 24px",
            fontSize: "16px",
            fontWeight: 200,
            cursor: "pointer",
          }}
        >
          simulate owner login (dev)
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "0 20px" }}>
      <h1
        style={{
          textAlign: "center",
          fontWeight: 100,
          marginTop: "30px",
          marginBottom: "10px",
        }}
      >
        admin
      </h1>
      <p className="subtitle">owner dashboard · signed in as {user?.email}</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px" }}>
        <button
          onClick={() => setActiveTab("members")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "members" ? "1px solid currentColor" : "none",
            fontWeight: activeTab === "members" ? 400 : 200,
            color: "inherit",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          members ({MOCK_MEMBERS.length})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          style={{
            background: "transparent",
            border: "none",
            borderBottom: activeTab === "activity" ? "1px solid currentColor" : "none",
            fontWeight: activeTab === "activity" ? 400 : 200,
            color: "inherit",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          activity logs ({MOCK_ACTIVITY.length})
        </button>
      </div>

      {activeTab === "members" ? (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Instagram</th>
                <th>Registered</th>
                <th>Last Active</th>
                <th>Visits</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MEMBERS.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.instagram ? `@${m.instagram}` : "—"}</td>
                  <td>{m.createdAt}</td>
                  <td>{m.lastSignIn}</td>
                  <td>{m.totalVisits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Route</th>
                <th>Instagram</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ACTIVITY.map((a) => (
                <tr key={a.id}>
                  <td>{a.memberName}</td>
                  <td><code>{a.path}</code></td>
                  <td>{a.instagram ? `@${a.instagram}` : "—"}</td>
                  <td>{a.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
