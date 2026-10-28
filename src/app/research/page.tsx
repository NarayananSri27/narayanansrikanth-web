"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Plus, Trash2 } from "lucide-react";

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
    title: "non-normal tail risk & historical drawdown metrics",
    topic: "Quantitative Risk",
    date: "February 2026",
    abstract:
      "Evaluating empirical kurtosis and regime-shifting volatility clusters vs. Gaussian assumption in risk management.",
    tags: ["Risk Research", "Statistics", "Python"],
    content: [
      "Traditional financial risk models frequently rely on normal distributions for mathematical tractability, but empirical returns display negative skewness and heavy leptokurtosis.",
      "Value at Risk (VaR) does not satisfy subadditivity and neglects the magnitude of tail events. Conditional Value at Risk (CVaR) offers a coherent alternative by averaging losses strictly within the tail percentile.",
      "In stressed liquidity environments, assets experience correlation breakdown where diversification deteriorates when protection is most needed.",
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
    title: "kalman filter sensor fusion for aerospace attitude estimation",
    topic: "Aerospace Guidance",
    date: "December 2025",
    abstract:
      "Integrating gyroscope rate integration with accelerometer gravity vectors for stable pitch and roll estimation.",
    tags: ["Control Theory", "Embedded", "C++"],
    content: [
      "MEMS gyroscopes offer low latency but suffer from unbounded integration drift over time. Accelerometers measure the gravity vector accurately over long intervals but are vulnerable to dynamic linear acceleration vibration.",
      "The discrete-time linear Kalman filter optimally balances these complimentary noise characteristics by continuously updating error covariance matrices and adjusting the Kalman gain.",
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
    title: "deterministic memory allocation in low-latency systems",
    topic: "Software Architecture",
    date: "October 2025",
    abstract:
      "Eliminating garbage collection pauses and cache misses using contiguous circular buffers and arena allocators.",
    tags: ["Systems", "Low Latency"],
    content: [
      "In high-throughput message processing, heap allocation in the critical path introduces unpredictable latency jitter caused by page faults and allocator lock contention.",
      "Pre-allocating contiguous memory pools (arenas or fixed-size ring buffers) ensures O(1) allocation and sequential CPU cache line prefetching.",
    ],
  },
];

export default function ResearchPage() {
  const { user, isOwner, signInWithGoogle, isLoading } = useAuth();
  const [entries, setEntries] = useState<ResearchEntry[]>(INITIAL_ENTRIES);
  const [expandedId, setExpandedId] = useState<string | null>(INITIAL_ENTRIES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("Quantitative Risk");
  const [newBody, setNewBody] = useState("");

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p style={{ fontWeight: 100 }}>loading...</p>
      </div>
    );
  }

  // Signed out restriction prompt
  if (!user) {
    return (
      <div style={{ maxWidth: "600px", margin: "auto", textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontWeight: 100, marginBottom: "15px" }}>research</h1>
        <p className="subtitle">engineering notes, models, and project ideas</p>
        <p style={{ fontWeight: 200, fontSize: "16px", marginBottom: "30px" }}>
          This notebook is private. Sign in with Google to explore.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          style={{
            background: "transparent",
            color: "inherit",
            border: "0.5px dashed currentColor",
            padding: "8px 24px",
            fontSize: "18px",
            fontWeight: 200,
            cursor: "pointer",
          }}
        >
          sign in with google
        </button>
      </div>
    );
  }

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEntry: ResearchEntry = {
      id: `r-${Date.now()}`,
      title: newTitle.toLowerCase(),
      topic: newTopic,
      date: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      abstract: "",
      tags: ["Engineering"],
      content: newBody ? newBody.split("\n\n").filter(Boolean) : ["No content."],
    };

    setEntries([newEntry, ...entries]);
    setExpandedId(newEntry.id);
    setNewTitle("");
    setNewBody("");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this entry?")) {
      setEntries(entries.filter((entry) => entry.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "0 20px" }}>
      <h1
        style={{
          textAlign: "center",
          fontWeight: 100,
          marginTop: "30px",
          marginBottom: "10px",
        }}
      >
        research
      </h1>
      <p className="subtitle">working notes, quantitative models, and ideas</p>

      {isOwner && (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: "transparent",
              color: "inherit",
              border: "0.5px dashed currentColor",
              padding: "4px 14px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            + new note (owner)
          </button>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        {entries.map((entry) => {
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              style={{
                marginBottom: "35px",
                paddingBottom: "25px",
                borderBottom: "0.5px solid var(--hr-color)",
              }}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "22px",
                      fontWeight: 200,
                      borderBottom: "0.5px dashed currentColor",
                      display: "inline-block",
                    }}
                  >
                    {entry.title}
                  </h3>
                  <p style={{ margin: "5px 0 0 0", fontSize: "13px", opacity: 0.6 }}>
                    {entry.topic} · {entry.date}
                  </p>
                </div>

                {isOwner && (
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    style={{ background: "none", border: "none", color: "inherit", opacity: 0.5, cursor: "pointer" }}
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {isExpanded && (
                <div style={{ marginTop: "18px", fontSize: "16px", lineHeight: "1.6em" }}>
                  {entry.content.map((p, idx) => (
                    <p key={idx} style={{ marginBottom: "14px", fontWeight: 200 }}>
                      {p}
                    </p>
                  ))}

                  {entry.codeSnippet && (
                    <pre
                      style={{
                        padding: "15px",
                        background: "rgba(0,0,0,0.06)",
                        fontSize: "13px",
                        overflowX: "auto",
                        borderLeft: "2px solid var(--hr-color)",
                        fontFamily: "monospace",
                        marginTop: "15px",
                      }}
                    >
                      <code>{entry.codeSnippet}</code>
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "var(--bg-color)",
              color: "var(--text-color)",
              padding: "25px",
              maxWidth: "500px",
              width: "100%",
              border: "1px solid var(--hr-color)",
            }}
          >
            <h3 style={{ fontWeight: 100, marginTop: 0 }}>Create Research Note</h3>
            <form onSubmit={handleCreateEntry} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="text"
                placeholder="Title..."
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "0.5px solid var(--hr-color)",
                  color: "inherit",
                }}
              />
              <textarea
                placeholder="Notes and paragraphs..."
                rows={6}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                style={{
                  padding: "8px",
                  background: "transparent",
                  border: "0.5px solid var(--hr-color)",
                  color: "inherit",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
                >
                  cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "transparent",
                    border: "0.5px solid currentColor",
                    padding: "4px 12px",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  save note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
