"use client";

import Link from "next/link";
import { siteContent } from "@/data/content";
import { useAuth } from "./AuthProvider";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  const { user, isOwner, devSignInAsMember, devSignInAsOwner, signOut, isConfigured } =
    useAuth();

  return (
    <footer className="mt-24 border-t border-neutral-200/60 dark:border-neutral-800/60 py-12 transition-colors">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {siteContent.author.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Engineering at McGill University · Montréal, QC
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-neutral-600 dark:text-neutral-400">
            {siteContent.links.slice(0, 3).map((link) => (
              <a
                key={link.title}
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-0.5 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <span>{link.title}</span>
                {link.url.startsWith("http") && <ArrowUpRight className="w-3 h-3" />}
              </a>
            ))}
            <Link
              href="/links"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              All Links
            </Link>
          </div>
        </div>

        {/* Privacy Note & Authenticated Logging Notice */}
        <div className="mt-8 pt-6 border-t border-neutral-200/40 dark:border-neutral-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[11px] text-neutral-400 dark:text-neutral-500 font-mono">
          <p>© {new Date().getFullYear()} Narayanan Srikanth. Designed with typography & simplicity.</p>
          <p>Authenticated page visits are logged for owner visibility.</p>
        </div>

        {/* Local Dev & Offline Preview Switcher */}
        {!isConfigured && (
          <div className="mt-8 p-3 rounded-lg border border-dashed border-amber-300 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-sans">
                <strong>Dev Sandbox Mode:</strong> Supabase keys not detected yet in .env.local. You can test roles below:
              </span>
              <div className="flex items-center gap-2">
                {!user ? (
                  <>
                    <button
                      onClick={devSignInAsMember}
                      className="px-2 py-1 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded text-[11px] font-medium hover:border-neutral-500"
                    >
                      Test Member
                    </button>
                    <button
                      onClick={devSignInAsOwner}
                      className="px-2 py-1 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded text-[11px] font-medium"
                    >
                      Test Owner
                    </button>
                  </>
                ) : (
                  <button
                    onClick={signOut}
                    className="px-2 py-1 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-900 rounded text-[11px] font-medium"
                  >
                    Reset to Signed Out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
