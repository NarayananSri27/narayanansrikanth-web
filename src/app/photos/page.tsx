"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  title: string;
  caption: string;
  album: string;
  storage_path: string;
  created_at: string;
  url: string;
}

const BUCKET = "private-photos";

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

export default function PhotosPage() {
  const { user, isOwner, signInWithGoogle, isLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [album, setAlbum] = useState("Moments");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setBusy(false);
      return;
    }
    setBusy(true);
    const { data, error: loadError } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) {
      setError(loadError.message);
      setBusy(false);
      return;
    }
    const rows = data || [];
    const urls: Record<string, string> = {};
    if (rows.length > 0) {
      const { data: signed } = await supabase.storage
        .from(BUCKET)
        .createSignedUrls(rows.map((r) => r.storage_path), 3600);
      (signed || []).forEach((s) => {
        if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
      });
    }
    setPhotos(
      rows.map((r) => ({
        id: r.id,
        title: r.title,
        caption: r.caption || "",
        album: r.album,
        storage_path: r.storage_path,
        created_at: r.created_at,
        url: urls[r.storage_path] || "",
      }))
    );
    setBusy(false);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontWeight: 100 }}>loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontWeight: 100, marginBottom: "15px" }}>pics</h1>
        <p className="subtitle">personal photographs &amp; analog film scans</p>
        <p style={{ fontWeight: 200, fontSize: "16px", marginBottom: "30px" }}>
          This photo gallery is private. Sign in with Google to explore.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          style={{ ...ghostBtn, padding: "8px 24px", fontSize: "18px", fontWeight: 200 }}
        >
          sign in with google
        </button>
      </div>
    );
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase || !file || !user) return;
    setSaving(true);
    setError("");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safeName}`;
    const up = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (up.error) {
      setError(up.error.message);
      setSaving(false);
      return;
    }
    const ins = await supabase.from("photos").insert({
      title: title || "untitled",
      caption,
      album,
      storage_path: path,
      created_by: user.id,
    });
    if (ins.error) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(ins.error.message);
      setSaving(false);
      return;
    }
    setFile(null);
    setTitle("");
    setCaption("");
    setOpen(false);
    setSaving(false);
    await load();
  }

  async function handleDelete(p: Photo, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this photo?")) return;
    const supabase = createClient();
    if (!supabase) return;
    const del = await supabase.from("photos").delete().eq("id", p.id);
    if (del.error) {
      setError(del.error.message);
      return;
    }
    await supabase.storage.from(BUCKET).remove([p.storage_path]);
    setActive(null);
    await load();
  }

  const current = active !== null ? photos[active] : null;

  return (
    <div>
      <h1 style={{ textAlign: "center", fontWeight: 100, marginTop: "30px", marginBottom: "10px" }}>
        pics
      </h1>
      <p className="subtitle">a collection of photos and moments</p>

      {isOwner && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button onClick={() => setOpen(true)} style={ghostBtn}>
            + add photo (owner)
          </button>
        </div>
      )}

      {error && (
        <p style={{ textAlign: "center", fontSize: "14px", opacity: 0.8 }}>error: {error}</p>
      )}

      {busy ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>loading photos...</p>
      ) : photos.length === 0 ? (
        <p style={{ textAlign: "center", fontWeight: 100 }}>no photos yet.</p>
      ) : (
        <div className="album-grid">
          {photos.map((photo, idx) => (
            <div key={photo.id} className="album" onClick={() => setActive(idx)}>
              {photo.url && <img src={photo.url} alt={photo.title} />}
              <h2 className="album-title">{photo.title}</h2>
              {isOwner && (
                <button
                  onClick={(e) => handleDelete(photo, e)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    zIndex: 3,
                    background: "rgba(0,0,0,0.6)",
                    border: "none",
                    color: "#fff",
                    padding: "4px",
                    cursor: "pointer",
                  }}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <button
            onClick={() => setActive(null)}
            style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "white", cursor: "pointer" }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setActive(((active as number) - 1 + photos.length) % photos.length)}
                style={{ position: "absolute", left: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "10px", borderRadius: "50%", cursor: "pointer" }}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActive(((active as number) + 1) % photos.length)}
                style={{ position: "absolute", right: "20px", background: "rgba(255,255,255,0.1)", border: "none", color: "white", padding: "10px", borderRadius: "50%", cursor: "pointer" }}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div style={{ textAlign: "center", maxWidth: "900px" }}>
            <img
              src={current.url}
              alt={current.title}
              style={{ maxHeight: "75vh", maxWidth: "100%", margin: "auto", display: "block" }}
            />
            <p style={{ color: "white", fontWeight: 200, marginTop: "15px" }}>
              {current.title}
              {current.caption ? " - " + current.caption : ""}
            </p>
          </div>
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
              maxWidth: "420px",
              width: "100%",
              border: "1px solid var(--hr-color)",
            }}
          >
            <h3 style={{ fontWeight: 100, marginTop: 0 }}>Add Photo</h3>
            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                style={field}
              />
              <input type="text" placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} style={field} />
              <input type="text" placeholder="Caption (optional)..." value={caption} onChange={(e) => setCaption(e.target.value)} style={field} />
              <input type="text" placeholder="Album..." value={album} onChange={(e) => setAlbum(e.target.value)} style={field} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
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
                  {saving ? "uploading..." : "save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
