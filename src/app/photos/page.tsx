"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  width: number;
  height: number;
  known: boolean;
  thumbUrl: string;
  url: string;
}

const BUCKET = "private-photos";
const thumbPathOf = (path: string) => `thumbs/${path}`;

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

// All gallery styling lives here so it does not depend on globals.css
const GALLERY_CSS = `
.mz-grid { display: flex; align-items: flex-start; gap: 8px; padding: 0 8px; }
.mz-col { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.mz-item {
  position: relative;
  cursor: pointer;
  background: rgba(128, 128, 128, 0.12);
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease;
}
.mz-item img { display: block; width: 100%; height: auto; opacity: 0; transition: opacity 0.5s ease; }
.mz-title {
  position: absolute; left: 0; right: 0; bottom: 0;
  padding: 34px 14px 12px;
  color: #fff; font-size: 15px; font-weight: 200;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  opacity: 0; transform: translateY(6px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}
@media (min-width: 701px) {
  .mz-grid { gap: 16px; padding: 0 24px; }
  .mz-col { gap: 16px; }
}
@media (hover: hover) {
  .mz-item:hover {
    transform: translateY(-8px) scale(1.035);
    box-shadow: 0 22px 44px rgba(0, 0, 0, 0.3);
    z-index: 5;
  }
  .mz-item:hover .mz-title { opacity: 1; transform: none; }
}
.mz-light {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.94);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: mzFade 0.25s ease;
}
.mz-stage { text-align: center; max-width: 92vw; animation: mzOpen 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1); }
.mz-stage img { max-height: 78vh; max-width: 100%; margin: auto; display: block; }
.mz-cap { color: #fff; font-weight: 200; margin-top: 14px; }
.mz-count { position: absolute; top: 24px; left: 24px; color: rgba(255, 255, 255, 0.7); font-size: 14px; letter-spacing: 0.06em; }
.mz-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.35);
  transition: background 0.2s ease, transform 0.2s ease;
}
.mz-btn:hover { background: rgba(255, 255, 255, 0.32); transform: translateY(-50%) scale(1.08); }
.mz-prev { left: 20px; }
.mz-next { right: 20px; }
.mz-close { position: absolute; top: 18px; right: 20px; background: none; border: none; color: #fff; cursor: pointer; padding: 6px; }
@media (max-width: 700px) {
  .mz-btn { width: 40px; height: 40px; }
  .mz-prev { left: 8px; }
  .mz-next { right: 8px; }
}
@keyframes mzFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes mzOpen { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
`;

// Finds out a photo's real shape by loading it once
function probe(url: string): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => resolve(null), 8000);
    img.onload = () => {
      clearTimeout(timer);
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = url;
  });
}

// Shrinks a photo in the browser before upload (keeps pages fast, saves storage)
async function resizeToJpeg(file: File, maxEdge: number, quality: number) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process this image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Could not process this image");
  return { blob, width, height };
}

