"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { Lock, Trash2 } from "lucide-react";

interface Entry {
  id: string;
  title: string;
  topic: string;
  abstract: string;
  content?: string; // only present for signed-in members
  created_at: string;
}

interface Row {
  id: string;
  title: string;
  topic: string;
  abstract?: string | null;
  content?: string;
  created_at: string;
}

const field = {
  padding: "8px",
  background: "transparent",
  border: "0.5px solid var(--hr-color)",
  color: "inherit",
  fontFamily: "inherit",
} as const;

const ghostBtn = {
  background: "transparent",
  color: "inherit",
  border: "0.5px dashed currentColor",
  padding: "4px 14px",
  fontSize: "13px",
  cursor: "pointer",
} as const;

export default function ResearchPage() {
  const { user, isOwner, isLoading, openAuthModal } = useAuth();
  const userId = user?.id ?? null;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Quantitative Risk");
  const [abstract, setAbstract] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (signedIn: boolean) => {
    const supabase = createClient();
    if (!supabase) {
      setBusy(false);
      return;
    }
    setBusy(true);
    // Visitors can only read the title list. Abstracts and notes are for signed-in members.
    const columns = signedIn ? "*" : "id, title, topic, created_at";
    const { data, error: loadError } = await supabase
      .from("research_entries")
      .select(columns)
      .order("created_at", { ascending: false });
    if (loadError) {
      setError(loadError.message);
    } else {
      setError("");
      const rows = (data as unknown as Row[]) || [];
      setEntries(
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          topic: r.topic,
          abstract: r.abstract || "",
          content: r.content,
          created_at: r.created_at,
        }))
      );
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!isLoading) load(Boolean(userId));
  }, [isLoading, userId, load]);

  // After signing in from a clicked title, open that note automatically
  useEffect(() => {
    if (
      userId &&
      pendingId &&
      entries.some((e) => e.id === pendingId && e.content !== undefined)
    ) {
      setExpandedId(pendingId);
      setPendingId(null);
    }
  }, [userId, pendingId, entries]);

  function toggle(entry: Entry) {
    if (!user) {
      setPendingId(entry.id);
      openAuthModal("Sign in to read this research note");
      return;
    }
    setExpandedId(expandedId === entry.id ? null : entry.id);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase || !user) return;
    setSaving(true);
    setError("");
    const ins = await supabase.from("research_entries").insert({
      title,
      topic,
      abstract,
      content: body,
      created_by: user.id,
    });
    setSaving(false);
    if (ins.error) {
      setError(ins.error.message);
      return;
    }
    setTitle("");
    setAbstract("");
    setBody("");
    setOpen(false);
    await load(true);
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this entry?")) return;
    const supabase = createClient();
    if (!supabase) return;
    const del = await supabase.from("research_entries").delete().eq("id", id);
    if (del.error) {
      setError(del.error.message);
      return;
    }
    if (expandedId === id) setExpandedId(null);
    await load(true);
  }

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center", fontWeight: 100, marginTop: "30px", marginBottom: "10px" }}>
        research
      </h1>
      <p className="subtitle">working notes, quantitative models, and ideas</p>

      {isOwner && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button onClick={() => setOpen(true)} style={ghostBtn}>
            + new note (owner)
          </button>
        </div>
      )}

      {error && (
        <p style={{ textAlign: "center", fontSize: "14px", opacity: 0.8 }}>error: {error}</p>
      )}

      {busy ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>loading notes...</p>
      ) : entries.length === 0 ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>no notes yet.</p>
      ) : (
        <div style={{ marginTop: "30px" }}>
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id && entry.content !== undefined;
            const date = new Date(entry.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            });
            return (
              <div
                key={entry.id}
                style={{
                  marginBottom: "35px",
                  paddingBottom: "25px",
                  borderBottom: "0.5px solid var(--hr-color)",
                }}
              >
                <div
                  onClick={() => toggle(entry)}
                  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
                >
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "22px",
                        fontWeight: 200,
                        borderBottom: "0.5px dashed currentColor",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {entry.title}
                      {!user && <Lock className="w-3 h-3 opacity-50" />}
                    </h3>
                    <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.6 }}>
                      {entry.topic} · {date}
                    </p>
                    {!user && (
                      <p
                        aria-hidden="true"
                        style={{
                          margin: "10px 0 0 0",
                          fontSize: "15px",
                          fontWeight: 200,
                          opacity: 0.75,
                          filter: "blur(6px)",
                          userSelect: "none",
                        }}
                      >
                        A short summary of this note, written for members. Sign in with Google to read the abstract and the full notes.
                      </p>
                    )}
                    {user && entry.abstract && !isExpanded && (
                      <p style={{ margin: "10px 0 0 0", fontSize: "15px", fontWeight: 200, opacity: 0.75 }}>
                        {entry.abstract}
                      </p>
                    )}
                  </div>
                  {isOwner && (
                    <button
                      onClick={(e) => handleDelete(entry.id, e)}
                      style={{ background: "none", border: "none", color: "inherit", opacity: 0.5, cursor: "pointer" }}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ marginTop: "18px", fontSize: "16px", lineHeight: "1.6em" }}>
                    {entry.abstract && (
                      <p style={{ marginBottom: "14px", fontWeight: 200, opacity: 0.75 }}>
                        {entry.abstract}
                      </p>
                    )}
                    {(entry.content || "").split(/\n\s*\n/).map((para, idx) => (
                      <p key={idx} style={{ marginBottom: "14px", fontWeight: 200, whiteSpace: "pre-wrap" }}>
                        {para}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg-color)",
              color: "var(--text-color)",
              padding: "25px",
              maxWidth: "500px",
              width: "100%",
              border: "1px solid var(--hr-color)",
            }}
          >
            <h3 style={{ fontWeight: 100, marginTop: 0 }}>New Research Note</h3>
            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input type="text" placeholder="Title..." required value={title} onChange={(e) => setTitle(e.target.value)} style={field} />
              <input type="text" placeholder="Topic..." value={topic} onChange={(e) => setTopic(e.target.value)} style={field} />
              <input type="text" placeholder="Short abstract (members only)..." value={abstract} onChange={(e) => setAbstract(e.target.value)} style={field} />
              <textarea
                placeholder="Notes... (members only; leave a blank line between paragraphs)"
                rows={8}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                style={field}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: "transparent", border: "0.5px solid currentColor", padding: "4px 12px", cursor: "pointer", color: "inherit" }}
                >
                  {saving ? "saving..." : "save note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
