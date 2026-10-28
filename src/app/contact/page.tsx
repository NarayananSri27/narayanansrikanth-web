"use client";

import { useState } from "react";
import { siteContent } from "@/data/content";
import { Mail, Copy, Check, ArrowUpRight, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const { contact, links, author } = siteContent;
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contact.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 max-w-2xl">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100">
          Contact & Correspondence
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          The best way to reach me is by email. I appreciate genuine inquiries, research questions, and discussions on engineering.
        </p>
      </header>

      {/* Primary Email Card */}
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-500">
          <Mail className="w-3.5 h-3.5" />
          <span>Direct Email</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80">
          <code className="text-sm font-mono text-neutral-900 dark:text-neutral-100 selection:bg-neutral-300">
            {contact.email}
          </code>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-neutral-800 dark:text-neutral-200"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            >
              <span>Compose</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="space-y-1 text-xs text-neutral-500">
          <p>{contact.note}</p>
          <p className="font-mono text-[11px] text-neutral-400">
            {contact.responseTime}
          </p>
        </div>
      </div>

      {/* Academic & Professional Profiles */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Other Profiles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {links.filter((l) => l.category === "primary" || l.category === "code").map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-900/30 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                  {l.title}
                </p>
                <p className="text-[11px] text-neutral-500 truncate">{l.subtitle}</p>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
