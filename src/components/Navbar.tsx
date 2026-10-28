"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { Menu, X, Lock, ShieldCheck, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, isOwner, signInWithGoogle, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", public: true },
    { href: "/links", label: "Links", public: true },
    { href: "/contact", label: "Contact", public: true },
    { href: "/photos", label: "Photos", public: false },
    { href: "/research", label: "Research", public: false },
  ];

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#faf9f6]/85 dark:bg-[#0f0f10]/85 border-b border-neutral-200/60 dark:border-neutral-800/60 transition-colors">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-medium tracking-tight text-neutral-900 dark:text-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-sm"
        >
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100 group-hover:scale-125 transition-transform" />
          <span className="font-sans font-semibold">Narayanan Srikanth</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-wider font-medium text-neutral-600 dark:text-neutral-400">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 py-1 transition-colors ${
                  active
                    ? "text-neutral-950 dark:text-neutral-50 font-semibold"
                    : "hover:text-neutral-900 dark:hover:text-neutral-200"
                }`}
              >
                <span>{link.label}</span>
                {!link.public && !user && (
                  <Lock className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                )}
              </Link>
            );
          })}

          {/* Owner Admin link */}
          {isOwner && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 py-1 text-emerald-600 dark:text-emerald-400 transition-colors ${
                isActive("/admin") ? "font-semibold underline underline-offset-4" : "hover:text-emerald-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right side controls: Auth & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* User Status / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors text-neutral-800 dark:text-neutral-200"
                title={user.email || "Account"}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="max-w-[100px] truncate">
                  {profile?.display_name || user.email?.split("@")[0] || "Member"}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-800 text-xs z-50 animate-fade-in"
                >
                  <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                      {profile?.display_name || "Signed in"}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {user.email}
                    </p>
                    {profile?.instagram_username && (
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        @{profile.instagram_username}
                      </p>
                    )}
                  </div>

                  {isOwner && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-100 font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <UserIcon className="w-3 h-3" />
              <span>Sign in</span>
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800 bg-[#faf9f6] dark:bg-[#0f0f10] px-5 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between text-sm py-1.5 ${
                isActive(link.href)
                  ? "font-semibold text-neutral-950 dark:text-neutral-50"
                  : "text-neutral-600 dark:text-neutral-400"
              }`}
            >
              <span>{link.label}</span>
              {!link.public && !user && <Lock className="w-3.5 h-3.5 text-neutral-400" />}
            </Link>
          ))}
          {isOwner && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium py-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
