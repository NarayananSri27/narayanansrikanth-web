import { siteContent } from "@/data/content";
import { ArrowUpRight, Github, Linkedin, Mail, ExternalLink, Globe } from "lucide-react";

export const metadata = {
  title: "Links — Narayanan Srikanth",
  description: "Important links, profiles, and external resources for Narayanan Srikanth.",
};

export default function LinksPage() {
  const { links, author } = siteContent;

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case "github":
        return <Github className="w-4 h-4" />;
      case "linkedin":
        return <Linkedin className="w-4 h-4" />;
      case "mail":
        return <Mail className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-10 max-w-2xl">
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100">
          Links & Profiles
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          A directory of my presence across the web, code repositories, and external resources.
        </p>
      </header>

      <div className="space-y-3">
        {links.map((link, idx) => (
          <a
            key={idx}
            href={link.url}
            target={link.url.startsWith("http") ? "_blank" : undefined}
            rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
            className="group flex items-center justify-between p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/40 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all hover:translate-x-0.5"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:scale-105 transition-transform">
                {getIcon(link.icon)}
              </div>
              <div>
                <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {link.title}
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {link.subtitle}
                </p>
              </div>
            </div>

            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-100 transition-colors" />
          </a>
        ))}
      </div>

      <div className="pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 text-xs text-neutral-500 space-y-1">
        <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
          How to update
        </p>
        <p>
          You can update, add, or reorder links anytime directly in{" "}
          <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">
            src/data/content.ts
          </code>
          .
        </p>
      </div>
    </div>
  );
}
