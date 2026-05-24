"use client";

/**
 * app/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Giao diện chính — Yu-Gi-Oh! Tournament Deck Validator
 * Aesthetic: Dark esport / cyberpunk YGO — neon trên nền đen
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";

// ─── Icons (inline SVG để không cần thêm package) ─────────────────────────────

const IconCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const IconX = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5"
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

const IconLoader = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-5 h-5 animate-spin"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

const IconShield = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-6 h-6"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);

const IconWarning = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className="w-4 h-4"
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

// ─── Deck Stats Card ───────────────────────────────────────────────────────────

function DeckStatBadge({ label, value, accent = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-4 py-2 rounded border ${
        accent
          ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
          : "border-slate-700 bg-slate-800/50 text-slate-300"
      }`}
    >
      <span className="text-xl font-bold font-mono">{value}</span>
      <span className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ─── Single Check Result Row ───────────────────────────────────────────────────

function CheckRow({ result, index }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
        result.pass
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          result.pass
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-red-500/20 text-red-400"
        }`}
      >
        {result.pass ? <IconCheck /> : <IconX />}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            result.pass ? "text-emerald-300" : "text-red-300"
          }`}
        >
          {result.message}
        </p>
        {result.detail && (
          <p className="text-xs text-slate-500 mt-0.5 font-mono">
            {result.detail}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Validation Result Panel ───────────────────────────────────────────────────

function ResultPanel({ result }) {
  if (!result) return null;

  const {
    overallPass,
    archetypeLabel,
    archetypeDescription,
    results,
    summary,
    deckStats,
    warnings,
  } = result;

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all duration-500 ${
        overallPass
          ? "border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          : "border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
      }`}
    >
      {/* Header banner */}
      <div
        className={`px-6 py-4 flex items-center gap-4 ${
          overallPass
            ? "bg-gradient-to-r from-emerald-900/60 to-emerald-900/20"
            : "bg-gradient-to-r from-red-900/60 to-red-900/20"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0 ${
            overallPass
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {overallPass ? "✓" : "✗"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black tracking-wide text-white">
              {archetypeLabel}
            </h2>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                overallPass
                  ? "bg-emerald-500/30 text-emerald-300"
                  : "bg-red-500/30 text-red-300"
              }`}
            >
              {overallPass ? "PASS" : "FAIL"}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">
            {archetypeDescription}
          </p>
        </div>
        <div className="ml-auto text-right flex-shrink-0">
          <span className="text-2xl font-black font-mono text-white">
            {summary.passed}
            <span className="text-slate-500">/{summary.total}</span>
          </span>
          <p className="text-xs text-slate-500">checks pass</p>
        </div>
      </div>

      {/* Deck Stats */}
      <div className="px-6 py-3 bg-slate-900/40 border-b border-slate-800">
        <div className="flex gap-3 flex-wrap">
          <DeckStatBadge
            label="Main Deck"
            value={deckStats.mainCount}
            accent={deckStats.mainCount >= 40}
          />
          <DeckStatBadge label="Extra Deck" value={deckStats.extraCount} />
          <DeckStatBadge label="Side Deck" value={deckStats.sideCount} />
          {deckStats.unknownCards.length > 0 && (
            <DeckStatBadge
              label="Unknown"
              value={deckStats.unknownCards.length}
            />
          )}
        </div>
      </div>

      {/* Check results */}
      <div className="px-6 py-4 space-y-2 bg-slate-900/20">
        <h3 className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-bold">
          Chi tiết kiểm tra
        </h3>
        {results.map((r) => (
          <CheckRow key={r.index} result={r} index={r.index} />
        ))}
      </div>

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="px-6 py-3 bg-yellow-900/10 border-t border-yellow-800/30">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-yellow-400/80 text-xs"
            >
              <IconWarning />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────

