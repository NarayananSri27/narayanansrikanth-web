"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Footer() {
  const { user, isOwner, devSignInAsMember, devSignInAsOwner, signOut, isConfigured } =
    useAuth();

  return (
    <footer>
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Narayanan Srikanth</p>
        <ul>
          <li>
            <a
              href="https://github.com/NarayananSri27"
              target="_blank"
              rel="noopener noreferrer"
            >
              github
            </a>
          </li>
          <li>
            <Link href="/contact">contact</Link>
          </li>
          <li>
            <Link href="/links">links</Link>
          </li>
          <li>
            <Link href="/privacy">privacy</Link>
          </li>
        </ul>
      </div>

      {/* Dev role switcher for local testing */}
      {!isConfigured && (
        <div style={{ textAlign: "center", marginTop: "25px", fontSize: "11px", opacity: 0.6 }}>
          <span>sandbox mode: </span>
          {!user ? (
            <>
              <button
                onClick={devSignInAsMember}
                style={{
                  background: "transparent",
                  border: "0.5px dashed gray",
                  margin: "0 5px",
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                test member
              </button>
              <button
                onClick={devSignInAsOwner}
                style={{
                  background: "transparent",
                  border: "0.5px dashed gray",
                  margin: "0 5px",
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                test owner
              </button>
            </>
          ) : (
            <button
              onClick={signOut}
              style={{
                background: "transparent",
                border: "0.5px dashed gray",
                margin: "0 5px",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              reset to signed out ({user.email})
            </button>
          )}
        </div>
      )}
    </footer>
  );
}

