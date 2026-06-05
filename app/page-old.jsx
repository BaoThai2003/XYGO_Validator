"use client";

/**
 * app/page.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Yu-Gi-Oh! Tournament Deck Validator — REDESIGNED with Modern Gaming UI
 *
 * Features:
 * - Two-step validation flow (Team Stats → Deck Input)
 * - Scaling archetype unlock conditions
 * - Enhanced visualization (eligible/ineligible states)
 * - Deck statistics display
 * - Full Vietnamese localization
 * - Improved typography and responsive design
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { validateDeckBanlist } from "../utils/banlist";

// All team members available for respect bonuses
const TEAM_MEMBERS = [
  "Yuki Chan",
  "Nguyễn Nguyên",
  "Khai Điện",
  "Kuroko Guen",
  "Pham Le Minh",
  "Nguyễn Hữu Lộc",
  "Cell Skt",
  "Nguyễn. Đ. Bình",
  "Nhật Minh",
  "Quochau Do",
  "Doãn Nhân",
  "Phú",
  "Tài",
  "Hùng",
  "Vũ",
  "Nguyễn Quang",
  "Sang Truong",
  "Trương Duy",
  "Đào Đức",
  "Gầm Giường",
  "Hồ Huy",
  "Tú Thanh",
  "Nguyễn Đình Tấn Phát",
  "Chương Trần",
  "Nos Karkin",
  "Súc Vật Đại Dương",
  "Theodore Hamilton",
  "Đạt",
  "Trần",
  "Quang",
  "Bảo",
];

// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═══════════════════════════════════════════════════════════════════════════
const i18n = {
  officialTournament: "Hệ Thống Giải Đấu Chính Thức",
  loadingDB: "Đang tải CSDL...",
  dbOnline: "CSDL Trực Tuyến",
  validatorTitle: "Trình Kiểm Định Deck Tournament XYGO",
  validatorDesc:
    "Xác thực deck của bạn theo các điều kiện riêng biệt cho từng Archetype. Nhập thông tin đội của bạn trước, sau đó dán YDKE hoặc nội dung tệp YDK.",

  // Step 1: Team Stats
  step: "Bước",
  stepTeamInfo: "Thông Tin Đội",
  teamWins: "Số Trận Thắng",
  teamLosses: "Số Trận Thua",
  unlockedArchetypes: "Số Archetype Đã Mở Khóa",
  proceedToDecks: "Tiếp Tục Đến Deck",
  requiredFields: "Vui lòng nhập tất cả các trường",

  // Step 2: Deck Input
  stepDeckInput: "Nhập Deck",
  deckInputPlaceholder:
    "Dán liên kết YDKE:\nydke://abc123xyz789...\n\nHoặc nội dung tệp YDK:\n#main\n12345678\n87654321\n#extra\n11111111\n!side\n22222222",
  ydkeLink: "Liên Kết YDKE",
  ydkFile: "Tệp YDK",
  plaintextDeck: "Plaintext Deck",
  validateDeck: "Xác Thực Deck",
  analyzingDeck: "Đang Phân Tích Deck...",
  pasteDeckToValidate: "Dán Deck Để Xác Thực",
  clear: "Xóa",
  ready: "Sẵn Sàng",

  // Export options
  exportOptions: "Tùy Chọn Nhập Deck",
  exportDesc:
    "Xuất deck từ YGO Omega, YGO ProDeck hoặc bất kỳ ứng dụng tương thích nào dưới dạng liên kết YDKE hoặc tệp .ydk. Hệ thống tự động phát hiện định dạng.",

  // Results
  validationResults: "Kết Quả Xác Thực",
  eligibleArchetypes: "Archetype Đủ Điều Kiện",
  ineligibleArchetypes: "Archetype Không Đủ Điều Kiện",
  noEligible: "Không có Archetype nào đủ điều kiện",
  noIneligible: "Tất cả Archetype đều đủ điều kiện!",

  // Deck Statistics
  deckStatistics: "Thống Kê Deck",
  totalArchetypes: "Tổng Archetypes",
  totalMonsters: "Tổng Monster",
  totalSpells: "Tổng Spell",
  totalTraps: "Tổng Trap",
  mainDeck: "Main Deck",
  extraDeck: "Extra Deck",
  sideDeck: "Side Deck",
  mainTypes: "Main Deck Types",

  // Archetype conditions
  deckCondition: "Điều Kiện Deck",
  teamCondition: "Điều Kiện Đội",
  winsRequired: "Trận Thắng Yêu Cầu",
  lessonsRequired: "Trận Thua Yêu Cầu",
  conditionMet: "✓ Đạt",
  conditionUnmet: "✗ Chưa Đạt",
  unlockedProgress: "Tiến Độ Mở Khóa",

  // Errors
  connectionError: "Lỗi Kết Nối",
  error: "Lỗi",
  tryAgain: "Thử Lại",
  backToTeamStats: "Quay Lại Thông Tin Đội",

  // Banlist
  banlistValidation: "Kiểm Tra Banlist OCG 4/2026",
  banlistValid: "✓ Deck tuân thủ Banlist",
  banlistInvalid: "✗ Deck vi phạm Banlist",
  forbiddenCards: "Lá Bài Bị Cấm (0 bản)",
  limitedCards: "Lá Bài Giới Hạn (1 bản)",
  semiLimitedCards: "Lá Bài Bán Giới Hạn (2 bản)",
  violations: "Vi Phạm",

  // Enhanced statistics
  totalCardCount: "Tổng Card",
  mainDeckCount: "Main Deck",
  extraDeckCount: "Extra Deck",
  sideDeckCount: "Side Deck",
  monsterCount: "Monster",
  spellCount: "Spell",
  trapCount: "Trap",
  extraMonsters: "Extra Monster",
  primaryTypes: "Chủ Lực Type",
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate additional unlock requirements based on number of unlocked archetypes
 * Formula: max(0, unlockedArchetypes - 10) * 5
 * Examples:
 * - 10 archetypes → +0
 * - 11 archetypes → +5
 * - 12 archetypes → +10
 * - 13 archetypes → +15
 */
