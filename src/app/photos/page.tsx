"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  title: string;
  caption: string;
  date: string;
  album: string;
  url: string;
}

const INITIAL_PHOTOS: Photo[] = [
  {
    id: "p1",
    title: "Sherbrooke Winter",
    caption: "Low sun and geometry along Sherbrooke Street in Montréal.",
    date: "January 2026",
    album: "Montréal & Campus",
    url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    title: "Lab Workbench",
    caption: "Oscilloscope traces, leads, and telemetry breadboard testing.",
    date: "November 2025",
    album: "Aviation & Labs",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    title: "McGill Arts Dusk",
    caption: "Arts Building under overcast autumn clouds.",
    date: "October 2025",
    album: "Montréal & Campus",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    title: "35mm Analog Grain",
    caption: "High-contrast monochrome roll developed by hand.",
    date: "August 2025",
    album: "35mm Film Scans",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p5",
    title: "Structural Angles",
    caption: "Concrete and shadow study.",
    date: "June 2025",
    album: "Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p6",
    title: "Wind Tunnel Aerodynamics",
    caption: "Flow visualization setup and pressure transducer rigs.",
    date: "April 2025",
    album: "Aviation & Labs",
    url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function PhotosPage() {
  const { user, isOwner, signInWithGoogle, isLoading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlbum, setNewAlbum] = useState("Montréal & Campus");

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontWeight: 100 }}>loading...</p>
      </div>
    );
  }

  // Signed out restriction prompt
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
          style={{
            background: "transparent",
            color: "inherit",
            border: "0.5px dashed currentColor",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 200,
            cursor: "pointer",
          }}
        >
          sign in with google
        </button>
      </div>
    );
  }

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const newPhoto: Photo = {
      id: `p-${Date.now()}`,
      title: newTitle || "untitled",
      caption: "",
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      album: newAlbum,
      url: newUrl,
    };

    setPhotos([newPhoto, ...photos]);
    setNewTitle("");
    setNewUrl("");
    setIsUploadOpen(false);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this photo?")) {
      setPhotos(photos.filter((p) => p.id !== id));
      if (activePhotoIndex !== null) setActivePhotoIndex(null);
    }
  };

  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          fontWeight: 100,
          marginTop: "30px",
          marginBottom: "10px",
        }}
      >
        pics
      </h1>
      <p className="subtitle">a collection of photos and moments</p>

      {isOwner && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={() => setIsUploadOpen(true)}
            style={{
              background: "transparent",
              color: "inherit",
              border: "0.5px dashed currentColor",
              padding: "4px 14px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            + add photo (owner)
          </button>
        </div>
      )}

      {/* Album Grid matching yakkomajuri.com/albums */}
      <div className="album-grid">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className="album"
            onClick={() => setActivePhotoIndex(idx)}
          >
            <img src={photo.url} alt={photo.title} />
            <h2 className="album-title">{photo.title}</h2>

            {isOwner && (
              <button
                onClick={(e) => handleDeletePhoto(photo.id, e)}
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

      {/* Lightbox Viewer */}
      {activePhotoIndex !== null && photos[activePhotoIndex] && (
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
            onClick={() => setActivePhotoIndex(null)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActivePhotoIndex((activePhotoIndex - 1 + photos.length) % photos.length)
                }
                style={{
                  position: "absolute",
                  left: "20px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  padding: "10px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActivePhotoIndex((activePhotoIndex + 1) % photos.length)
                }
                style={{
                  position: "absolute",
                  right: "20px",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "white",
                  padding: "10px",
                  borderRadius: "50%",
                  cursor: "pointer",
                }}
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div style={{ textAlign: "center", maxWidth: "900px" }}>
            <img
              src={photos[activePhotoIndex].url}
              alt={photos[activePhotoIndex].title}
              style={{
                maxHeight: "75vh",
                maxWidth: "100%",
                margin: "auto",
                display: "block",
              }}
            />
            <p style={{ color: "white", fontWeight: 200, marginTop: "15px" }}>
              {photos[activePhotoIndex].title} — {photos[activePhotoIndex].caption || photos[activePhotoIndex].date}
            </p>
          </div>
        </div>
      )}

      {/* Owner Upload Modal */}
      {isUploadOpen && (
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
            <form onSubmit={handleAddPhoto} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Image URL..."
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "0.5px solid var(--hr-color)",
                  color: "inherit",
                }}
              />
              <input
                type="text"
                placeholder="Title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "0.5px solid var(--hr-color)",
                  color: "inherit",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "transparent",
                    border: "0.5px solid currentColor",
                    padding: "4px 12px",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
