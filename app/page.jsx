"use client";

/**
 * app/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Yu-Gi-Oh! Tournament Deck Validator — REDESIGNED Premium Gaming UI
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── SVG Icon Components ───────────────────────────────────────────────────────

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const IconLoader = ({ className = "w-5 h-5 animate-spin" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const IconShield = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const IconWarning = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);

const IconChevronRight = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

const IconStar = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ archetype, result, onClose }) {
  const passCount = result.results?.filter((r) => r.pass).length ?? 0;
  const totalCount = result.results?.length ?? 0;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          background:
            "linear-gradient(135deg, #050d1a 0%, #0a1628 50%, #050d1a 100%)",
          border: "1px solid rgba(250,204,21,0.3)",
          borderRadius: "16px",
          boxShadow:
            "0 0 60px rgba(250,204,21,0.15), 0 0 120px rgba(234,179,8,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Corner decorations */}
        <div
          className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(250,204,21,0.2) 0%, transparent 60%)",
            borderRadius: "16px 0 0 0",
          }}
        />
        <div
          className="absolute top-0 right-0 w-16 h-16 pointer-events-none"
          style={{
            background:
              "linear-gradient(225deg, rgba(250,204,21,0.2) 0%, transparent 60%)",
            borderRadius: "0 16px 0 0",
          }}
        />

        <div className="p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <IconX className="w-4 h-4 text-gray-400" />
          </button>

          {/* Header */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background: "rgba(250,204,21,0.15)",
                border: "1px solid rgba(250,204,21,0.3)",
                color: "#facc15",
              }}
            >
              <IconStar className="w-3 h-3" />
              Archetype Details
            </div>
            <h2
              className="text-4xl font-black mb-3"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                background: "linear-gradient(135deg, #fff 0%, #facc15 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              {result.archetypeLabel ?? archetype}
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(148,163,184,0.9)" }}
            >
              {result.archetypeDescription ?? "Archetype condition analysis"}
            </p>
          </div>

          {/* Stats */}
          <div
            className="mb-6 p-5 rounded-xl"
            style={{
              background: "rgba(250,204,21,0.06)",
              border: "1px solid rgba(250,204,21,0.15)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs uppercase tracking-widest font-bold"
                style={{ color: "rgba(148,163,184,0.8)" }}
              >
                Conditions Passed
              </span>
              <span
                className="text-2xl font-black"
                style={{
                  color:
                    passCount === totalCount
                      ? "#34d399"
                      : passCount > 0
                        ? "#facc15"
                        : "#f87171",
                }}
              >
                {passCount} / {totalCount}
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${totalCount > 0 ? (passCount / totalCount) * 100 : 0}%`,
                  background:
                    passCount === totalCount
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : "linear-gradient(90deg, #f59e0b, #facc15)",
                  boxShadow:
                    passCount === totalCount
                      ? "0 0 12px rgba(52,211,153,0.5)"
                      : "0 0 12px rgba(250,204,21,0.5)",
                }}
              />
            </div>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <h3
              className="text-xs uppercase tracking-widest font-bold mb-4"
              style={{ color: "rgba(250,204,21,0.7)" }}
            >
              Condition Breakdown
            </h3>
            {result.results?.map((condition, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl transition-all"
                style={{
                  background: condition.pass
                    ? "rgba(52,211,153,0.06)"
                    : "rgba(248,113,113,0.06)",
                  border: `1px solid ${condition.pass ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                    style={{
                      background: condition.pass
                        ? "rgba(52,211,153,0.2)"
                        : "rgba(248,113,113,0.2)",
                    }}
                  >
                    {condition.pass ? (
                      <IconCheck
                        className="w-3.5 h-3.5"
                        style={{ color: "#34d399" }}
                      />
                    ) : (
                      <IconX
                        className="w-3.5 h-3.5"
                        style={{ color: "#f87171" }}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm font-semibold leading-snug"
                      style={{ color: condition.pass ? "#6ee7b7" : "#fca5a5" }}
                    >
                      {condition.message}
                    </p>
                    {condition.detail && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "rgba(148,163,184,0.6)" }}
                      >
                        {condition.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Archetype Card Component ─────────────────────────────────────────────────

function ArchetypeCard({ archetypeKey, result, onClickDetails }) {
  const passCount = result.results?.filter((r) => r.pass).length ?? 0;
  const totalCount = result.results?.length ?? 0;
  const pct = totalCount > 0 ? (passCount / totalCount) * 100 : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onClickDetails(archetypeKey, result)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative text-left w-full transition-all duration-300"
      style={{ transform: hovered ? "translateY(-2px)" : "none" }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-px rounded-xl transition-all duration-500"
        style={{
          background:
            "linear-gradient(135deg, rgba(52,211,153,0.5), rgba(16,185,129,0.3), rgba(52,211,153,0.2))",
          opacity: hovered ? 1 : 0,
          borderRadius: "12px",
        }}
      />
      <div
        className="relative p-5 rounded-xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(5,20,40,0.9) 0%, rgba(8,25,50,0.95) 100%)",
          border: "1px solid rgba(52,211,153,0.3)",
          boxShadow: hovered
            ? "0 0 30px rgba(52,211,153,0.2), 0 0 60px rgba(52,211,153,0.08)"
            : "none",
        }}
      >
        {/* BG pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(52,211,153,0.1) 10px, rgba(52,211,153,0.1) 11px)",
          }}
        />

        {/* Top row */}
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <div
              className="text-xs uppercase tracking-widest font-bold mb-1"
              style={{ color: "rgba(52,211,153,0.6)" }}
            >
              Archetype
            </div>
            <h3
              className="text-lg font-black leading-tight"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                color: hovered ? "#fff" : "#e2e8f0",
                letterSpacing: "-0.01em",
                transition: "color 0.2s",
              }}
            >
              {result.archetypeLabel ?? archetypeKey}
            </h3>
          </div>
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(52,211,153,0.2)",
              border: "1px solid rgba(52,211,153,0.4)",
              boxShadow: "0 0 16px rgba(52,211,153,0.3)",
            }}
          >
            <IconCheck className="w-5 h-5" style={{ color: "#34d399" }} />
          </div>
        </div>

        {/* Progress */}
        <div className="relative space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span style={{ color: "rgba(148,163,184,0.7)" }}>Conditions</span>
            <span className="font-bold" style={{ color: "#34d399" }}>
              {passCount}/{totalCount}
            </span>
          </div>
          <div
            className="w-full h-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                boxShadow: "0 0 8px rgba(52,211,153,0.5)",
              }}
            />
          </div>
        </div>

        {/* Click prompt */}
        <div
          className="relative flex items-center gap-1.5 text-xs font-semibold transition-all duration-200"
          style={{
            color: hovered ? "rgba(52,211,153,0.9)" : "rgba(148,163,184,0.4)",
          }}
        >
          View details <IconChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </button>
  );
}

