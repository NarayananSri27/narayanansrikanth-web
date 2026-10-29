"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
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
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateInstagram: (username: string | null, dismissed: boolean) => Promise<void>;
  // Dev mode toggle for local preview before Supabase is connected
  devSignInAsMember: () => void;
  devSignInAsOwner: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isConfigured: false,
  isOwner: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  updateInstagram: async () => {},
  devSignInAsMember: () => {},
  devSignInAsOwner: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const ownerEmail = (
    process.env.NEXT_PUBLIC_OWNER_EMAIL || "narayanan.srikanth@example.com"
  ).toLowerCase();

  useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      // Supabase is not configured yet with valid credentials.
      // Check localStorage for any active dev mock session to enable testing!
      setIsConfigured(false);
      const savedMock = typeof window !== "undefined" ? localStorage.getItem("ns_mock_auth") : null;
      if (savedMock) {
        try {
          const parsed = JSON.parse(savedMock);
          setUser(parsed.user);
          setProfile(parsed.profile);
        } catch {
          // ignore error
        }
      }
      setIsLoading(false);
      return;
    }

    setIsConfigured(true);

    // Initial session check
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
        setTimeout(() => { fetchProfile(currentUser); }, 0);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(currentUser: User) {
    const supabase = createClient();
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      const userEmail = (currentUser.email || "").toLowerCase();
      const isOwnerAccount = userEmail === ownerEmail;

      if (data && !error) {
        setProfile({
          ...data,
          is_owner: isOwnerAccount,
        });
      } else {
        // Create initial profile row if missing
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
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    if (!supabase) {
      alert(
        "Supabase credentials are not configured yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file, or use Preview Mode below to test the UI."
      );
      return;
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  }

  async function signOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ns_mock_auth");
    }
  }

  async function updateInstagram(
    username: string | null,
    dismissed: boolean = true
  ) {
    if (profile) {
      const updated = {
        ...profile,
        instagram_username: username,
        instagram_popup_dismissed: dismissed,
      };
      setProfile(updated);

      const supabase = createClient();
      if (supabase && user) {
        await supabase
          .from("members")
          .update({
            instagram_username: username,
            instagram_popup_dismissed: dismissed,
          })
          .eq("id", user.id);
      } else if (typeof window !== "undefined") {
        localStorage.setItem(
          "ns_mock_auth",
          JSON.stringify({ user, profile: updated })
        );
      }
    }
  }

  function devSignInAsMember() {
    const mockUser = {
      id: "mock-user-12345",
      email: "visitor@mcgill.ca",
      user_metadata: {
        full_name: "McGill Engineering Peer",
        avatar_url: null,
      },
    } as unknown as User;

    const mockProfile: Profile = {
      id: "mock-user-12345",
      email: "visitor@mcgill.ca",
      display_name: "McGill Engineering Peer",
      avatar_url: null,
      instagram_username: null,
      instagram_popup_dismissed: false,
      is_owner: false,
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ns_mock_auth",
        JSON.stringify({ user: mockUser, profile: mockProfile })
      );
    }
  }

  function devSignInAsOwner() {
    const mockUser = {
      id: "mock-owner-00001",
      email: ownerEmail,
      user_metadata: {
        full_name: "Narayanan Srikanth",
        avatar_url: null,
      },
    } as unknown as User;

    const mockProfile: Profile = {
      id: "mock-owner-00001",
      email: ownerEmail,
      display_name: "Narayanan Srikanth",
      avatar_url: null,
      instagram_username: "narayanan.s",
      instagram_popup_dismissed: true,
      is_owner: true,
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
    };

    setUser(mockUser);
    setProfile(mockProfile);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ns_mock_auth",
        JSON.stringify({ user: mockUser, profile: mockProfile })
      );
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
        signInWithGoogle,
        signOut,
        updateInstagram,
        devSignInAsMember,
        devSignInAsOwner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

