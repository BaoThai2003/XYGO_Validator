"use client";

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
].sort();

export default function Page() {
  const [step, setStep] = useState(1);
  const [teamWins, setTeamWins] = useState("");
  const [teamLosses, setTeamLosses] = useState("");
  const [unlockedArchetypes, setUnlockedArchetypes] = useState("");
  const [deckString, setDeckString] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [deckStats, setDeckStats] = useState(null);
  const [banlistResults, setBanlistResults] = useState(null);
  const [error, setError] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const textareaRef = useRef(null);

  const additionalWins =
    Math.max(0, parseInt(unlockedArchetypes || 0) - 10) * 5;

  const i18n = {
    title: "Yu-Gi-Oh! Trận Đấu Kiểm Tra Deck",
    step: "Bước",
    stepTeamStats: "Thông Tin Đội",
    teamWinsLabel: "Trận Thắng",
    teamLossesLabel: "Trận Thua",
    unlockedArchetypesLabel: "Archetypes Mở Khóa",
    nextStep: "Tiếp Theo",
    stepDeckInput: "Nhập Deck",
    ydkeLink: "Liên Kết YDKE",
    ydkFile: "Tệp YDK",
    plaintextDeck: "Plaintext Deck",
    validateDeck: "Xác Thực Deck",
    analyzingDeck: "Đang Phân Tích Deck...",
    pasteDeckToValidate: "Dán Deck Để Xác Thực",
    clear: "Xóa",
    ready: "Sẵn Sàng",
    exportOptions: "Tùy Chọn Nhập Deck",
    validationResults: "Kết Quả Xác Thực",
    eligibleArchetypes: "Archetype Đủ Điều Kiện",
    ineligibleArchetypes: "Archetype Không Đủ Điều Kiện",
    noEligible: "Không có Archetype nào đủ điều kiện",
    deckStatistics: "Thống Kê Deck",
    totalArchetypes: "Tổng Archetypes",
    totalMonsters: "Tổng Monster",
    totalSpells: "Tổng Spell",
    totalTraps: "Tổng Trap",
    mainDeck: "Main Deck",
    extraDeck: "Extra Deck",
    sideDeck: "Side Deck",
    connectionError: "Lỗi Kết Nối",
    error: "Lỗi",
    tryAgain: "Thử Lại",
    backToTeamStats: "Quay Lại Thông Tin Đội",
    banlistValidation: "Kiểm Tra Banlist OCG 4/2026",
  };

  const parseDeckStats = (deckData) => {
    if (!deckData || !deckData.deck) return null;
    const mainDeck = deckData.deck.main || [];
    const extraDeck = deckData.deck.extra || [];
    const sideDeck = deckData.deck.side || [];

    const archetypeCount = new Set(
      [...mainDeck, ...extraDeck, ...sideDeck]
        .map((c) => c.archetype)
        .filter(Boolean),
    ).size;

    return {
      totalCards: mainDeck.length + extraDeck.length + sideDeck.length,
      archetypes: archetypeCount,
      mainDeckCount: mainDeck.length,
      extraDeckCount: extraDeck.length,
      sideDeckCount: sideDeck.length,
      monsterCount: [...mainDeck, ...extraDeck].filter((c) => c.isMonster)
        .length,
      spellCount: [...mainDeck, ...sideDeck].filter(
        (c) => c.type === "Spell Card",
      ).length,
      trapCount: [...mainDeck, ...sideDeck].filter(
        (c) => c.type === "Trap Card",
      ).length,
      extraMonsters: {
        link: extraDeck.filter((c) => c.isLink).length,
        fusion: extraDeck.filter((c) => c.isFusion).length,
        synchro: extraDeck.filter((c) => c.isSynchro).length,
        xyz: extraDeck.filter((c) => c.isXyz).length,
        total: extraDeck.filter(
          (c) => c.isLink || c.isFusion || c.isSynchro || c.isXyz,
        ).length,
      },
    };
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
          teamMembers: selectedTeamMembers,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `${i18n.error} ${res.status}`);
      } else {
        setResults(data);
        setDeckStats(parseDeckStats(data));
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
  }, [deckString, selectedTeamMembers]);

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
        : [...prev, member],
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

  const filterArchetypeResults = () => {
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
        if (filterType === "both")
          return result.winsRequired > 0 && result.lossesRequired > 0;
        return true;
      });
    };

    return {
      passed: filterByType(passedArchetypes),
      failed: filterByType(failedArchetypes),
    };
  };

  const { passed: passedArchetypes, failed: failedArchetypes } =
    filterArchetypeResults();

  return (
    <>
      <div
        className="min-h-screen"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(30, 41, 82, 0.8) 0%, rgba(7, 8, 23, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          backgroundImage: `url('/bg2.jpg')`,
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundBlendMode: "overlay",
        }}
      >
        <main className="px-6 sm:px-8 lg:px-16 py-12 max-w-7xl mx-auto space-y-8">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-8">
            <img
              src="/logo.jpg"
              alt="YuGiOh Validator Logo"
              className="h-20 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* STEP 1: TEAM STATS */}
          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2
                    className="text-4xl font-black mb-2"
                    style={{ color: "#facc15" }}
                  >
                    {i18n.step} 1: {i18n.stepTeamStats}
                  </h2>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Input Fields */}
                <div className="lg:col-span-1 space-y-6">
                  {[
                    {
                      label: i18n.teamWinsLabel,
                      value: teamWins,
                      setter: setTeamWins,
                    },
                    {
                      label: i18n.teamLossesLabel,
                      value: teamLosses,
                      setter: setTeamLosses,
                    },
                    {
                      label: i18n.unlockedArchetypesLabel,
                      value: unlockedArchetypes,
                      setter: setUnlockedArchetypes,
                    },
                  ].map((field, idx) => (
                    <div key={idx}>
                      <label
                        style={{
                          color: "#a5b4fc",
                          fontSize: "14px",
                          fontWeight: 600,
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        {field.label}
                      </label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        className="w-full px-6 py-4 rounded-xl text-base focus:outline-none"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#e2e8f0",
                        }}
                        placeholder="0"
                      />
                    </div>
                  ))}

                  {additionalWins > 0 && (
                    <div
                      className="p-4 rounded-lg border"
                      style={{
                        background: "rgba(250,204,21,0.08)",
                        border: "1px solid rgba(250,204,21,0.2)",
                        color: "#facc15",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Scaling: +{additionalWins} Wins
                    </div>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    disabled={!teamWins || !teamLosses || !unlockedArchetypes}
                    className="w-full px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wide transition-all"
                    style={{
                      background:
                        teamWins && teamLosses && unlockedArchetypes
                          ? "linear-gradient(135deg, #34d399 0%, #10b981 100%)"
                          : "rgba(255,255,255,0.04)",
                      color:
                        teamWins && teamLosses && unlockedArchetypes
                          ? "#050a14"
                          : "rgba(100,116,139,0.6)",
                      border: "none",
                      cursor:
                        teamWins && teamLosses && unlockedArchetypes
                          ? "pointer"
                          : "not-allowed",
                    }}
                  >
                    {i18n.nextStep} →
                  </button>
                </div>

                {/* Summary */}
                <div className="lg:col-span-2">
                  <div
                    className="rounded-2xl p-8"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)",
                      border: "1px solid rgba(99,102,241,0.2)",
                    }}
                  >
                    <h3
                      style={{
                        color: "#a5b4fc",
                        fontSize: "20px",
                        fontWeight: 700,
                        marginBottom: "24px",
                      }}
                    >
                      Tóm Tắt
                    </h3>
                    {[
                      {
                        label: "Trận Thắng:",
                        value: teamWins || "—",
                        color: "#34d399",
                      },
                      {
                        label: "Trận Thua:",
                        value: teamLosses || "—",
                        color: "#ef4444",
                      },
                      {
                        label: "Archetypes Mở Khóa:",
                        value: unlockedArchetypes || "—",
                        color: "#a5b4fc",
                      },
                      {
                        label: "Scaling Adds:",
                        value: additionalWins > 0 ? `+${additionalWins}` : "0",
                        color: "#facc15",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center pb-4 border-b"
                        style={{ borderColor: "rgba(99,102,241,0.2)" }}
                      >
                        <span style={{ color: "rgba(148,163,184,0.7)" }}>
                          {item.label}
                        </span>
                        <span
                          style={{
                            color: item.color,
                            fontWeight: 900,
                            fontSize: "24px",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DECK INPUT */}
          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              {/* Team Member Selection */}
              <div
                className="rounded-2xl p-8"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.05) 100%)",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <h3
                  style={{
                    color: "#d8b4fe",
                    fontSize: "18px",
                    fontWeight: 700,
                    marginBottom: "16px",
                  }}
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
                  Chọn các thành viên có trong đội của bạn để nhận Respect
                  Bonuses
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {TEAM_MEMBERS.map((member) => (
                    <button
                      key={member}
                      onClick={() => handleTeamMemberToggle(member)}
                      className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
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

              {/* Deck Input Section */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.05) 100%)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <div
                  className="px-8 py-8 flex items-center justify-between border-b"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}
                >
                  <div>
                    <h2
                      className="text-3xl font-black mb-1"
                      style={{ color: "#facc15" }}
                    >
                      {i18n.step} 2: {i18n.stepDeckInput}
                    </h2>
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
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: "#facc15",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#facc15",
                          fontWeight: 700,
                        }}
                      >
                        READY
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <textarea
                    ref={textareaRef}
                    className="w-full px-6 py-4 rounded-xl text-base font-mono resize-none focus:outline-none"
                    value={deckString}
                    onChange={(e) => {
                      setDeckString(e.target.value);
                      setError("");
                    }}
                    placeholder="ydke://... hoặc paste YDK"
                    rows={12}
                    spellCheck={false}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                    }}
                  />

                  {error && (
                    <div
                      className="mt-4 p-4 rounded-xl text-base"
                      style={{
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        color: "#fca5a5",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleValidate}
                      disabled={loading || !deckString.trim()}
                      className="flex-1 px-8 py-4 rounded-xl text-lg font-bold uppercase tracking-wide transition-all"
                      style={{
                        background:
                          loading || !deckString.trim()
                            ? "rgba(255,255,255,0.04)"
                            : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                        color:
                          loading || !deckString.trim()
                            ? "rgba(100,116,139,0.6)"
                            : "#050a14",
                        border: "none",
                        cursor:
                          loading || !deckString.trim()
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {loading ? i18n.analyzingDeck : i18n.validateDeck}
                    </button>

                    <button
                      onClick={() => setStep(1)}
                      className="px-8 py-4 rounded-xl text-base font-bold uppercase transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        color: "rgba(148,163,184,0.8)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                      }}
                    >
                      {i18n.backToTeamStats}
                    </button>

                    {deckString && (
                      <button
                        onClick={handleClear}
                        className="px-8 py-4 rounded-xl text-base font-bold uppercase transition-all"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          color: "rgba(148,163,184,0.8)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        {i18n.clear}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 3 && results && (
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
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportResults}
                    className="px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "14px",
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
                  >
                    Kiểm Tra Deck Mới
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div
                className="rounded-2xl p-6"
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
                        color: filterType === option.value ? "#fff" : "#60a5fa",
                        cursor: "pointer",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Passed Archetypes */}
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
                      <div
                        key={key}
                        className="rounded-xl p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.05) 100%)",
                          border: "1px solid rgba(52,211,153,0.2)",
                        }}
                      >
                        <h4
                          style={{
                            color: "#6ee7b7",
                            fontSize: "18px",
                            fontWeight: 700,
                            marginBottom: "12px",
                          }}
                        >
                          {key}
                        </h4>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(148,163,184,0.8)",
                            lineHeight: 1.6,
                          }}
                        >
                          <p>✓ Đủ Điều Kiện Deck</p>
                          <p>✓ Đủ Điều Kiện Đội</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed Archetypes */}
              {failedArchetypes.length > 0 && (
                <div>
                  <h3
                    className="text-2xl font-black mb-6"
                    style={{ color: "rgba(100,116,139,0.7)" }}
                  >
                    ✗ {i18n.ineligibleArchetypes} ({failedArchetypes.length})
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {failedArchetypes.map(({ key }) => (
                      <div
                        key={key}
                        className="rounded-xl p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, rgba(107,114,128,0.1) 0%, rgba(107,114,128,0.05) 100%)",
                          border: "1px solid rgba(107,114,128,0.2)",
                        }}
                      >
                        <h4
                          style={{
                            color: "rgba(209,213,219,0.7)",
                            fontSize: "18px",
                            fontWeight: 700,
                            marginBottom: "12px",
                          }}
                        >
                          {key}
                        </h4>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "rgba(148,163,184,0.7)",
                            lineHeight: 1.6,
                          }}
                        >
                          <p>✗ Điều kiện không đủ</p>
                        </div>
                      </div>
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
          )}
        </main>
      </div>

      <style jsx>{`
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