export default function HomePage() {
  const [archetypes, setArchetypes] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState("");
  const [deckString, setDeckString] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Khởi động: load danh sách archetype + warm-up card database
  useEffect(() => {
    async function init() {
      try {
        // Fetch archetype list
        const arcRes = await fetch("/api/validate");
        const arcData = await arcRes.json();
        if (arcData.archetypes) {
          setArchetypes(arcData.archetypes);
          setSelectedArchetype(arcData.archetypes[0]?.key ?? "");
        }

        // Warm-up card DB (fire-and-forget; độ trễ không ảnh hưởng UX)
        fetch("/api/cards")
          .then((r) => r.json())
          .then((d) => {
            console.log("[DB Warmup]", d.message);
          })
          .catch(() => {})
          .finally(() => setDbLoading(false));
      } catch {
        setDbLoading(false);
      }
    }
    init();
  }, []);

  const handleValidate = useCallback(async () => {
    if (!deckString.trim()) {
      setError(
        "Vui lòng dán chuỗi YDKE hoặc nội dung file .ydk vào ô bên dưới.",
      );
      return;
    }
    if (!selectedArchetype) {
      setError("Vui lòng chọn Archetype cần kiểm tra.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckString: deckString.trim(),
          archetype: selectedArchetype,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? `Lỗi ${res.status}: không xác định.`);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(`Không thể kết nối đến server: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deckString, selectedArchetype]);

  const handleClear = () => {
    setDeckString("");
    setResult(null);
    setError("");
  };

  const selectedArchetypeInfo = archetypes.find(
    (a) => a.key === selectedArchetype,
  );

  return (
    <div className="min-h-screen bg-[#080c14] text-white relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Neon glow blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        {/* ── Header ── */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 border border-yellow-500/60 rounded flex items-center justify-center text-yellow-400">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-bold">
              Yu-Gi-Oh! Tournament Tool
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Deck{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              Validator
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm leading-relaxed">
            Kiểm tra Deck của bạn có đáp ứng{" "}
            <span className="text-slate-300">Deck Condition</span> của Archetype
            hay không. Hỗ trợ định dạng{" "}
            <code className="text-yellow-400/80 text-xs bg-yellow-400/10 px-1.5 py-0.5 rounded font-mono">
              ydke://
            </code>{" "}
            và file{" "}
            <code className="text-yellow-400/80 text-xs bg-yellow-400/10 px-1.5 py-0.5 rounded font-mono">
              .ydk
            </code>
            .
          </p>

          {/* DB status indicator */}
          <div className="mt-3 flex items-center gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                dbLoading ? "bg-yellow-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="text-xs text-slate-500">
              {dbLoading
                ? "Đang khởi động Card Database..."
                : "Card Database sẵn sàng"}
            </span>
          </div>
        </header>

        {/* ── Main Form ── */}
        <div className="space-y-5">
          {/* Archetype Selector */}
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
              Chọn Archetype
            </label>
            <div className="relative">
              <select
                value={selectedArchetype}
                onChange={(e) => {
                  setSelectedArchetype(e.target.value);
                  setResult(null);
                  setError("");
                }}
                className="w-full appearance-none bg-slate-900 border border-slate-700 rounded-lg px-4 py-3
                           text-white font-medium focus:outline-none focus:border-yellow-500/60
                           focus:ring-1 focus:ring-yellow-500/30 transition-all cursor-pointer
                           pr-10"
              >
                {archetypes.length === 0 ? (
                  <option value="">Đang tải...</option>
                ) : (
                  archetypes.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.label}
                    </option>
                  ))
                )}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            {/* Archetype description hint */}
            {selectedArchetypeInfo && (
              <p className="text-xs text-slate-500 pl-1">
                <span className="text-slate-600">Điều kiện: </span>
                {selectedArchetypeInfo.description}
              </p>
            )}
          </div>

          {/* YDKE / YDK Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs uppercase tracking-widest text-slate-400 font-bold">
                Deck String
              </label>
              {deckString && (
                <button
                  onClick={handleClear}
                  className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Xóa
                </button>
              )}
            </div>
            <textarea
              value={deckString}
              onChange={(e) => {
                setDeckString(e.target.value);
                setResult(null);
                setError("");
              }}
              placeholder={`Dán chuỗi YDKE vào đây:\nydke://abc123...!xyz456...!pqr789...!\n\nHoặc nội dung file .ydk:\n#main\n12345678\n87654321\n#extra\n11111111\n!side\n22222222`}
              rows={8}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3
                         text-slate-200 text-sm font-mono placeholder:text-slate-700
                         focus:outline-none focus:border-yellow-500/60 focus:ring-1
                         focus:ring-yellow-500/30 transition-all resize-y leading-relaxed"
              spellCheck={false}
            />
            <p className="text-xs text-slate-600 pl-1">
              Hỗ trợ: <code className="text-slate-500">ydke://...</code> hoặc
              text .ydk (có #main / #extra)
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-red-500/40 bg-red-500/5">
              <div className="text-red-400 flex-shrink-0 mt-0.5">
                <IconX />
              </div>
              <p className="text-sm text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            disabled={loading || !deckString.trim() || !selectedArchetype}
            className={`w-full py-4 rounded-lg font-black text-sm uppercase tracking-[0.15em]
                        flex items-center justify-center gap-2.5 transition-all duration-200
                        ${
                          loading || !deckString.trim() || !selectedArchetype
                            ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-400 hover:to-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] active:scale-[0.98]"
                        }`}
          >
            {loading ? (
              <>
                <IconLoader />
                Đang xử lý...
              </>
            ) : (
              <>
                <IconShield />
                Validate Deck
              </>
            )}
          </button>
        </div>

        {/* ── Result Panel ── */}
        {result && (
          <div className="mt-8">
            <ResultPanel result={result} />
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="mt-16 text-center text-xs text-slate-700 space-y-1">
          <p>
            Dữ liệu card từ{" "}
            <a
              href="https://ygoprodeck.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              YGOPRODeck
            </a>{" "}
            · Cache 24h
          </p>
          <p>
            Yu-Gi-Oh! Tournament Deck Validator — for official tournament use
          </p>
        </footer>
      </div>
    </div>
  );
}
