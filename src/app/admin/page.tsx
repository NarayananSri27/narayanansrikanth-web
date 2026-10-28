"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  Activity,
  FolderKanban,
  BarChart3,
  Search,
  Filter,
  AtSign,
  ArrowUpRight,
  ExternalLink,
  Clock,
  Calendar,
} from "lucide-react";

// Mock directory data for local preview / dev
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
  {
    id: "act-5",
    memberName: "Liam Chen",
    email: "liam.chen@alum.mit.edu",
    instagram: null,
    path: "/photos",
    timestamp: "2026-02-18 19:42",
  },
];

type AdminTab = "members" | "activity" | "content" | "analytics";

export default function AdminDashboardPage() {
  const { user, isOwner, isLoading, devSignInAsOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("members");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilterPath, setActivityFilterPath] = useState("all");

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm font-mono text-neutral-400">
        Verifying owner authorization...
      </div>
    );
  }

  // Strict Owner Protection Check
  if (!isOwner) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto text-rose-600 dark:text-rose-400">
          <ShieldAlert className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
            Access Restricted
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            This administration dashboard is restricted exclusively to the website owner account.
          </p>
        </div>

        <div className="pt-2 text-xs text-neutral-500 space-y-3">
          <p className="font-mono text-[11px] text-neutral-400">
            Owner Email Configured: {process.env.NEXT_PUBLIC_OWNER_EMAIL || "narayanan.srikanth@example.com"}
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:border-neutral-900"
            >
              Return Home
            </Link>
            <button
              onClick={devSignInAsOwner}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium"
            >
              Simulate Owner Login (Dev)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredMembers = MOCK_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.instagram && m.instagram.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredActivity = MOCK_ACTIVITY.filter((a) => {
    const matchesPath =
      activityFilterPath === "all" || a.path === activityFilterPath;
    const matchesSearch =
      a.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPath && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Owner Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100 mt-1">
            Dashboard & Member Registry
          </h1>
        </div>

        <div className="text-right text-xs font-mono text-neutral-400">
          <p>Owner: {user?.email}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Authenticated & Verified
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
            activeTab === "members"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Member Directory ({MOCK_MEMBERS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
            activeTab === "activity"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Visitor Activity ({MOCK_ACTIVITY.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
            activeTab === "content"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
          }`}
        >
          <FolderKanban className="w-3.5 h-3.5" />
          <span>Content Management</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
            activeTab === "analytics"
              ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
              : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Aggregate Analytics</span>
        </button>
      </div>

      {/* Tab 1: Member Directory */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member name, email, or Instagram..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Showing {filteredMembers.length} registered members
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-mono text-[11px] uppercase border-b border-neutral-200/60 dark:border-neutral-800/60">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Instagram</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {member.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {member.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {member.instagram ? (
                        <span className="inline-flex items-center gap-1 font-mono text-neutral-800 dark:text-neutral-200">
                          <AtSign className="w-3 h-3 text-neutral-400" />
                          <span>{member.instagram}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Not set</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {member.createdAt}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {member.lastSignIn}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-neutral-700 dark:text-neutral-300">
                      {member.totalVisits}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Visitor Activity */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-mono">Route:</span>
              {["all", "/", "/photos", "/research"].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivityFilterPath(p)}
                  className={`px-2.5 py-1 text-xs rounded-md font-mono ${
                    activityFilterPath === p
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="text-xs font-mono text-neutral-400">
              Only authenticated page visits are recorded
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 font-mono text-[11px] uppercase border-b border-neutral-200/60 dark:border-neutral-800/60">
                <tr>
                  <th className="py-3 px-4">Member Identity</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Instagram</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredActivity.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {act.memberName}
                      </p>
                      <p className="text-[11px] text-neutral-500 font-mono">
                        {act.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <code className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">
                        {act.path}
                      </code>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">
                      {act.instagram ? `@${act.instagram}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-500">
                      {act.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Content Management */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 space-y-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
              <span>Photo Gallery Management</span>
              <Link
                href="/photos"
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>Open Photos</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Upload photographs, assign albums, write captions, and delete images directly inside the Photos view using your owner privileges.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 space-y-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
              <span>Research Notebook Management</span>
              <Link
                href="/research"
                className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
              >
                <span>Open Research</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Create, edit, organize topics, and delete research entries directly on the Research page when authenticated as the owner.
            </p>
          </div>

          <div className="md:col-span-2 p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/40 space-y-3">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Static Content Configuration
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All public static text (bio, university info, projects, links, contact details) is cleanly separated in:
            </p>
            <code className="block p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-neutral-800 dark:text-neutral-200">
              src/data/content.ts
            </code>
          </div>
        </div>
      )}

      {/* Tab 4: Aggregate Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-500">
              <BarChart3 className="w-4 h-4" />
              <span>GoatCounter Integration</span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
              GoatCounter is a lightweight, privacy-respecting aggregate analytics platform that requires no tracking cookies and respects GDPR/ePrivacy. It records total views and referrers without collecting identifiable personal data.
            </p>

            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 space-y-2">
              <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                Strict Privacy Boundary:
              </p>
              <ul className="text-xs text-neutral-500 space-y-1 list-disc pl-4">
                <li>Never sends member emails, Google identities, or Instagram handles.</li>
                <li>Never sends private research notes or internal member IDs.</li>
                <li>Operates independently from the Supabase visitor activity log.</li>
              </ul>
            </div>

            <div className="pt-2 text-xs font-mono text-neutral-500">
              Configured Code:{" "}
              <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                {process.env.NEXT_PUBLIC_GOATCOUNTER_CODE || "Not set (optional)"}
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