export default function PhotosPage() {
  const { user, isOwner, isLoading, openAuthModal } = useAuth();
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
  const [cols, setCols] = useState(4);
  const touchX = useRef<number | null>(null);
  const ownerRef = useRef(false);
  ownerRef.current = isOwner;

  // How many columns fit: 2 on phones, 3 on tablets, 4 on wide screens
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      setCols(w < 700 ? 2 : w < 1000 ? 3 : 4);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

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
      const paths = rows.flatMap((r) => [r.storage_path, thumbPathOf(r.storage_path)]);
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
      (signed || []).forEach((s) => {
        if (s.path && s.signedUrl) urls[s.path] = s.signedUrl;
      });
    }

    // Photos saved before shapes were recorded: measure them now so nothing is cropped
    const dims: Record<string, { w: number; h: number }> = {};
    await Promise.all(
      rows
        .filter((r) => !r.width || !r.height)
        .map(async (r) => {
          const u = urls[thumbPathOf(r.storage_path)] || urls[r.storage_path];
          if (!u) return;
          const d = await probe(u);
          if (d) dims[r.id] = d;
        })
    );
    // The owner's visit saves the measured shapes so this only happens once
    if (ownerRef.current) {
      Object.entries(dims).forEach(([id, d]) => {
        supabase
          .from("photos")
          .update({ width: d.w, height: d.h })
          .eq("id", id)
          .then(() => {});
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
        width: r.width || dims[r.id]?.w || 4,
        height: r.height || dims[r.id]?.h || 3,
        known: Boolean((r.width && r.height) || dims[r.id]),
        thumbUrl: urls[thumbPathOf(r.storage_path)] || urls[r.storage_path] || "",
        url: urls[r.storage_path] || "",
      }))
    );
    setBusy(false);
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  // Visitors who are not signed in get the Google card right away
  useEffect(() => {
    if (!isLoading && !user) {
      openAuthModal("Sign in to view the photo gallery");
    }
  }, [isLoading, user, openAuthModal]);

  // Keyboard controls, scroll lock, and preloading the neighbouring photos
  useEffect(() => {
    if (active === null) return;
    const count = photos.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") setActive((a) => (a === null ? a : (a + 1) % count));
      if (e.key === "ArrowLeft") setActive((a) => (a === null ? a : (a - 1 + count) % count));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    [1, -1].forEach((d) => {
      const n = photos[(active + d + count) % count];
      if (n?.url) new Image().src = n.url;
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, photos]);

  // Scatter layout: each photo goes into the currently shortest column,
  // and the columns start at slightly different heights.
  const columns = useMemo(() => {
    const buckets: number[][] = Array.from({ length: cols }, () => []);
    const stagger = [0, 0.12, 0.04, 0.16];
    const heights = Array.from({ length: cols }, (_, c) => (cols > 2 ? stagger[c % 4] : c === 1 ? 0.08 : 0));
    photos.forEach((p, idx) => {
      let target = 0;
      for (let c = 1; c < cols; c++) if (heights[c] < heights[target]) target = c;
      buckets[target].push(idx);
      heights[target] += p.height / p.width + 0.03;
    });
    return buckets;
  }, [photos, cols]);

  const staggerPx = [0, 40, 14, 52];

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
          onClick={() => openAuthModal("Sign in to view the photo gallery")}
          style={{ ...ghostBtn, padding: "8px 24px", fontSize: "18px", fontWeight: 200 }}
        >
          continue with google
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

    let main, thumb;
    try {
      main = await resizeToJpeg(file, 2000, 0.85);
      thumb = await resizeToJpeg(file, 1000, 0.82);
    } catch {
      setError("Could not read this image. Try a JPG or PNG file.");
      setSaving(false);
      return;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const path = `${Date.now()}-${baseName}.jpg`;

    const upMain = await supabase.storage
      .from(BUCKET)
      .upload(path, main.blob, { contentType: "image/jpeg" });
    if (upMain.error) {
      setError(upMain.error.message);
      setSaving(false);
      return;
    }
    const upThumb = await supabase.storage
      .from(BUCKET)
      .upload(thumbPathOf(path), thumb.blob, { contentType: "image/jpeg" });
    if (upThumb.error) {
      await supabase.storage.from(BUCKET).remove([path]);
      setError(upThumb.error.message);
      setSaving(false);
      return;
    }

    const ins = await supabase.from("photos").insert({
      title: title || "untitled",
      caption,
      album,
      storage_path: path,
      width: main.width,
      height: main.height,
      created_by: user.id,
    });
    if (ins.error) {
      await supabase.storage.from(BUCKET).remove([path, thumbPathOf(path)]);
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
    await supabase.storage.from(BUCKET).remove([p.storage_path, thumbPathOf(p.storage_path)]);
    setActive(null);
    await load();
  }

  function step(dir: number) {
    setActive((a) => (a === null ? a : (a + dir + photos.length) % photos.length));
  }

  const current = active !== null ? photos[active] : null;

  return (
    <div>
      <style>{GALLERY_CSS}</style>

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
        <div className="mz-grid">
          {columns.map((indexes, c) => (
            <div
              key={c}
              className="mz-col"
              style={{ marginTop: cols > 2 ? staggerPx[c % 4] : c === 1 ? 24 : 0 }}
            >
              {indexes.map((idx) => {
                const photo = photos[idx];
                return (
                  <div key={photo.id} className="mz-item" onClick={() => setActive(idx)}>
                    {photo.thumbUrl && (
                      <img
                        src={photo.thumbUrl}
                        alt={photo.title}
                        loading="lazy"
                        decoding="async"
                        style={
                          photo.known
                            ? { aspectRatio: `${photo.width} / ${photo.height}`, objectFit: "cover" }
                            : undefined
                        }
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                      />
                    )}
                    <span className="mz-title">{photo.title}</span>
                    {isOwner && (
                      <button
                        onClick={(e) => handleDelete(photo, e)}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
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
                );
              })}
            </div>
          ))}
        </div>
      )}

      {current && (
        <div
          className="mz-light"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <span className="mz-count">
            {(active as number) + 1} / {photos.length}
          </span>
          <button
            className="mz-close"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button
                className="mz-btn mz-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="mz-btn mz-next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div key={current.id} className="mz-stage" onClick={(e) => e.stopPropagation()}>
            <img src={current.url || current.thumbUrl} alt={current.title} />
            <p className="mz-cap">
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