function calculateArchetypeScaling(unlockedArchetypes) {
  return Math.max(0, unlockedArchetypes - 10) * 5;
}

/**
 * Parse deck string and extract comprehensive statistics
 */
function parseDeckStats(deckData) {
  if (!deckData || !deckData.deck) return null;

  const mainDeck = deckData.deck.main || [];
  const extraDeck = deckData.deck.extra || [];
  const sideDeck = deckData.deck.side || [];

  const countByProperty = (cards, property) => {
    const counts = {};
    cards.forEach((card) => {
      if (card[property]) {
        const value = card[property];
        counts[value] = (counts[value] || 0) + 1;
      }
    });
    return counts;
  };

  // Main Deck Types
  const mainTypes = countByProperty(mainDeck, "type");
  const topTypes = Object.entries(mainTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => `${type} (${count})`);

  // Extra Deck Monster Types
  const extraMonsterTypes = countByProperty(extraDeck, "type");

  // Card Races/Attributes
  const monsterRaces = countByProperty(
    [...mainDeck, ...extraDeck].filter((c) => c.isMonster),
    "race",
  );
  const attributes = countByProperty(
    [...mainDeck, ...extraDeck].filter((c) => c.isMonster),
    "attribute",
  );

  // Card count details
  const monsterCount = [...mainDeck, ...extraDeck].filter(
    (c) => c.isMonster,
  ).length;
  const spellCount = [...mainDeck, ...sideDeck].filter(
    (c) => c.type === "Spell Card",
  ).length;
  const trapCount = [...mainDeck, ...sideDeck].filter(
    (c) => c.type === "Trap Card",
  ).length;

  // Unique archetypes
  const archetypeCount = new Set(
    [...mainDeck, ...extraDeck, ...sideDeck]
      .map((c) => c.archetype)
      .filter(Boolean),
  ).size;

  // Extra Deck Monster types
  const linkMonsters = extraDeck.filter((c) => c.isLink).length;
  const fusionMonsters = extraDeck.filter((c) => c.isFusion).length;
  const synchroMonsters = extraDeck.filter((c) => c.isSynchro).length;
  const xyzMonsters = extraDeck.filter((c) => c.isXyz).length;

  return {
    totalCards: mainDeck.length + extraDeck.length + sideDeck.length,
    archetypes: archetypeCount,
    mainDeckCount: mainDeck.length,
    extraDeckCount: extraDeck.length,
    sideDeckCount: sideDeck.length,
    monsterCount: monsterCount,
    spellCount: spellCount,
    trapCount: trapCount,
    extraMonsters: {
      link: linkMonsters,
      fusion: fusionMonsters,
      synchro: synchroMonsters,
      xyz: xyzMonsters,
      total: linkMonsters + fusionMonsters + synchroMonsters + xyzMonsters,
    },
    mainTypes: topTypes,
    monsterRaces: Object.entries(monsterRaces)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([race, count]) => `${race} (${count})`),
    attributes: Object.entries(attributes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([attr, count]) => `${attr} (${count})`),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ArchetypeCard({
  archetypeKey,
  result,
  teamWins,
  teamLosses,
  unlockedArchetypes,
  isEligible,
}) {
  const [hovered, setHovered] = useState(false);
  const additionalWins = calculateArchetypeScaling(unlockedArchetypes);

  const glowColor = isEligible
    ? "rgba(52,211,153,0.7)"
    : "rgba(100,116,139,0.3)";
  const borderColor = isEligible
    ? "rgba(52,211,153,0.5)"
    : "rgba(100,116,139,0.2)";
  const bgOpacity = isEligible ? 0.95 : 0.3;
  const textColor = isEligible ? "#e2e8f0" : "rgba(100,116,139,0.5)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative text-left w-full transition-all duration-300"
      style={{
        transform: hovered && isEligible ? "translateY(-3px)" : "none",
        filter: isEligible ? "none" : "grayscale(1) blur(0.5px)",
        opacity: isEligible ? 1 : 0.35,
      }}
    >
      {/* Glow effect for eligible */}
      {isEligible && (
        <div
          className="absolute -inset-px rounded-xl transition-all duration-500"
          style={{
            background:
              "linear-gradient(135deg, rgba(52,211,153,0.5), rgba(16,185,129,0.3), rgba(52,211,153,0.2))",
            opacity: hovered ? 1 : 0,
            borderRadius: "12px",
          }}
        />
      )}

      <div
        className="relative px-6 py-4 rounded-xl overflow-hidden flex flex-col gap-3"
        style={{
          background: `linear-gradient(135deg, rgba(5,20,40,${bgOpacity}) 0%, rgba(8,25,50,${bgOpacity}) 100%)`,
          border: `1.5px solid ${borderColor}`,
          boxShadow:
            hovered && isEligible
              ? `0 0 30px ${glowColor}, 0 0 60px rgba(52,211,153,0.1)`
              : "none",
        }}
      >
        {/* Pattern overlay */}
        {isEligible && (
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(52,211,153,0.1) 10px, rgba(52,211,153,0.1) 11px)",
            }}
          />
        )}

        {/* Header: Name and Status */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="flex-shrink-0 w-3 h-3 rounded-full mt-1"
              style={{
                background: isEligible ? "#34d399" : "#64748b",
                boxShadow: isEligible ? "0 0 8px rgba(52,211,153,0.7)" : "none",
              }}
            />
            <div>
              <span
                className="text-base font-bold"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  color: textColor,
                }}
              >
                {result?.archetypeLabel ?? archetypeKey}
              </span>
              {isEligible && (
                <div
                  className="text-xs font-bold uppercase tracking-wider mt-1"
                  style={{ color: "#34d399" }}
                >
                  🔓 Mở Khóa
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditions details */}
        {result && (
          <div className="relative space-y-2 text-sm">
            {result.checks?.map((check, idx) => (
              <div
                key={idx}
                className="text-xs"
                style={{ color: textColor, lineHeight: 1.5 }}
              >
                <div style={{ color: check.pass ? "#34d399" : "#f87171" }}>
                  {check.pass ? "✓" : "✗"} {check.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({ label, value, color, glow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl p-8 text-center transition-all duration-300"
      style={{
        background:
          "linear-gradient(135deg, rgba(5,15,30,0.95) 0%, rgba(8,20,40,0.9) 100%)",
        border: `1px solid ${hovered ? color + "60" : color + "25"}`,
        boxShadow: hovered ? `0 0 30px ${glow}30, 0 0 60px ${glow}10` : "none",
        transform: hovered ? "translateY(-4px)" : "none",
      }}
    >
      <div
        className="text-5xl font-black mb-2"
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        className="text-sm uppercase tracking-widest font-bold"
        style={{ color: "rgba(148,163,184,0.7)" }}
      >
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  // ─── STATE ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1); // 1 = Team Stats, 2 = Deck Input, 3 = Results

  // Team Stats
  const [teamWins, setTeamWins] = useState("");
  const [teamLosses, setTeamLosses] = useState("");
  const [unlockedArchetypes, setUnlockedArchetypes] = useState("");

  // Deck Input
  const [deckString, setDeckString] = useState("");

  // Results
  const [loading, setLoading] = useState(false);
  const [dbLoading, setDbLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [deckStats, setDeckStats] = useState(null);
  const [banlistResults, setBanlistResults] = useState(null);
  const [error, setError] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, wins, losses, both

  const textareaRef = useRef(null);

  // ─── EFFECTS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .catch(() => {})
      .finally(() => setDbLoading(false));
  }, []);

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleProceedToDecks = () => {
    if (!teamWins || !teamLosses || !unlockedArchetypes) {
      setError(i18n.requiredFields);
      return;
    }
    setError("");
    setStep(2);
  };

  const handleValidate = useCallback(async () => {
    if (!deckString.trim()) {
      setError(i18n.pasteDeckToValidate);
      return;
    }
    setLoading(true);
    setError("");
    setResults(null);
    setBanlistResults(null);

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
        setError(data.error ?? `${i18n.error} ${res.status}`);
      } else {
        setResults(data);
        setDeckStats(parseDeckStats(data.deck));

        // Validate banlist
        const banlistCheck = validateDeckBanlist(
          data.deck?.main || [],
          data.deck?.extra || [],
          data.deck?.side || [],
        );
        setBanlistResults(banlistCheck);

        setStep(3);
      }
    } catch (err) {
      setError(`${i18n.connectionError}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [deckString]);

  const handleClear = () => {
    setDeckString("");
    setResults(null);
    setBanlistResults(null);
    setError("");
    textareaRef.current?.focus();
  };

  const handleTeamMemberToggle = (member) => {
    setSelectedTeamMembers((prev) =>
      prev.includes(member)
        ? prev.filter((m) => m !== member)
        : [...prev, member]
    );
  };

  const handleExportResults = () => {
    if (!results || !deckStats) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      teamStats: {
        wins: parseInt(teamWins) || 0,
        losses: parseInt(teamLosses) || 0,
        unlockedArchetypes: parseInt(unlockedArchetypes) || 0,
        selectedTeamMembers,
        additionalWins,
      },
      deckStats,
      banlistValidation: banlistResults,
      archetypeResults: results.results,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deck-validation-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep(1);
    setTeamWins("");
    setTeamLosses("");
    setUnlockedArchetypes("");
    setDeckString("");
    setResults(null);
    setDeckStats(null);
    setBanlistResults(null);
    setError("");
    setSelectedTeamMembers([]);
    setFilterType("all");
  };

  // Filter archetypes based on requirement type
  const filterArchetypeResults = (results) => {
    if (!results) return { passed: [], failed: [] };

    const passedArchetypes = Object.entries(results.results || {})
      .filter(([_, result]) => result.overallPass)
      .map(([key, result]) => ({ key, result }));

    const failedArchetypes = Object.entries(results.results || {})
      .filter(([_, result]) => !result.overallPass)
      .map(([key, result]) => ({ key, result }));

    if (filterType === "all") {
      return { passed: passedArchetypes, failed: failedArchetypes };
    }

    const filterByType = (archetypes) => {
      return archetypes.filter(({ result }) => {
        if (filterType === "wins") return result.winsRequired > 0;
        if (filterType === "losses") return result.lossesRequired > 0;
        if (filterType === "both") return result.winsRequired > 0 && result.lossesRequired > 0;
        return true;
      });
    };

    return {
      passed: filterByType(passedArchetypes),
      failed: filterByType(failedArchetypes),
    };
  };

  // ─── COMPUTED VALUES ─────────────────────────────────────────────────────
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

  const additionalWins = calculateArchetypeScaling(
    parseInt(unlockedArchetypes) || 0,
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className="min-h-screen relative"
        style={{ background: "#030810", color: "#e2e8f0" }}
      >
        {/* ═══════════════════════════════════════════════════════════════
            BACKGROUND LAYER
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {/* Background image */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('assets/bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.08,
            }}
          />

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
              animation: "pulse 6s ease-in-out infinite",
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
              animation: "pulse 8s ease-in-out infinite 2s",
            }}
          />

          {/* Spinning holographic ring */}
          <div
            className="animate-spin absolute"
            style={{
              top: "50%",
              left: "50%",
              width: "900px",
              height: "900px",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(250,204,21,0.04)",
              borderRadius: "50%",
              borderTopColor: "rgba(250,204,21,0.12)",
              animationDuration: "60s",
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

          {/* Top vignette */}
          <div
            className="absolute inset-x-0 top-0 h-32"
            style={{
              background:
                "linear-gradient(to bottom, rgba(3,8,16,0.8), transparent)",
            }}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════════════════════════ */}
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Top bar */}
              <div
                className="flex items-center justify-between py-4 border-b text-sm"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
              >
                <div
                  className="flex items-center gap-2 font-bold uppercase tracking-widest"
                  style={{ color: "rgba(250,204,21,0.7)" }}
                >
                  <span style={{ color: "#facc15" }}>◆</span>{" "}
                  {i18n.officialTournament}
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
                    className="font-semibold uppercase tracking-wider text-xs"
                    style={{ color: dbLoading ? "#fbbf24" : "#6ee7b7" }}
                  >
                    {dbLoading ? i18n.loadingDB : i18n.dbOnline}
                  </span>
                </div>
              </div>

              {/* Main hero */}
              <div className="py-14 sm:py-20">
                <div className="mb-8">
                  <img
                    src="assets/logo.png"
                    alt="XYGO Tournament Logo"
                    style={{
                      height: "100px",
                      width: "auto",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <h1
                  className="text-4xl sm:text-5xl font-black mb-4"
                  style={{ color: "#facc15" }}
                >
                  {i18n.validatorTitle}
                </h1>

                <p
                  style={{
                    maxWidth: "700px",
                    fontSize: "18px",
                    lineHeight: 1.8,
                    color: "rgba(148,163,184,0.9)",
                    marginBottom: "32px",
                  }}
                >
                  {i18n.validatorDesc}
                </p>

                {/* Stats strip */}
                <div className="flex flex-wrap items-center gap-8">
                  {[
                    { label: "Archetypes", value: "44" },
                    { label: "Kiểm Tra", value: "Tự Động" },
                    { label: "Cập Nhật", value: " mỗi 24h" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          fontSize: "28px",
                          fontWeight: 900,
                          color: "#facc15",
                        }}
                      >
                        {s.value}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "rgba(148,163,184,0.6)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          fontWeight: 600,
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

        {/* ═══════════════════════════════════════════════════════════════
            MAIN CONTENT
        ═══════════════════════════════════════════════════════════════ */}
        <main
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          style={{ zIndex: 10 }}
        >
          {/* ─────────────────────────────────────────────────────────────
              STEP 1: TEAM STATS INPUT
          ───────────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div
                className="rounded-3xl overflow-hidden max-w-2xl mx-auto"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "0 0 0 1px rgba(0,0,0,0.5), 0 25px 60px rgba(0,0,0,0.4)",
                }}
              >
                {/* Panel header */}
                <div
                  className="px-8 py-8 flex items-center gap-3 border-b"
                  style={{
                    borderColor: "rgba(255,255,255,0.05)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                >
                  <div>
                    <h2
                      className="text-3xl font-black mb-1"
                      style={{ color: "#facc15" }}
                    >
                      {i18n.step} 1: {i18n.stepTeamInfo}
                    </h2>
                    <p
                      style={{
                        fontSize: "16px",
                        color: "rgba(148,163,184,0.6)",
                      }}
                    >
                      Nhập thông tin đội của bạn để bắt đầu kiểm tra
                    </p>
                  </div>
                </div>

                {/* Form inputs */}
                <div className="p-8 space-y-8">
                  {/* Wins Input */}
                  <div>
                    <label
                      className="block text-lg font-bold mb-3"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {i18n.teamWins}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={teamWins}
                      onChange={(e) => setTeamWins(e.target.value)}
                      placeholder="VD: 10"
                      className="w-full px-6 py-4 rounded-xl text-lg font-semibold"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e2e8f0",
                      }}
                    />
                  </div>

                  {/* Losses Input */}
                  <div>
                    <label
                      className="block text-lg font-bold mb-3"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {i18n.teamLosses}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={teamLosses}
                      onChange={(e) => setTeamLosses(e.target.value)}
                      placeholder="VD: 5"
                      className="w-full px-6 py-4 rounded-xl text-lg font-semibold"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e2e8f0",
                      }}
                    />
                  </div>

                  {/* Unlocked Archetypes Input */}
                  <div>
                    <label
                      className="block text-lg font-bold mb-3"
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    >
                      {i18n.unlockedArchetypes}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="44"
                      value={unlockedArchetypes}
                      onChange={(e) => setUnlockedArchetypes(e.target.value)}
                      placeholder="VD: 8"
                      className="w-full px-6 py-4 rounded-xl text-lg font-semibold"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#e2e8f0",
                      }}
                    />
                    {unlockedArchetypes && parseInt(unlockedArchetypes) > 5 && (
                      <p
                        className="mt-3 p-4 rounded-lg text-sm font-semibold"
                        style={{
                          background: "rgba(250,204,21,0.1)",
                          color: "#facc15",
                        }}
                      >
                        Điều chỉnh: +{additionalWins} Trận Thắng/Thua yêu cầu
                      </p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      className="p-4 rounded-xl text-base font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Proceed Button */}
                  <button
                    onClick={handleProceedToDecks}
                    className="w-full px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300 hover:shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #facc15 0%, #f59e0b 50%, #ea580c 100%)",
                      color: "#0a0a0a",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 0 30px rgba(250,204,21,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {i18n.proceedToDecks} →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 2: DECK INPUT
          ───────────────────────────────────────────────────────────────── */}
          {/* Team Member Selection - Before Step 2 */}
          {step === 2 && !results && (
            <div
              className="rounded-2xl overflow-hidden p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)",
                border: "1px solid rgba(168,85,247,0.2)",
              }}
            >
              <h3
                className="text-xl font-bold mb-6"
                style={{ color: "#d8b4fe" }}
              >
                📋 Chọn Thành Viên Đội (Tùy Chọn)
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(148,163,184,0.7)",
                  marginBottom: "16px",
                }}
              >
                Chọn các thành viên có trong đội của bạn để nhận Respect Bonuses
              </p>
              <div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
              >
                {TEAM_MEMBERS.map((member) => (
                  <button
                    key={member}
                    onClick={() => handleTeamMemberToggle(member)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      background: selectedTeamMembers.includes(member)
                        ? "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)"
                        : "rgba(168,85,247,0.1)",
                      border: selectedTeamMembers.includes(member)
                        ? "1px solid rgba(168,85,247,0.8)"
                        : "1px solid rgba(168,85,247,0.3)",
                      color: selectedTeamMembers.includes(member)
                        ? "#fce7f3"
                        : "rgba(168,85,247,0.7)",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedTeamMembers.includes(member)) {
                        e.currentTarget.style.background = "rgba(168,85,247,0.2)";
                        e.currentTarget.style.borderColor = "rgba(168,85,247,0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedTeamMembers.includes(member)) {
                        e.currentTarget.style.background = "rgba(168,85,247,0.1)";
                        e.currentTarget.style.borderColor = "rgba(168,85,247,0.3)";
                      }
                    }}
                  >
                    {member}
                  </button>
                ))}
              </div>
              {selectedTeamMembers.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    background: "rgba(168,85,247,0.05)",
                    border: "1px solid rgba(168,85,247,0.2)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#d8b4fe",
                  }}
                >
                  ✓ Đã chọn {selectedTeamMembers.length} thành viên:{" "}
                  {selectedTeamMembers.join(", ")}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="grid lg:grid-cols-5 gap-8 items-start">
                {/* Left column: Input */}
                <div className="lg:col-span-3">
                  <div
                    className="rounded-3xl overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow:
                        "0 0 0 1px rgba(0,0,0,0.5), 0 25px 60px rgba(0,0,0,0.4)",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="px-8 py-8 flex items-center justify-between border-b"
                      style={{
                        borderColor: "rgba(255,255,255,0.05)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div>
                        <h2
                          className="text-3xl font-black mb-1"
                          style={{ color: "#facc15" }}
                        >
                          {i18n.step} 2: {i18n.stepDeckInput}
                        </h2>
                        <p
                          style={{
                            fontSize: "16px",
                            color: "rgba(148,163,184,0.6)",
                          }}
                        >
                          YDKE hoặc YDK format
                        </p>
                      </div>
                      {deckString.trim() && (
                        <div
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full"
                          style={{
                            background: "rgba(250,204,21,0.1)",
                            border: "1px solid rgba(250,204,21,0.3)",
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#facc15" }}
                          />
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#facc15",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            }}
                          >
                            {i18n.ready}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Textarea */}
                    <div className="p-8">
                      <textarea
                        ref={textareaRef}
                        className="w-full px-6 py-4 rounded-xl text-base font-mono resize-none focus:outline-none"
                        value={deckString}
                        onChange={(e) => {
                          setDeckString(e.target.value);
                          setError("");
                        }}
                        placeholder={i18n.deckInputPlaceholder}
                        rows={12}
                        spellCheck={false}
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                      />

                      {/* Error */}
                      {error && (
                        <div
                          className="mt-4 p-4 rounded-xl animate-fade-in text-base"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#fca5a5",
                          }}
                        >
                          {error}
                        </div>
                      )}

                      {/* Buttons */}
                      <div className="flex gap-3 mt-8">
                        <button
                          onClick={handleValidate}
                          disabled={loading || !deckString.trim()}
                          className="flex-1 px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wide transition-all duration-300"
                          style={
                            loading || !deckString.trim()
                              ? {
                                  background: "rgba(255,255,255,0.04)",
                                  color: "rgba(100,116,139,0.6)",
                                  cursor: "not-allowed",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }
                              : {
                                  background:
                                    "linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)",
                                  color: "#050a14",
                                  border: "none",
                                  cursor: "pointer",
                                }
                          }
                          onMouseEnter={(e) => {
                            if (!loading && deckString.trim()) {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 0 30px rgba(52,211,153,0.5)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          {loading ? i18n.analyzingDeck : i18n.validateDeck}
                        </button>

                        <button
                          onClick={() => setStep(1)}
                          className="px-8 py-4 rounded-xl text-base font-bold uppercase tracking-wide transition-all"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(148,163,184,0.8)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(99,102,241,0.1)";
                            e.currentTarget.style.borderColor =
                              "rgba(99,102,241,0.3)";
                            e.currentTarget.style.color = "#a5b4fc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.04)";
                            e.currentTarget.style.borderColor =
                              "rgba(255,255,255,0.08)";
                            e.currentTarget.style.color =
                              "rgba(148,163,184,0.8)";
                          }}
                        >
                          {i18n.backToTeamStats}
                        </button>

                        {deckString && (
                          <button
                            onClick={handleClear}
                            className="px-8 py-4 rounded-xl text-base font-bold uppercase tracking-wide transition-all"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(148,163,184,0.8)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.1)";
                              e.currentTarget.style.borderColor =
                                "rgba(239,68,68,0.3)";
                              e.currentTarget.style.color = "#fca5a5";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.04)";
                              e.currentTarget.style.borderColor =
                                "rgba(255,255,255,0.08)";
                              e.currentTarget.style.color =
                                "rgba(148,163,184,0.8)";
                            }}
                          >
                            {i18n.clear}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Format guide */}
                  <div
                    className="mt-6 p-6 rounded-xl text-sm"
                    style={{
                      background: "rgba(250,204,21,0.03)",
                      border: "1px solid rgba(250,204,21,0.1)",
                      fontSize: "16px",
                      lineHeight: 1.6,
                      color: "rgba(148,163,184,0.8)",
                    }}
                  >
                    Xuất deck từ{" "}
                    <strong style={{ color: "rgba(250,204,21,0.9)" }}>
                      YGO Omega
                    </strong>
                    ,{" "}
                    <strong style={{ color: "rgba(250,204,21,0.9)" }}>
                      YGO ProDeck
                    </strong>{" "}
                    hoặc bất kỳ ứng dụng tương thích nào dưới dạng liên kết YDKE
                    hoặc tệp .ydk.
                  </div>
                </div>

                {/* Right column: Team Info Summary */}
                <div className="lg:col-span-2 space-y-6">
                  <div
                    className="rounded-2xl overflow-hidden p-8"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    <h3
                      className="text-xl font-bold mb-6"
                      style={{ color: "#a5b4fc" }}
                    >
                      Thông Tin Đội
                    </h3>
                    <div className="space-y-4">
                      <div
                        className="flex justify-between items-center pb-3 border-b"
                        style={{ borderColor: "rgba(99,102,241,0.2)" }}
                      >
                        <span
                          style={{
                            color: "rgba(148,163,184,0.7)",
                            fontSize: "16px",
                          }}
                        >
                          Trận Thắng:
                        </span>
                        <span
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: "24px",
                            fontWeight: 900,
                            color: "#a5b4fc",
                          }}
                        >
                          {teamWins}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center pb-3 border-b"
                        style={{ borderColor: "rgba(99,102,241,0.2)" }}
                      >
                        <span
                          style={{
                            color: "rgba(148,163,184,0.7)",
                            fontSize: "16px",
                          }}
                        >
                          Trận Thua:
                        </span>
                        <span
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: "24px",
                            fontWeight: 900,
                            color: "#a5b4fc",
                          }}
                        >
                          {teamLosses}
                        </span>
                      </div>
                      <div
                        className="flex justify-between items-center pb-3 border-b"
                        style={{ borderColor: "rgba(99,102,241,0.2)" }}
                      >
                        <span
                          style={{
                            color: "rgba(148,163,184,0.7)",
                            fontSize: "16px",
                          }}
                        >
                          Archetypes Mở Khóa:
                        </span>
                        <span
                          style={{
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: "24px",
                            fontWeight: 900,
                            color: "#a5b4fc",
                          }}
                        >
                          {unlockedArchetypes}
                        </span>
                      </div>
                      {additionalWins > 0 && (
                        <div
                          className="p-4 rounded-lg border mt-4"
                          style={{
                            background: "rgba(250,204,21,0.08)",
                            border: "1px solid rgba(250,204,21,0.2)",
                            color: "#facc15",
                            fontSize: "14px",
                            fontWeight: 600,
                          }}
                        >
                          Điều chỉnh Scaling: +{additionalWins} Trận Thắng
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              STEP 3: RESULTS
          ───────────────────────────────────────────────────────────────── */}
          {step === 3 && results && (() => {
            const { passed: passedArchetypes, failed: failedArchetypes } = filterArchetypeResults(results);
            return (
              <div className="animate-fade-in space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-4xl font-black mb-2"
                    style={{ color: "#facc15" }}
                  >
                    {i18n.validationResults}
                  </h2>
                  <p
                    style={{ fontSize: "18px", color: "rgba(148,163,184,0.7)" }}
                  >
                    Kiểm tra hoàn tất: {passedArchetypes.length} Archetype đủ
                    điều kiện, {failedArchetypes.length} chưa đủ
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportResults}
                    className="px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(59,130,246,0.5)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    📥 Xuất Kết Quả
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(148,163,184,0.8)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(250,204,21,0.1)";
                      e.currentTarget.style.borderColor = "rgba(250,204,21,0.3)";
                      e.currentTarget.style.color = "#facc15";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "rgba(148,163,184,0.8)";
                    }}
                  >
                    Kiểm Tra Deck Mới
                  </button>
                </div>
              </div>
            );
          })()

              {/* Deck Statistics */}
              {deckStats && (
                <div
                  className="rounded-2xl overflow-hidden p-8 grid grid-cols-2 md:grid-cols-4 gap-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(5,15,35,0.95) 0%, rgba(8,22,50,0.9) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "32px",
                        fontWeight: 900,
                        color: "#34d399",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.archetypes}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {i18n.totalArchetypes}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "32px",
                        fontWeight: 900,
                        color: "#60a5fa",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.monsterCount}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {i18n.totalMonsters}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "32px",
                        fontWeight: 900,
                        color: "#f97316",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.spellCount}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {i18n.totalSpells}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "32px",
                        fontWeight: 900,
                        color: "#e879f9",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.trapCount}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {i18n.totalTraps}
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "#06b6d4",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.mainDeckCount}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      Main
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "#8b5cf6",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.extraDeckCount}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      Extra
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "#ec4899",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.sideDeckCount}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      Side
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Rajdhani', sans-serif",
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "#fbbf24",
                        marginBottom: "8px",
                      }}
                    >
                      {deckStats.totalCards}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      Total
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Monster Breakdown */}
              {deckStats?.extraMonsters && (
                <div
                  className="rounded-2xl overflow-hidden p-8 grid grid-cols-2 md:grid-cols-5 gap-4"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.05) 100%)",
                    border: "1px solid rgba(139,92,246,0.2)",
                  }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#a78bfa",
                      }}
                    >
                      {deckStats.extraMonsters.link}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Link
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#f472b6",
                      }}
                    >
                      {deckStats.extraMonsters.fusion}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Fusion
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#60a5fa",
                      }}
                    >
                      {deckStats.extraMonsters.synchro}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Synchro
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#34d399",
                      }}
                    >
                      {deckStats.extraMonsters.xyz}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Xyz
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#facc15",
                      }}
                    >
                      {deckStats.extraMonsters.total}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(148,163,184,0.7)",
                      }}
                    >
                      Total
                    </div>
                  </div>
                </div>
              )}

              {/* Primary Card Types */}
              {deckStats?.mainTypes && deckStats.mainTypes.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden p-8"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.05) 100%)",
                    border: "1px solid rgba(52,211,153,0.2)",
                  }}
                >
                  <h4
                    style={{
                      color: "#34d399",
                      fontSize: "16px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    Chủ Lực Type Main Deck:
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {deckStats.mainTypes.map((type, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "6px 12px",
                          background: "rgba(52,211,153,0.1)",
                          border: "1px solid rgba(52,211,153,0.3)",
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: "#6ee7b7",
                          fontWeight: 600,
                        }}
                      >
                        {type}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Banlist Validation */}
              {banlistResults && (
                <div
                  className="rounded-2xl overflow-hidden p-8"
                  style={{
                    background: banlistResults.isValid
                      ? "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.05) 100%)"
                      : "linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(239,68,68,0.05) 100%)",
                    border: banlistResults.isValid
                      ? "1px solid rgba(52,211,153,0.3)"
                      : "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "24px",
                        color: banlistResults.isValid ? "#34d399" : "#ef4444",
                      }}
                    >
                      {banlistResults.isValid ? "✓" : "✗"}
                    </span>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: banlistResults.isValid ? "#34d399" : "#ef4444",
                      }}
                    >
                      {i18n.banlistValidation} {banlistResults.banlistVersion}
                    </h3>
                  </div>

                  {banlistResults.isValid ? (
                    <p
                      style={{
                        color: "#6ee7b7",
                        fontSize: "14px",
                      }}
                    >
                      ✓ Deck tuân thủ hoàn toàn với Banlist OCG 4/2026. Không có
                      vi phạm.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      {banlistResults.violations.map((violation, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "12px",
                            background: "rgba(239,68,68,0.05)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            borderRadius: "6px",
                            fontSize: "13px",
                            color: "#fca5a5",
                          }}
                        >
                          <strong>{violation.cardName}</strong>:{" "}
                          {violation.violation} (Status: {violation.status},
                          Max: {violation.maxCopies})
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          background: "rgba(239,68,68,0.1)",
                          borderRadius: "4px",
                          fontSize: "12px",
                          color: "#fca5a5",
                          fontWeight: 600,
                        }}
                      >
                        Tổng: {banlistResults.totalViolations} lá bài vi phạm
                      </div>
                    </div>
                  )}
                </div>
              )}

                {/* Archetype Filter */}
                <div
                  className="rounded-2xl overflow-hidden p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.05) 100%)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <h4
                    style={{
                      color: "#60a5fa",
                      fontSize: "14px",
                      fontWeight: 700,
                      marginBottom: "12px",
                    }}
                  >
                    🔍 Lọc Archetype:
                  </h4>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      { value: "all", label: "Tất Cả" },
                      { value: "wins", label: "Yêu Cầu Wins" },
                      { value: "losses", label: "Yêu Cầu Losses" },
                      { value: "both", label: "Cả 2 Yêu Cầu" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilterType(option.value)}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background:
                            filterType === option.value
                              ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                              : "rgba(59,130,246,0.1)",
                          border:
                            filterType === option.value
                              ? "1px solid rgba(59,130,246,0.8)"
                              : "1px solid rgba(59,130,246,0.3)",
                          color:
                            filterType === option.value
                              ? "#fff"
                              : "#60a5fa",
                          cursor: "pointer",
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eligible Archetypes */}
                {passedArchetypes.length > 0 && (
                  <div>
                    <h3
                      className="text-2xl font-black mb-6"
                      style={{ color: "#34d399" }}
                    >
                      ✓ {i18n.eligibleArchetypes} ({passedArchetypes.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {passedArchetypes.map(({ key, result }) => (
                        <ArchetypeCard
                          key={key}
                          archetypeKey={key}
                          result={result}
                          teamWins={parseInt(teamWins)}
                          teamLosses={parseInt(teamLosses)}
                          unlockedArchetypes={parseInt(unlockedArchetypes)}
                          selectedTeamMembers={selectedTeamMembers}
                          isEligible={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Ineligible Archetypes */}
                {failedArchetypes.length > 0 && (
                  <div>
                    <h3
                      className="text-2xl font-black mb-6"
                      style={{ color: "rgba(100,116,139,0.7)" }}
                    >
                      ✗ {i18n.ineligibleArchetypes} ({failedArchetypes.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {failedArchetypes.map(({ key, result }) => (
                        <ArchetypeCard
                          key={key}
                          archetypeKey={key}
                          result={result}
                          teamWins={parseInt(teamWins)}
                          teamLosses={parseInt(teamLosses)}
                          unlockedArchetypes={parseInt(unlockedArchetypes)}
                          selectedTeamMembers={selectedTeamMembers}
                          isEligible={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {passedArchetypes.length === 0 &&
                  failedArchetypes.length === 0 && (
                    <div
                      className="p-8 rounded-2xl text-center text-xl"
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        color: "rgba(148,163,184,0.8)",
                      }}
                    >
                      {i18n.noEligible}
                    </div>
                  )}
              </div>
            );
          })()}
        </main>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