// ─── Failed Archetype Row ─────────────────────────────────────────────────────

function FailedArchetypeRow({ archetypeKey, result, onClickDetails }) {
  const passCount = result.results?.filter((r) => r.pass).length ?? 0;
  const totalCount = result.results?.length ?? 0;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onClickDetails(archetypeKey, result)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full text-left flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200"
      style={{
        background: hovered ? "rgba(248,113,113,0.06)" : "transparent",
        border: `1px solid ${hovered ? "rgba(248,113,113,0.2)" : "rgba(255,255,255,0.05)"}`,
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(248,113,113,0.1)",
          border: "1px solid rgba(248,113,113,0.25)",
        }}
      >
        <IconX className="w-4 h-4" style={{ color: "#f87171" }} />
      </div>
      <div className="flex-1 min-w-0">
        <span
          className="text-sm font-bold"
          style={{ color: hovered ? "#fca5a5" : "#94a3b8" }}
        >
          {result.archetypeLabel ?? archetypeKey}
        </span>
      </div>
      <div
        className="flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          background: "rgba(248,113,113,0.1)",
          color: "#f87171",
          border: "1px solid rgba(248,113,113,0.2)",
        }}
      >
        {passCount}/{totalCount}
      </div>
      <IconChevronRight
        className="w-3.5 h-3.5 flex-shrink-0"
        style={{ color: "rgba(148,163,184,0.3)" }}
      />
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, glow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-6 text-center transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(5,15,30,0.95) 0%, rgba(8,20,40,0.9) 100%)",
        border: `1px solid ${hovered ? color + "60" : color + "25"}`,
        boxShadow: hovered ? `0 0 30px ${glow}30, 0 0 60px ${glow}10` : "none",
        transform: hovered ? "translateY(-3px)" : "none",
      }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div
        className="text-4xl font-black mb-1.5"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "none",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        className="text-xs uppercase tracking-widest font-bold"
        style={{ color: "rgba(148,163,184,0.6)" }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function HomePage() {
  const [deckString, setDeckString] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [validateBtnHover, setValidateBtnHover] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/cards")
      .then((r) => r.json())
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, []);

  const handleValidate = useCallback(async () => {
    if (!deckString.trim()) {
      setError("Please paste your deck string (YDKE or .ydk format).");
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);
    setSelectedArchetype(null);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckString: deckString.trim(),
          validateAll: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `Error ${res.status}`);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deckString]);

  const handleClear = () => {
    setDeckString("");
    setResults(null);
    setError("");
    setSelectedArchetype(null);
    setSelectedResult(null);
    textareaRef.current?.focus();
  };

  const passedArchetypes = results?.results
    ? Object.entries(results.results)
        .filter(([, r]) => r.overallPass)
        .map(([key, r]) => ({ key, result: r }))
    : [];

  const failedArchetypes = results?.results
    ? Object.entries(results.results)
        .filter(([, r]) => !r.overallPass)
        .map(([key, r]) => ({ key, result: r }))
    : [];

  return (
    <>
      <div
        className="min-h-screen relative"
        style={{ background: "#030810", color: "#e2e8f0" }}
      >
        {/* ══════════════════════════════════════════════════
            BACKGROUND LAYER — Duel Arena Environment
        ══════════════════════════════════════════════════ */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {/* Duel grid floor */}
          <div className="duel-grid absolute inset-0" />

          {/* Primary atmosphere orbs */}
          <div
            className="absolute animate-pulse-glow"
            style={{
              top: "-15%",
              right: "-10%",
              width: "700px",
              height: "700px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(234,179,8,0.12) 0%, rgba(234,179,8,0.04) 40%, transparent 70%)",
              animation: "pulse-glow 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: "-20%",
              left: "-15%",
              width: "800px",
              height: "800px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)",
              animation: "pulse-glow 8s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute"
            style={{
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)",
              animation: "pulse-glow 10s ease-in-out infinite 4s",
            }}
          />

          {/* Floating card silhouettes */}
          <div
            className="animate-float-slow absolute opacity-[0.04]"
            style={{
              top: "10%",
              right: "5%",
              width: "120px",
              height: "168px",
              border: "2px solid rgba(250,204,21,0.8)",
              borderRadius: "8px",
              background: "rgba(250,204,21,0.05)",
              transform: "rotate(12deg)",
            }}
          />
          <div
            className="animate-float-med absolute opacity-[0.03]"
            style={{
              top: "55%",
              right: "8%",
              width: "90px",
              height: "126px",
              border: "2px solid rgba(99,102,241,0.8)",
              borderRadius: "8px",
              background: "rgba(99,102,241,0.05)",
              transform: "rotate(-8deg)",
            }}
          />
          <div
            className="animate-float-slow absolute opacity-[0.04]"
            style={{
              bottom: "15%",
              left: "3%",
              width: "100px",
              height: "140px",
              border: "2px solid rgba(6,182,212,0.8)",
              borderRadius: "8px",
              background: "rgba(6,182,212,0.05)",
              transform: "rotate(-15deg)",
              animationDelay: "3s",
            }}
          />
          <div
            className="animate-float-med absolute opacity-[0.03]"
            style={{
              top: "25%",
              left: "6%",
              width: "80px",
              height: "112px",
              border: "1.5px solid rgba(250,204,21,0.6)",
              borderRadius: "8px",
              transform: "rotate(6deg)",
              animationDelay: "2s",
            }}
          />

          {/* Spinning holographic ring */}
          <div
            className="animate-spin-slow absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "900px",
              height: "900px",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(250,204,21,0.04)",
              borderRadius: "50%",
              borderTopColor: "rgba(250,204,21,0.12)",
            }}
          />
          <div
            className="animate-spin-slow-rev absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "700px",
              height: "700px",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(99,102,241,0.04)",
              borderRadius: "50%",
              borderBottomColor: "rgba(99,102,241,0.1)",
            }}
          />

          {/* Diagonal holo lines */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(250,204,21,0.5) 0px, transparent 1px, transparent 80px, rgba(250,204,21,0.5) 81px)",
            }}
          />

          {/* Scanline effect */}
          <div
            className="absolute inset-x-0 h-48 opacity-[0.015]"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(250,204,21,0.5), transparent)",
              animation: "scanline 10s linear infinite",
            }}
          />

          {/* Top vignette */}
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{
              background:
                "linear-gradient(to bottom, rgba(3,8,16,0.8), transparent)",
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════
            HEADER — Tournament System Identity
        ══════════════════════════════════════════════════ */}
        <header
          className="relative"
          style={{
            zIndex: 10,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div
            style={{
              background:
                "linear-gradient(180deg, rgba(3,8,20,0.95) 0%, rgba(5,12,28,0.8) 100%)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Top bar */}
              <div
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                  style={{ color: "rgba(250,204,21,0.7)" }}
                >
                  <span style={{ color: "#facc15" }}>◆</span> Official
                  Tournament System
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: dbLoading ? "#f59e0b" : "#34d399",
                      boxShadow: dbLoading
                        ? "0 0 8px #f59e0b"
                        : "0 0 8px #34d399",
                      animation: dbLoading ? "pulse 1.5s infinite" : "none",
                    }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: dbLoading ? "#fbbf24" : "#6ee7b7" }}
                  >
                    {dbLoading ? "Loading DB..." : "DB Online"}
                  </span>
                </div>
              </div>

              {/* Main hero */}
              <div className="py-12 sm:py-16">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.15em]"
                  style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "1px solid rgba(250,204,21,0.2)",
                    color: "rgba(250,204,21,0.8)",
                  }}
                >
                  <IconShield className="w-3.5 h-3.5" />
                  Archetype Condition Validator
                </div>

                {/* Main title */}
                <div className="mb-6">
                  <h1
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "clamp(2.5rem, 7vw, 5rem)",
                      fontWeight: 900,
                      lineHeight: 0.95,
                      letterSpacing: "-0.02em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      Yu-Gi-Oh!
                    </span>
                    <span
                      className="holographic-title"
                      style={{ display: "block" }}
                    >
                      Deck Validator
                    </span>
                  </h1>
                </div>

                <p
                  style={{
                    maxWidth: "560px",
                    fontSize: "15px",
                    lineHeight: 1.7,
                    color: "rgba(148,163,184,0.85)",
                    marginBottom: "24px",
                  }}
                >
                  Validate your tournament deck against archetype-specific
                  conditions. Paste your YDKE link or YDK file content below —
                  the system will instantly analyze every registered archetype.
                </p>

                {/* Stats strip */}
                <div className="flex flex-wrap items-center gap-6">
                  {[
                    { label: "Archetypes", value: "3+" },
                    { label: "Conditions Checked", value: "Auto" },
                    { label: "DB Updated", value: "24h" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: "20px",
                          fontWeight: 900,
                          color: "#facc15",
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "rgba(148,163,184,0.5)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════════ */}
        <main
          className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
          style={{ zIndex: 10 }}
        >
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            {/* ─── LEFT COLUMN: Input Panel (3/5 width) ─── */}
            <div className="lg:col-span-3 animate-slide-up">
              <div
                className="card-slot rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.5), 0 25px 60px rgba(0,0,0,0.4)",
                }}
              >
                {/* Panel header */}
                <div
                  className="px-7 py-5 flex items-center gap-3"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: "rgba(250,204,21,0.15)",
                      border: "1px solid rgba(250,204,21,0.3)",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>📋</span>
                  </div>
                  <div>
                    <div
                      className="section-title text-sm"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      Deck Input
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "rgba(148,163,184,0.5)",
                        marginTop: "1px",
                      }}
                    >
                      YDKE or YDK format
                    </div>
                  </div>
                  {deckString.trim() && (
                    <div
                      className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(250,204,21,0.1)",
                        border: "1px solid rgba(250,204,21,0.2)",
                      }}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "#facc15" }}
                      />
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#facc15",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Ready
                      </span>
                    </div>
                  )}
                </div>

                {/* Textarea */}
                <div className="p-7">
                  <textarea
                    ref={textareaRef}
                    className="ygo-textarea"
                    value={deckString}
                    onChange={(e) => {
                      setDeckString(e.target.value);
                      setResults(null);
                      setError("");
                    }}
                    placeholder={`Paste YDKE link:\nydke://abc123xyz789...\n\nOr YDK file content:\n#main\n12345678\n87654321\n#extra\n11111111\n!side\n22222222`}
                    rows={9}
                    spellCheck={false}
                  />

                  {/* Error */}
                  {error && (
                    <div
                      className="mt-4 flex items-start gap-3 p-4 rounded-xl animate-fade-in"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.25)",
                      }}
                    >
                      <div
                        className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center rounded-full"
                        style={{ background: "rgba(239,68,68,0.2)" }}
                      >
                        <IconX
                          className="w-3 h-3"
                          style={{ color: "#f87171" }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#fca5a5",
                          lineHeight: 1.5,
                        }}
                      >
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleValidate}
                      disabled={loading || !deckString.trim()}
                      onMouseEnter={() => setValidateBtnHover(true)}
                      onMouseLeave={() => setValidateBtnHover(false)}
                      className="validate-btn flex-1 flex items-center justify-center gap-2.5"
                      style={
                        loading || !deckString.trim()
                          ? {
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(100,116,139,0.6)",
                              cursor: "not-allowed",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }
                          : {
                              background: validateBtnHover
                                ? "linear-gradient(135deg, #fde047 0%, #f59e0b 50%, #d97706 100%)"
                                : "linear-gradient(135deg, #facc15 0%, #f59e0b 50%, #ea580c 100%)",
                              color: "#0a0a0a",
                              boxShadow: validateBtnHover
                                ? "0 0 30px rgba(250,204,21,0.5), 0 0 60px rgba(250,204,21,0.2), 0 8px 25px rgba(0,0,0,0.4)"
                                : "0 0 20px rgba(250,204,21,0.3), 0 4px 15px rgba(0,0,0,0.3)",
                              transform: validateBtnHover
                                ? "translateY(-2px)"
                                : "none",
                              border: "none",
                            }
                      }
                    >
                      {loading ? (
                        <>
                          <IconLoader className="w-4 h-4" />
                          <span>Analyzing Deck...</span>
                        </>
                      ) : !deckString.trim() ? (
                        <>
                          <span>⚡</span>
                          <span>Paste Deck to Validate</span>
                        </>
                      ) : (
                        <>
                          <span>⚡</span>
                          <span>Validate Deck</span>
                        </>
                      )}
                    </button>

                    {deckString && (
                      <button
                        onClick={handleClear}
                        className="validate-btn flex items-center gap-2"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(148,163,184,0.8)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          padding: "14px 20px",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.1)";
                          e.currentTarget.style.borderColor =
                            "rgba(239,68,68,0.25)";
                          e.currentTarget.style.color = "#fca5a5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(255,255,255,0.04)";
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.08)";
                          e.currentTarget.style.color = "rgba(148,163,184,0.8)";
                        }}
                      >
                        <IconX className="w-4 h-4" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Format guide */}
              <div
                className="mt-4 p-4 rounded-xl"
                style={{
                  background: "rgba(250,204,21,0.03)",
                  border: "1px solid rgba(250,204,21,0.1)",
                }}
              >
                <div className="flex items-start gap-3">
                  <span
                    style={{
                      fontSize: "14px",
                      flexShrink: 0,
                      marginTop: "1px",
                    }}
                  >
                    💡
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                        lineHeight: 1.6,
                      }}
                    >
                      Export your deck from{" "}
                      <strong style={{ color: "rgba(250,204,21,0.8)" }}>
                        YGO Omega
                      </strong>
                      ,{" "}
                      <strong style={{ color: "rgba(250,204,21,0.8)" }}>
                        YGO ProDeck
                      </strong>
                      , or any compatible app as a YDKE link or .ydk file. The
                      system automatically detects the format.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: Info Panel (2/5 width) ─── */}
            <div
              className="lg:col-span-2 space-y-5 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Active archetypes */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="px-6 py-4 flex items-center gap-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span style={{ fontSize: "14px" }}>🏆</span>
                  <span
                    className="section-title text-sm"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Active Archetypes
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    {
                      key: "MALICE",
                      label: "M∀LICE",
                      desc: "≥25 DARK Monster + ≥45 Main",
                      color: "#818cf8",
                    },
                    {
                      key: "RYZEAL",
                      label: "Ryzeal",
                      desc: "≥10 LIGHT/Thunder + ≥7 Xyz Extra",
                      color: "#facc15",
                    },
                    {
                      key: "ARTMAGE",
                      label: "Artmage",
                      desc: "≥3 Attr + ≥10 Pendulum + ≥10 Spell",
                      color: "#34d399",
                    },
                  ].map((arch) => (
                    <div
                      key={arch.key}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: arch.color,
                          boxShadow: `0 0 8px ${arch.color}`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#e2e8f0",
                            fontFamily: "'Rajdhani', sans-serif",
                          }}
                        >
                          {arch.label}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "rgba(100,116,139,0.8)",
                            marginTop: "1px",
                          }}
                        >
                          {arch.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="px-6 py-4 flex items-center gap-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <span style={{ fontSize: "14px" }}>⚙️</span>
                  <span
                    className="section-title text-sm"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    How It Works
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {
                      n: "01",
                      title: "Paste Deck",
                      desc: "YDKE link or .ydk file text",
                    },
                    {
                      n: "02",
                      title: "Auto-Detect",
                      desc: "Format recognized instantly",
                    },
                    {
                      n: "03",
                      title: "DB Lookup",
                      desc: "Cards resolved via YGOPRODeck",
                    },
                    {
                      n: "04",
                      title: "Rule Check",
                      desc: "All archetypes analyzed",
                    },
                  ].map((step) => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{
                          background: "rgba(250,204,21,0.1)",
                          border: "1px solid rgba(250,204,21,0.2)",
                          color: "#facc15",
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        {step.n}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#cbd5e1",
                            marginBottom: "2px",
                          }}
                        >
                          {step.title}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "rgba(100,116,139,0.8)",
                          }}
                        >
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              RESULTS SECTION
          ══════════════════════════════════════════════════ */}
          {results && (
            <div className="mt-12 animate-fade-in">
              {/* Section header */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(250,204,21,0.3), transparent)",
                  }}
                />
                <div
                  className="flex items-center gap-2.5 px-4 py-2 rounded-full"
                  style={{
                    background: "rgba(250,204,21,0.08)",
                    border: "1px solid rgba(250,204,21,0.2)",
                  }}
                >
                  <span style={{ fontSize: "13px" }}>📊</span>
                  <span
                    className="section-title text-sm"
                    style={{ color: "#facc15" }}
                  >
                    Analysis Results
                  </span>
                </div>
                <div
                  className="flex-1 h-px"
                  style={{
                    background:
                      "linear-gradient(270deg, rgba(250,204,21,0.3), transparent)",
                  }}
                />
              </div>

              {/* Deck stats */}
              {results.deckStats && (
                <div className="grid grid-cols-3 gap-4 mb-10">
                  <StatCard
                    label="Main Deck"
                    value={results.deckStats.mainCount}
                    icon="🃏"
                    color="#facc15"
                    glow="#facc15"
                  />
                  <StatCard
                    label="Extra Deck"
                    value={results.deckStats.extraCount}
                    icon="✨"
                    color="#818cf8"
                    glow="#818cf8"
                  />
                  <StatCard
                    label="Side Deck"
                    value={results.deckStats.sideCount}
                    icon="🔮"
                    color="#34d399"
                    glow="#34d399"
                  />
                </div>
              )}

              {/* Passed archetypes */}
              {passedArchetypes.length > 0 ? (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(52,211,153,0.2)",
                        border: "1px solid rgba(52,211,153,0.4)",
                      }}
                    >
                      <IconCheck
                        className="w-3.5 h-3.5"
                        style={{ color: "#34d399" }}
                      />
                    </div>
                    <h2
                      className="section-title text-base"
                      style={{ color: "#6ee7b7" }}
                    >
                      Eligible Archetypes ({passedArchetypes.length})
                    </h2>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(52,211,153,0.15)" }}
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {passedArchetypes.map(({ key, result }) => (
                      <ArchetypeCard
                        key={key}
                        archetypeKey={key}
                        result={result}
                        onClickDetails={(arch, res) => {
                          setSelectedArchetype(arch);
                          setSelectedResult(res);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="mb-10 p-10 rounded-2xl text-center"
                  style={{
                    background: "rgba(239,68,68,0.04)",
                    border: "1px solid rgba(239,68,68,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "48px",
                      marginBottom: "12px",
                      opacity: 0.5,
                    }}
                  >
                    🔒
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Rajdhani', sans-serif",
                      fontSize: "22px",
                      fontWeight: 900,
                      color: "#e2e8f0",
                      marginBottom: "8px",
                    }}
                  >
                    No Archetypes Eligible
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "rgba(100,116,139,0.8)",
                      maxWidth: "400px",
                      margin: "0 auto",
                    }}
                  >
                    This deck does not meet the required conditions for any
                    registered archetype. Review the failed conditions below and
                    adjust your deck composition.
                  </p>
                </div>
              )}

              {/* Failed archetypes (collapsible list) */}
              {failedArchetypes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(248,113,113,0.15)",
                        border: "1px solid rgba(248,113,113,0.3)",
                      }}
                    >
                      <IconX
                        className="w-3.5 h-3.5"
                        style={{ color: "#f87171" }}
                      />
                    </div>
                    <h2
                      className="section-title text-sm"
                      style={{ color: "rgba(248,113,113,0.7)" }}
                    >
                      Not Eligible ({failedArchetypes.length})
                    </h2>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(248,113,113,0.1)" }}
                    />
                    <span
                      style={{
                        fontSize: "11px",
                        color: "rgba(100,116,139,0.5)",
                      }}
                    >
                      Click to see conditions
                    </span>
                  </div>
                  <div
                    className="rounded-xl overflow-hidden space-y-1 p-2"
                    style={{
                      background: "rgba(5,10,25,0.6)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {failedArchetypes.map(({ key, result }) => (
                      <FailedArchetypeRow
                        key={key}
                        archetypeKey={key}
                        result={result}
                        onClickDetails={(arch, res) => {
                          setSelectedArchetype(arch);
                          setSelectedResult(res);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {results.warnings?.length > 0 && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl"
                  style={{
                    background: "rgba(245,158,11,0.06)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <IconWarning
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: "#fbbf24" }}
                  />
                  <p
                    style={{
                      fontSize: "13px",
                      color: "rgba(253,230,138,0.85)",
                      lineHeight: 1.6,
                    }}
                  >
                    {results.warnings[0]}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* ══════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════ */}
        <footer
          className="relative py-10 mt-8"
          style={{
            zIndex: 10,
            borderTop: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(3,8,16,0.6)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div
                className="h-px w-16"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(250,204,21,0.3))",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: "rgba(250,204,21,0.5)",
                  letterSpacing: "0.2em",
                }}
              >
                ◆
              </span>
              <div
                className="h-px w-16"
                style={{
                  background:
                    "linear-gradient(270deg, transparent, rgba(250,204,21,0.3))",
                }}
              />
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(100,116,139,0.6)",
                marginBottom: "6px",
              }}
            >
              Card database powered by{" "}
              <a
                href="https://ygoprodeck.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "rgba(250,204,21,0.6)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#facc15";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(250,204,21,0.6)";
                }}
              >
                YGOPRODeck
              </a>{" "}
              • Refreshed every 24 hours
            </p>
            <p style={{ fontSize: "11px", color: "rgba(71,85,105,0.6)" }}>
              Yu-Gi-Oh! Tournament Deck Validator System — Professional
              Archetype Analysis
            </p>
          </div>
        </footer>
      </div>

      {/* ─── Modal ─── */}
      {selectedResult && (
        <DetailModal
          archetype={selectedArchetype}
          result={selectedResult}
          onClose={() => {
            setSelectedArchetype(null);
            setSelectedResult(null);
          }}
        />
      )}
    </>
  );
}
