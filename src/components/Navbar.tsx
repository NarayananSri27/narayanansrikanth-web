"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { Lock } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { user, isOwner, signOut, signInWithGoogle } = useAuth();

  const isSelected = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <>
      <nav>
        <div style={{ fontWeight: 400 }}>
          <Link id="site-title" href="/">
            Narayanan Srikanth
          </Link>
        </div>

        <ul id="navbar">
          <li className={`nav-item ${isSelected("/photos") ? "selected" : ""}`}>
            <Link href="/photos" className="inline-flex items-center gap-1">
              <span>pics</span>
              {!user && <Lock className="w-2.5 h-2.5 opacity-60" />}
            </Link>
          </li>
          <li className={`nav-item ${isSelected("/research") ? "selected" : ""}`}>
            <Link href="/research" className="inline-flex items-center gap-1">
              <span>research</span>
              {!user && <Lock className="w-2.5 h-2.5 opacity-60" />}
            </Link>
          </li>
          <li className={`nav-item ${isSelected("/links") ? "selected" : ""}`}>
            <Link href="/links">links</Link>
          </li>
          <li className={`nav-item ${isSelected("/contact") ? "selected" : ""}`}>
            <Link href="/contact">contact</Link>
          </li>
          {isOwner && (
            <li className={`nav-item ${isSelected("/admin") ? "selected" : ""}`}>
              <Link href="/admin" style={{ color: "rgb(0, 204, 204)" }}>
                admin
              </Link>
            </li>
          )}
          {user ? (
            <li className="nav-item">
              <button
                onClick={() => signOut()}
                className="hover:opacity-70 bg-transparent border-none p-0 text-inherit font-inherit cursor-pointer"
                title={`Signed in as ${user.email}`}
              >
                sign out
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <button
                onClick={() => signInWithGoogle()}
                className="hover:opacity-70 bg-transparent border-none p-0 text-inherit font-inherit cursor-pointer"
              >
                sign in
              </button>
            </li>
          )}
        </ul>

        <ThemeToggle />
      </nav>
      <hr />
    </>
  );
}
