import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/data/content";
import { ArrowUpRight, ArrowRight, Sparkles, BookOpen, Camera, Shield } from "lucide-react";

export default function HomePage() {
  const { author, interests, currently, featuredProjects } = siteContent;

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-8 pt-2">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{author.status}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-neutral-900 dark:text-neutral-100 font-medium">
              {author.name}
            </h1>

            <p className="text-base text-neutral-700 dark:text-neutral-300 font-sans leading-relaxed">
              Engineering student at{" "}
              <span className="font-medium text-neutral-900 dark:text-neutral-100 underline decoration-neutral-300 dark:decoration-neutral-700 underline-offset-4">
                {author.university}
              </span>
              , focusing on software systems, quantitative finance, aerospace systems, and research.
            </p>
          </div>

          {/* Profile Photograph Placeholder */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-sm">
              <Image
                src={author.avatarUrl}
                alt={author.name}
                width={120}
                height={120}
                className="w-full h-full object-cover grayscale contrast-125"
                priority
              />
            </div>
          </div>
        </div>

        {/* Narrative Bio */}
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
          {author.bio.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* Areas of Interest */}
      <section className="space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Areas of Focus & Curiosity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-900/30">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              <span>Engineering & Technology</span>
            </h3>
            <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400 text-xs">
              {interests.technical.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-neutral-300 dark:text-neutral-700">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-lg border border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-900/30">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              <span>Arts, Media & Interests</span>
            </h3>
            <ul className="space-y-1.5 text-neutral-600 dark:text-neutral-400 text-xs">
              {interests.creative.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-neutral-300 dark:text-neutral-700">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Currently Section (Exploring & Goals) */}
      <section className="space-y-5">
        <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Currently
        </h2>

        <div className="border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl divide-y divide-neutral-200/60 dark:divide-neutral-800/60 bg-white/40 dark:bg-neutral-900/30">
          <div className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
              <span>Exploring</span>
            </div>
            <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
              {currently.exploring.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-neutral-400">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase">
              <BookOpen className="w-3.5 h-3.5 text-neutral-400" />
              <span>Reading & Study</span>
            </div>
            <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
              {currently.reading.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-neutral-400">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase">
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <span>Current Goals</span>
            </div>
            <ul className="space-y-1 text-xs text-neutral-700 dark:text-neutral-300">
              {currently.goals.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-neutral-400">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Selected Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Selected Work & Projects
          </h2>
          <Link
            href="/links"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1 transition-colors"
          >
            <span>All profiles</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {featuredProjects.map((project, idx) => (
            <article
              key={idx}
              className="group p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/40 dark:bg-neutral-900/30 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 group-hover:underline underline-offset-2">
                      {project.title}
                    </h3>
                    <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                      {project.year}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xl">
                    {project.description}
                  </p>
                </div>

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-md transition-colors"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                {project.tags.map((tag, tagIdx) => (
                  <span
                    key={tagIdx}
                    className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Private Sections Banner (Photos & Research) */}
      <section className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-500">
          <Camera className="w-3.5 h-3.5" />
          <span>Private Sections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <Link
            href="/photos"
            className="group block p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
          >
            <p className="text-xs font-mono text-neutral-400 uppercase">Gallery</p>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1 group-hover:underline underline-offset-2 flex items-center justify-between">
              <span>Personal Photos</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              Photographs, darkroom scans, and visual moments. Available to signed-in visitors.
            </p>
          </Link>

          <Link
            href="/research"
            className="group block p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
          >
            <p className="text-xs font-mono text-neutral-400 uppercase">Notebook</p>
            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1 group-hover:underline underline-offset-2 flex items-center justify-between">
              <span>Research Notes</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </h4>
            <p className="text-xs text-neutral-500 mt-1">
              Private research notebook on quantitative finance, aerospace systems, and ideas.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
