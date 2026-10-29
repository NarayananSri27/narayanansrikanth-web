"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  instagram_username: string | null;
  instagram_popup_dismissed: boolean;
  is_owner: boolean;
  created_at: string;
  last_sign_in_at: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  isOwner: boolean;
  isSigningIn: boolean;
  signInWithGoogle: () => Promise<void>;
  openAuthModal: (reason?: string, afterPath?: string) => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  updateInstagram: (username: string | null, dismissed: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isConfigured: false,
  isOwner: false,
  isSigningIn: false,
  signInWithGoogle: async () => {},
  openAuthModal: () => {},
  closeAuthModal: () => {},
  signOut: async () => {},
  updateInstagram: async () => {},
});

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function AuthModal({
  reason,
  isSigningIn,
  onGoogle,
  onClose,
}: {
  reason: string;
  isSigningIn: boolean;
  onGoogle: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div
        className="auth-card"
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <X className="w-4 h-4" />
        </button>
        <h2>Sign in to continue</h2>
        <p className="auth-sub">
          {reason || "Sign in with your Google account to unlock this part of the site."}
        </p>
        <button className="auth-google" onClick={onGoogle} disabled={isSigningIn}>
          <GoogleLogo />
          <span>{isSigningIn ? "Waiting for Google..." : "Continue with Google"}</span>
        </button>
        <p className="auth-fine">
          By continuing, you agree to the{" "}
          <Link href="/privacy" onClick={onClose}>
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState("");
  const [afterPath, setAfterPath] = useState<string | null>(null);

  const ownerEmail = (
    process.env.NEXT_PUBLIC_OWNER_EMAIL || "narayanansri2007@gmail.com"
  ).toLowerCase();

  const fetchProfile = useCallback(
    async (currentUser: User) => {
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("members")
          .select("*")
          .eq("id", currentUser.id)
          .single();

        const isOwnerAccount = (currentUser.email || "").toLowerCase() === ownerEmail;

        if (data && !error) {
          // Refresh "last active" if it has been more than 5 minutes
          const lastSeen = data.last_sign_in_at
            ? new Date(data.last_sign_in_at).getTime()
            : 0;
          let lastSignIn: string | null = data.last_sign_in_at;
          if (Date.now() - lastSeen > 5 * 60 * 1000) {
            lastSignIn = new Date().toISOString();
            supabase
              .from("members")
              .update({ last_sign_in_at: lastSignIn })
              .eq("id", currentUser.id)
              .then(() => {});
          }
          setProfile({ ...data, last_sign_in_at: lastSignIn, is_owner: isOwnerAccount });
        } else {
          // First sign-in: create the member row
          const newProfile: Partial<Profile> = {
            id: currentUser.id,
            email: currentUser.email || null,
            display_name:
              currentUser.user_metadata?.full_name ||
              currentUser.user_metadata?.name ||
              currentUser.email?.split("@")[0] ||
              "Member",
            avatar_url: currentUser.user_metadata?.avatar_url || null,
            instagram_username: null,
            instagram_popup_dismissed: false,
            last_sign_in_at: new Date().toISOString(),
          };

          await supabase.from("members").upsert(newProfile);

          setProfile({
            ...newProfile,
            is_owner: isOwnerAccount,
            created_at: new Date().toISOString(),
          } as Profile);
        }
      } catch (err) {
        console.error("Error fetching member profile:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [ownerEmail]
  );

  // Session setup and live auth changes
  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      setIsConfigured(false);
      setIsLoading(false);
      return;
    }

    setIsConfigured(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // Run after the listener returns (awaiting inside it can deadlock)
        setTimeout(() => {
          fetchProfile(currentUser);
        }, 0);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Hear from the Google popup window when sign-in has finished
  useEffect(() => {
    async function onComplete() {
      const supabase = createClient();
      if (!supabase) return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
        setIsSigningIn(false);
      } else {
        window.location.reload();
      }
    }

    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "sb-auth-complete") {
        onComplete();
      }
    };
    window.addEventListener("message", onMessage);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("ns-auth");
      channel.onmessage = (e) => {
        if (e.data?.type === "sb-auth-complete") onComplete();
      };
    }

    return () => {
      window.removeEventListener("message", onMessage);
      channel?.close();
    };
  }, [fetchProfile]);

  // Once signed in: close the popup card and continue to the page they wanted
  useEffect(() => {
    if (!user) return;
    setIsSigningIn(false);
    setModalOpen(false);
    if (afterPath) {
      router.push(afterPath);
      setAfterPath(null);
    }
  }, [user, afterPath, router]);

  // Reset the button if the popup was closed without finishing
  useEffect(() => {
    if (!isSigningIn) return;
    const onFocus = () => setTimeout(() => setIsSigningIn(false), 1200);
    window.addEventListener("focus", onFocus);
    const t = setTimeout(() => setIsSigningIn(false), 120000);
    return () => {
      window.removeEventListener("focus", onFocus);
      clearTimeout(t);
    };
  }, [isSigningIn]);

  const openAuthModal = useCallback((reason?: string, path?: string) => {
    setModalReason(reason || "");
    setAfterPath(path || null);
    setModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setModalOpen(false);
    setAfterPath(null);
  }, []);

  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) {
      alert("Sign-in is not available right now.");
      return;
    }

    const origin = window.location.origin;
    const returnPath =
      afterPath || window.location.pathname + window.location.search;

    const redirectFlow = async () => {
      setIsSigningIn(true);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(returnPath)}`,
          queryParams: { prompt: "select_account" },
        },
      });
    };

    // Phones and small screens: go to Google and come straight back to this page
    const isMobile =
      /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      await redirectFlow();
      return;
    }

    // Computers: open Google in a small popup window.
    // The window must open right away (during the click) or browsers block it.
    const w = 500;
    const h = 650;
    const left = Math.max(0, Math.round(window.screenX + (window.outerWidth - w) / 2));
    const top = Math.max(0, Math.round(window.screenY + (window.outerHeight - h) / 2));
    const popup = window.open(
      "",
      "google-signin",
      `width=${w},height=${h},left=${left},top=${top}`
    );
    if (!popup) {
      await redirectFlow();
      return;
    }
    popup.document.write(
      '<p style="font-family:sans-serif;text-align:center;margin-top:40px">Opening Google...</p>'
    );
    setIsSigningIn(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/popup-done")}`,
        skipBrowserRedirect: true,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error || !data?.url) {
      popup.close();
      setIsSigningIn(false);
      return;
    }
    popup.location.href = data.url;
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  }

  async function updateInstagram(username: string | null, dismissed: boolean = true) {
    if (!profile) return;
    setProfile({
      ...profile,
      instagram_username: username,
      instagram_popup_dismissed: dismissed,
    });

    const supabase = createClient();
    if (supabase && user) {
      await supabase
        .from("members")
        .update({
          instagram_username: username,
          instagram_popup_dismissed: dismissed,
        })
        .eq("id", user.id);
    }
  }

  const isOwner = Boolean(
    profile?.is_owner || (user?.email && user.email.toLowerCase() === ownerEmail)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured,
        isOwner,
        isSigningIn,
        signInWithGoogle,
        openAuthModal,
        closeAuthModal,
        signOut,
        updateInstagram,
      }}
    >
      {children}
      {modalOpen && !user && (
        <AuthModal
          reason={modalReason}
          isSigningIn={isSigningIn}
          onGoogle={signInWithGoogle}
          onClose={closeAuthModal}
        />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
