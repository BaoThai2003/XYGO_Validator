"use client";

/**
 * app/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Yu-Gi-Oh! Tournament Deck Validator — REDESIGNED Premium Gaming UI
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Archetype Card Component ─────────────────────────────────────────────────

function ArchetypeCard({ archetypeKey, result }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-left w-full transition-all duration-300"
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
        className="relative px-5 py-3.5 rounded-xl overflow-hidden flex items-center gap-3"
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

        {/* Green dot indicator */}
        <div
          className="relative flex-shrink-0 w-2.5 h-2.5 rounded-full"
          style={{
            background: "#34d399",
            boxShadow: "0 0 8px rgba(52,211,153,0.7)",
          }}
        />

        {/* Label */}
        <span
          className="relative text-sm font-bold leading-tight"
          style={{
            fontFamily: "'Rajdhani', sans-serif",
            color: hovered ? "#fff" : "#e2e8f0",
            transition: "color 0.2s",
          }}
        >
          {result.archetypeLabel ?? archetypeKey}
        </span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, glow }) {
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
  const [validateBtnHover, setValidateBtnHover] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
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
            BACKGROUND LAYER
        ══════════════════════════════════════════════════ */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "asset('assets/bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.18,
            }}
          />

          {/* Duel grid floor */}
          <div className="duel-grid absolute inset-0" />

          {/* Primary atmosphere orbs */}
          <div
            className="absolute"
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
            HEADER
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
                {/* Logo */}
                <div className="mb-6">
                  <img
                    src="assets/logo.png"
                    alt="XYGO Tournament Logo"
                    style={{
                      height: "80px",
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
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
                    { label: "Archetypes", value: "44" },
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
                        <span>Analyzing Deck...</span>
                      ) : !deckString.trim() ? (
                        <span>Paste Deck to Validate</span>
                      ) : (
                        <span>Validate Deck</span>
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
                  <span
                    className="section-title text-sm"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    Active Archetypes
                  </span>
                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(250,204,21,0.12)",
                      border: "1px solid rgba(250,204,21,0.25)",
                      color: "#facc15",
                    }}
                  >
                    44
                  </span>
                </div>
                <div
                  className="p-4 space-y-4 overflow-y-auto"
                  style={{ maxHeight: "520px" }}
                >
                  {[
                    {
                      group: "10 Wins",
                      color: "#34d399",
                      archetypes: [
                        {
                          key: "MALICE",
                          label: "M∀LICE",
                          desc: "≥25 DARK Monster + ≥45 Main Deck",
                        },
                        {
                          key: "RYZEAL",
                          label: "Ryzeal",
                          desc: "≥10 LIGHT/Thunder + ≥7 Xyz Extra",
                        },
                        {
                          key: "ARTMAGE",
                          label: "Artmage",
                          desc: "≥3 Attr (LIGHT+DARK) + ≥10 Pendulum + ≥10 Spell",
                        },
                        {
                          key: "MARINCESS",
                          label: "Marincess",
                          desc: "≥10 WATER Monster + ≥5 Water Link Extra",
                        },
                        {
                          key: "MIKANKO",
                          label: "Mikanko",
                          desc: "≥6 Monster + ≥3 Equip Spell",
                        },
                        {
                          key: "TRAPTRIX",
                          label: "Traptrix",
                          desc: "≥10 Trap + ≥10 Insect/Plant Monster",
                        },
                      ],
                    },
                    {
                      group: "20 Wins",
                      color: "#facc15",
                      archetypes: [
                        {
                          key: "BLUE_EYES",
                          label: "Blue-Eyes",
                          desc: "≥6 Level 8 Monster",
                        },
                        {
                          key: "CHIMERA",
                          label: "Chimera (Illusion)",
                          desc: "≥2 Attribute + ≥2 Type (Illusion/Beast/Fiend)",
                        },
                        {
                          key: "DDD",
                          label: "D/D/D",
                          desc: "Extra Deck: ≥1 Link + Fusion + Synchro + Xyz",
                        },
                        {
                          key: "DARK_MAGICIAN",
                          label: "Dark Magician",
                          desc: "≥5 Spellcaster + ≥6 Spell + Lv7/6/1",
                        },
                        {
                          key: "FLOOWANDEREEZE",
                          label: "Floowandereeze",
                          desc: "≥15 Winged Beast Monster",
                        },
                        {
                          key: "HERO",
                          label: "HERO",
                          desc: "≥3 Fusion Monster w/ 3 diff Attributes",
                        },
                        {
                          key: "LIVE_TWIN",
                          label: "Live-Twin / Evil-Twin",
                          desc: "≥10 Cyberse/Fiend + ≥2 Link-2 Extra",
                        },
                        {
                          key: "MANNADIUM",
                          label: "Mannadium",
                          desc: "≥4 Archetypes + ≥8 Tuner Monster",
                        },
                        {
                          key: "MATHMECH",
                          label: "Mathmech",
                          desc: "≥10 Cyberse + ≥1 Xyz + ≥1 Link Extra",
                        },
                        {
                          key: "RITUAL_BEAST",
                          label: "Ritual Beast",
                          desc: "≥8 WIND Monster + ≥4 Fusion Extra",
                        },
                        {
                          key: "SPYRAL",
                          label: "SPYRAL",
                          desc: "≥3 Hand/Deck viewing cards",
                        },
                        {
                          key: "SWORDSOUL",
                          label: "Swordsoul",
                          desc: "≥10 Wyrm Monster + ≥7 Synchro Extra",
                        },
                        {
                          key: "UNCHAINED",
                          label: "Unchained",
                          desc: "≥10 Fiend Monster + ≥5 Trap",
                        },
                      ],
                    },
                    {
                      group: "30 Wins",
                      color: "#f97316",
                      archetypes: [
                        {
                          key: "BYSTIAL",
                          label: "Bystial",
                          desc: "≥3 Level 6 Dragon (LIGHT/DARK)",
                        },
                        {
                          key: "ELFNOTE",
                          label: "Elfnote",
                          desc: "≥10 Fairy/Spellcaster + ≥10 Spell",
                        },
                        {
                          key: "FIRE_KING",
                          label: "Fire King",
                          desc: "≥3 Archetypes + ≥10 FIRE Monster",
                        },
                        {
                          key: "HORUS",
                          label: "Horus",
                          desc: "≥3 Archetypes + ≥4 Level 8 Monster (diff Attr)",
                        },
                        {
                          key: "K9",
                          label: "K9",
                          desc: "≥10 EARTH/LIGHT + ≥5 Beast/Beast-Warrior",
                        },
                        {
                          key: "SKY_STRIKER",
                          label: "Sky Striker",
                          desc: "≥20 Spell + ≤10 Monster",
                        },
                        {
                          key: "SNAKE_EYES",
                          label: "Snake-Eyes",
                          desc: "≥10 FIRE Monster",
                        },
                        {
                          key: "VAALMONICA",
                          label: "Vaalmonica",
                          desc: "≥10 Spell Card",
                        },
                        {
                          key: "VANQUISH_SOUL",
                          label: "Vanquish Soul",
                          desc: "≥4 Attr (EARTH/FIRE/DARK req.) ≥3 each",
                        },
                      ],
                    },
                    {
                      group: "40 Wins",
                      color: "#e879f9",
                      archetypes: [
                        {
                          key: "CENTUR_ION",
                          label: "Centur-Ion",
                          desc: "≥7 Synchro Extra Deck",
                        },
                        {
                          key: "FIENDSMITH",
                          label: "Fiendsmith",
                          desc: "≥10 Fiend + ≥5 Special Summon cards",
                        },
                        {
                          key: "KASHTIRA",
                          label: "Kashtira",
                          desc: "≥10 Psychic Monster + ≥5 Xyz Extra",
                        },
                        {
                          key: "LABRYNTH",
                          label: "Labrynth/Eldlich",
                          desc: "≥20 Trap Card",
                        },
                        {
                          key: "PURRELY",
                          label: "Purrely",
                          desc: "≥10 Quick-Play Spell",
                        },
                        {
                          key: "RADIANT_TYPHOON",
                          label: "Radiant Typhoon",
                          desc: "≥3 Archetypes + ≥10 Quick-Play Spell",
                        },
                        {
                          key: "RESCUE_ACE",
                          label: "Rescue-ACE",
                          desc: "≥10 Quick-Play + ≥10 Normal Trap + ≥5 Destroy",
                        },
                        {
                          key: "VOICELESS_VOICE",
                          label: "Voiceless Voice",
                          desc: "≥10 LIGHT Monster + ≥5 Ritual Monster/Spell",
                        },
                      ],
                    },
                    {
                      group: "50 Wins",
                      color: "#60a5fa",
                      archetypes: [
                        {
                          key: "BRANDED",
                          label: "Branded",
                          desc: "≥10 Fusion Material cards + ≥5 Fusion Extra",
                        },
                        {
                          key: "DRACOTAIL",
                          label: "Dracotail",
                          desc: "≥15 Dragon Monster + ≥5 Special Summon",
                        },
                        {
                          key: "KEWL_TUNE",
                          label: "Kewl Tune",
                          desc: "≥10 Tuner Monster + ≥7 Synchro Extra",
                        },
                        {
                          key: "MITSURUGI",
                          label: "Mitsurugi",
                          desc: "≥10 Reptile Monster",
                        },
                        {
                          key: "TENPAI_DRAGON",
                          label: "Tenpai Dragon",
                          desc: "≥12 Dragon Monster",
                        },
                        {
                          key: "WHITE_FOREST",
                          label: "White Forest",
                          desc: "≥15 Spell + ≥5 Synchro Extra",
                        },
                      ],
                    },
                    {
                      group: "20 Losses",
                      color: "#94a3b8",
                      archetypes: [
                        {
                          key: "DRAGONMAID",
                          label: "Dragonmaid",
                          desc: "≥8 Dragon Monster + ≥3 Fusion Extra",
                        },
                        {
                          key: "ANTI_SPELL",
                          label: "Anti-Spell Fragrance",
                          desc: "≥10 Continuous Spell/Trap",
                        },
                        {
                          key: "YUMMY",
                          label: "Yummy",
                          desc: "≥10 Ritual Monster + ≥5 Ritual Spell",
                        },
                      ],
                    },
                    {
                      group: "30 Losses",
                      color: "#fb7185",
                      archetypes: [
                        {
                          key: "RUNICK",
                          label: "Runick",
                          desc: "≥10 Spell + ≥10 Trap",
                        },
                        {
                          key: "YUBEL",
                          label: "Yubel",
                          desc: "≥10 Fiend Monster",
                        },
                      ],
                    },
                    {
                      group: "40 Losses",
                      color: "#a78bfa",
                      archetypes: [
                        {
                          key: "ENNEACRAFT",
                          label: "Enneacraft",
                          desc: "≥12 Spell Card",
                        },
                        {
                          key: "DINOSAUR",
                          label: "Dinosaur Monster Type",
                          desc: "≥10 unique card names",
                        },
                      ],
                    },
                    {
                      group: "100 Losses",
                      color: "#f87171",
                      archetypes: [
                        {
                          key: "TEARLAMENTS",
                          label: "Tearlaments (Full Power)",
                          desc: "≥20 WATER/DARK/Aqua Monster",
                        },
                        {
                          key: "ZOODIAC",
                          label: "Zoodiac (Full Power)",
                          desc: "≥5 Xyz Extra + ≥5 Beast Monster",
                        },
                      ],
                    },
                  ].map((section) => (
                    <div key={section.group}>
                      {/* Group label */}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="h-px flex-1"
                          style={{ background: `${section.color}30` }}
                        />
                        <span
                          className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded"
                          style={{
                            color: section.color,
                            background: `${section.color}15`,
                            border: `1px solid ${section.color}30`,
                            fontFamily: "'Space Mono', monospace",
                          }}
                        >
                          {section.group}
                        </span>
                        <div
                          className="h-px flex-1"
                          style={{ background: `${section.color}30` }}
                        />
                      </div>
                      {/* Archetype rows */}
                      <div className="space-y-1.5">
                        {section.archetypes.map((arch) => (
                          <div
                            key={arch.key}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              border: "1px solid rgba(255,255,255,0.04)",
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{
                                background: section.color,
                                boxShadow: `0 0 6px ${section.color}`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#e2e8f0",
                                  fontFamily: "'Rajdhani', sans-serif",
                                }}
                              >
                                {arch.label}
                              </div>
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(100,116,139,0.8)",
                                  marginTop: "1px",
                                  lineHeight: 1.3,
                                }}
                              >
                                {arch.desc}
                              </div>
                            </div>
                          </div>
                        ))}
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
                    color="#facc15"
                    glow="#facc15"
                  />
                  <StatCard
                    label="Extra Deck"
                    value={results.deckStats.extraCount}
                    color="#818cf8"
                    glow="#818cf8"
                  />
                  <StatCard
                    label="Side Deck"
                    value={results.deckStats.sideCount}
                    color="#34d399"
                    glow="#34d399"
                  />
                </div>
              )}

              {/* Passed archetypes */}
              {passedArchetypes.length > 0 ? (
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
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
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {passedArchetypes.map(({ key, result }) => (
                      <ArchetypeCard
                        key={key}
                        archetypeKey={key}
                        result={result}
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
                    registered archetype. Review the conditions listed on the
                    right and adjust your deck composition.
                  </p>
                </div>
              )}

              {/* Failed archetypes — simple list, no details */}
              {failedArchetypes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
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
                  </div>
                  <div
                    className="rounded-xl overflow-hidden p-3 flex flex-wrap gap-2"
                    style={{
                      background: "rgba(5,10,25,0.6)",
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {failedArchetypes.map(({ key, result }) => (
                      <span
                        key={key}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{
                          background: "rgba(248,113,113,0.07)",
                          border: "1px solid rgba(248,113,113,0.18)",
                          color: "rgba(248,113,113,0.65)",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {result.archetypeLabel ?? key}
                      </span>
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
    </>
  );
}
