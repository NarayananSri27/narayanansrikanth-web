"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Lock,
  LogIn,
  Search,
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Tag,
  X,
  Code,
} from "lucide-react";

interface ResearchEntry {
  id: string;
  title: string;
  topic: string;
  date: string;
  abstract: string;
  tags: string[];
  content: string[];
  codeSnippet?: string;
  codeLang?: string;
}

const INITIAL_ENTRIES: ResearchEntry[] = [
  {
    id: "r1",
    title: "Non-Normal Tail Risk & Historical Drawdown Metrics",
    topic: "Quantitative Risk",
    date: "February 2026",
    abstract:
      "Evaluating empirical kurtosis and regime-shifting volatility clusters vs. Gaussian assumption in risk management.",
    tags: ["Risk Research", "Statistics", "Python"],
    content: [
      "Traditional financial risk models frequently rely on normal distributions for simplicity, but real-world market returns exhibit heavy negative skewness and leptokurtosis (fat tails).",
      "When assessing tail risk, standard Value at Risk (VaR) fails to capture the magnitude of losses beyond the chosen confidence cutoff. Conditional Value at Risk (CVaR / Expected Shortfall) provides a coherent risk measure that quantifies average losses in the tail.",
      "Key consideration: In low-liquidity regimes, correlation breakdown causes diversification benefits to deteriorate exactly when downside protection is required.",
    ],
    codeSnippet: `# Calculating Historical Expected Shortfall (CVaR)
import numpy as np

def calculate_cvar(returns, alpha=0.05):
    var_threshold = np.percentile(returns, alpha * 100)
    tail_losses = returns[returns <= var_threshold]
    return -np.mean(tail_losses)
`,
    codeLang: "python",
  },
  {
    id: "r2",
    title: "Kalman Filter Sensor Fusion for Aerospace Attitude Estimation",
    topic: "Aerospace & Guidance",
    date: "December 2025",
    abstract:
      "Integrating gyroscope rate integration with accelerometer gravity vectors for stable pitch and roll estimation.",
    tags: ["Control Theory", "Embedded", "C++"],
    content: [
      "MEMS gyroscopes offer low latency but suffer from unbounded integration drift over time. Accelerometers measure the gravity vector accurately over long intervals but are vulnerable to dynamic linear acceleration vibration.",
      "The discrete-time linear Kalman filter optimally balances these complimentary noise characteristics by continuously updating error covariance matrices and adjusting the Kalman gain.",
      "Next experimental phase: Implementing quaternion representation to eliminate gimbal lock during high-angle maneuvers in simulation.",
    ],
    codeSnippet: `// Predict Step: A Priori State Estimate
state_pred = F * state_prev + B * control_input;
P_pred = F * P_prev * F.transpose() + Q;

// Update Step: Innovation and Optimal Gain
Matrix K = P_pred * H.transpose() * (H * P_pred * H.transpose() + R).inverse();
state_updated = state_pred + K * (measurement - H * state_pred);
`,
    codeLang: "cpp",
  },
  {
    id: "r3",
    title: "Deterministic Memory Allocation in Low-Latency Service Pipelines",
    topic: "Software Architecture",
    date: "October 2025",
    abstract:
      "Eliminating garbage collection pauses and cache misses using contiguous circular buffers and arena allocators.",
    tags: ["Systems", "Low Latency", "Performance"],
    content: [
      "In high-throughput message processing, heap allocation in the critical path introduces unpredictable latency jitter caused by page faults and allocator lock contention.",
      "Pre-allocating contiguous memory pools (arenas or fixed-size ring buffers) ensures O(1) allocation and sequential CPU cache line prefetching.",
    ],
  },
];

const TOPICS = [
  "All",
  "Quantitative Risk",
  "Aerospace & Guidance",
  "Software Architecture",
];

export default function ResearchPage() {
  const { user, isOwner, signInWithGoogle, isLoading } = useAuth();
  const [entries, setEntries] = useState<ResearchEntry[]>(INITIAL_ENTRIES);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(INITIAL_ENTRIES[0].id);

  // Owner New Entry Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Quantitative Risk");
  const [newAbstract, setNewAbstract] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newBody, setNewBody] = useState("");

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
            Private Research Notebook
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            This notebook contains working notes, code snippets, and research hypotheses across quantitative finance, aerospace systems, and software engineering.
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
          Available to all authenticated Google accounts.
        </p>
      </div>
    );
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesTopic =
      selectedTopic === "All" || entry.topic === selectedTopic;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      entry.title.toLowerCase().includes(query) ||
      entry.abstract.toLowerCase().includes(query) ||
      entry.tags.some((t) => t.toLowerCase().includes(query));
    return matchesTopic && matchesSearch;
  });

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEntry: ResearchEntry = {
      id: `r-${Date.now()}`,
      title: newTitle,
      topic: newTopic,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      abstract: newAbstract || "Research working note.",
      tags: newTags ? newTags.split(",").map((s) => s.trim()) : ["Engineering"],
      content: newBody
        ? newBody.split("\n\n").filter(Boolean)
        : ["No content provided."],
    };

    setEntries([newEntry, ...entries]);
    setExpandedId(newEntry.id);
    setNewTitle("");
    setNewAbstract("");
    setNewBody("");
    setNewTags("");
    setIsModalOpen(false);
  };

  const handleDeleteEntry = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this research note?")) {
      setEntries(entries.filter((entry) => entry.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-neutral-900 dark:text-neutral-100">
            Research Notebook
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Private archive of engineering research, quantitative models, and technical notes.
          </p>
        </div>

        {/* Owner Create Note */}
        {isOwner && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Research Note</span>
          </button>
        )}
      </header>

      {/* Controls: Search and Topic Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes, topics, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/40 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                selectedTopic === topic
                  ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-neutral-100 dark:bg-neutral-800/60"
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-5">
        {filteredEntries.length === 0 ? (
          <p className="py-12 text-center text-xs text-neutral-400 font-mono">
            No research notes matching criteria.
          </p>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <article
                key={entry.id}
                className="rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/40 overflow-hidden transition-all shadow-sm"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-5 cursor-pointer hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {entry.topic}
                        </span>
                        <span>·</span>
                        <span>{entry.date}</span>
                      </div>

                      <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100 hover:underline underline-offset-2">
                        {entry.title}
                      </h2>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {entry.abstract}
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        onClick={(e) => handleDeleteEntry(entry.id, e)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                    {entry.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] font-mono rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded Full Content */}
                {isExpanded && (
                  <div className="px-5 pb-6 pt-2 border-t border-neutral-100 dark:border-neutral-800/60 space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                    {entry.content.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}

                    {entry.codeSnippet && (
                      <div className="mt-4 rounded-lg bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto border border-neutral-800">
                        <div className="text-[10px] text-neutral-400 mb-2 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <Code className="w-3 h-3" />
                          <span>{entry.codeLang || "code"}</span>
                        </div>
                        <pre>
                          <code>{entry.codeSnippet}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Owner Create Entry Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg p-6 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Create Research Note (Owner)</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Non-Linear State Filtering Dynamics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Topic
                </label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                >
                  {TOPICS.filter((t) => t !== "All").map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Abstract / Short Summary
                </label>
                <textarea
                  placeholder="Concise hypothesis or takeaway..."
                  value={newAbstract}
                  onChange={(e) => setNewAbstract(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Full Notes & Paragraphs (Separate paragraphs with double enter)
                </label>
                <textarea
                  placeholder="Detailed breakdown, derivations, conclusions..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  rows={5}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-sans"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Kalman, Simulation, Python"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
