"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import {
  Lock,
  LogIn,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FolderOpen,
} from "lucide-react";

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
    title: "Montréal Architecture in Winter",
    caption: "Quiet geometry and afternoon low sun along Sherbrooke Street.",
    date: "January 2026",
    album: "Montréal & Campus",
    url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p2",
    title: "Engineering Lab Workbench",
    caption: "Oscilloscope traces, test leads, and telemetry breadboard testing.",
    date: "November 2025",
    album: "Aviation & Labs",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p3",
    title: "McGill Campus Dusk",
    caption: "Arts Building under overcast autumn clouds.",
    date: "October 2025",
    album: "Montréal & Campus",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p4",
    title: "35mm Analog Grain Experiment",
    caption: "High-contrast monochrome roll developed by hand.",
    date: "August 2025",
    album: "35mm Film Scans",
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p5",
    title: "Structural Angles & Shadow",
    caption: "Minimalist concrete study.",
    date: "June 2025",
    album: "Travel & Architecture",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p6",
    title: "Wind Tunnel Aerodynamics Model",
    caption: "Flow visualization setup and pressure transducer rigs.",
    date: "April 2025",
    album: "Aviation & Labs",
    url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=1200&q=80",
  },
];

const ALBUMS = [
  "All",
  "Montréal & Campus",
  "Aviation & Labs",
  "35mm Film Scans",
  "Travel & Architecture",
];

export default function PhotosPage() {
  const { user, isOwner, signInWithGoogle, isLoading } = useAuth();
  const [selectedAlbum, setSelectedAlbum] = useState("All");
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Owner upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newAlbum, setNewAlbum] = useState("Montréal & Campus");
  const [newUrl, setNewUrl] = useState("");

  if (isLoading) {
    return (
      <div className="py-24 text-center text-sm font-mono text-neutral-400">
        Checking access...
      </div>
    );
  }

  // Restricted view for unauthenticated visitors
  if (!user) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto text-neutral-500">
          <Lock className="w-5 h-5" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-medium text-neutral-900 dark:text-neutral-100">
            Private Photo Gallery
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            This collection contains personal photographs, campus moments, and film scans. Sign in with Google to view the gallery.
          </p>
        </div>

        <button
          onClick={() => signInWithGoogle()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 rounded-lg transition-colors shadow-sm"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign in with Google</span>
        </button>

        <p className="text-[11px] font-mono text-neutral-400">
          No approval queue required. All verified Google accounts can explore.
        </p>
      </div>
    );
  }

  const filteredPhotos =
    selectedAlbum === "All"
      ? photos
      : photos.filter((p) => p.album === selectedAlbum);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const newPhoto: Photo = {
      id: `p-${Date.now()}`,
      title: newTitle || "Untitled Photograph",
      caption: newCaption || "Personal photograph",
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      album: newAlbum,
      url: newUrl,
    };

    setPhotos([newPhoto, ...photos]);
    setNewTitle("");
    setNewCaption("");
    setNewUrl("");
    setIsUploadOpen(false);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Remove this photograph from the gallery?")) {
      setPhotos(photos.filter((p) => p.id !== id));
      if (activePhotoIndex !== null) setActivePhotoIndex(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100">
            Personal Photographs
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Private archive of photographs, lab work, analog scans, and travels.
          </p>
        </div>

        {/* Owner upload button */}
        {isOwner && (
          <button
            onClick={() => setIsUploadOpen(true)}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photograph</span>
          </button>
        )}
      </header>

      {/* Album Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
        <FolderOpen className="w-3.5 h-3.5 text-neutral-400 mr-1" />
        {ALBUMS.map((album) => (
          <button
            key={album}
            onClick={() => setSelectedAlbum(album)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedAlbum === album
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
            }`}
          >
            {album}
          </button>
        ))}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPhotos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setActivePhotoIndex(idx)}
            className="group relative cursor-pointer rounded-xl overflow-hidden border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100 dark:bg-neutral-900 transition-all hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm"
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-3.5 space-y-1 bg-white/95 dark:bg-neutral-900/95">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>{photo.album}</span>
                <span>{photo.date}</span>
              </div>
              <h3 className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {photo.title}
              </h3>
            </div>

            {/* Owner quick delete */}
            {isOwner && (
              <button
                onClick={(e) => handleDeletePhoto(photo.id, e)}
                className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white/80 hover:text-rose-400 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox / Full Viewer */}
      {activePhotoIndex !== null && filteredPhotos[activePhotoIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
        >
          <button
            onClick={() => setActivePhotoIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="Close viewer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Controls */}
          {filteredPhotos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActivePhotoIndex(
                    (activePhotoIndex - 1 + filteredPhotos.length) %
                      filteredPhotos.length
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActivePhotoIndex(
                    (activePhotoIndex + 1) % filteredPhotos.length
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="max-w-3xl w-full space-y-4">
            <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden bg-black shadow-2xl">
              <Image
                src={filteredPhotos[activePhotoIndex].url}
                alt={filteredPhotos[activePhotoIndex].title}
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="text-white space-y-1 text-center">
              <h2 className="text-sm font-medium">
                {filteredPhotos[activePhotoIndex].title}
              </h2>
              <p className="text-xs text-white/70 max-w-md mx-auto">
                {filteredPhotos[activePhotoIndex].caption}
              </p>
              <p className="text-[11px] font-mono text-white/40">
                {filteredPhotos[activePhotoIndex].album} ·{" "}
                {filteredPhotos[activePhotoIndex].date}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Owner Upload Modal */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-md p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Add Photograph (Owner)</span>
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Image URL or Storage Path
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://... or storage key"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. McGill Campus in Autumn"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Caption / Notes
                </label>
                <textarea
                  placeholder="Brief note or technical camera metadata..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Album
                </label>
                <select
                  value={newAlbum}
                  onChange={(e) => setNewAlbum(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  {ALBUMS.filter((a) => a !== "All").map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium"
                >
                  Save Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
