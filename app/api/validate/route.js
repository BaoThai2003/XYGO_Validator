/**
 * app/api/validate/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js App Router API Route — POST /api/validate
 *
 * Flow:
 *  1. Nhận { deckString, archetype?, validateAll?, selectedArchetypes, ... }
 *  2. Phát hiện format (YDKE hay YDK text)
 *  3. Parse → mảng passcode cho main/extra/side
 *  4. Map passcode → CardData qua card database
 *  5. Chạy Rules Engine
 *  6. Kiểm tra archetype chưa mở khóa (unlockedViolations)
 *  7. Trả JSON kết quả
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { getCardDatabase } from "@/utils/ygoprodeck";
import {
  validateDeck,
  ARCHETYPE_RULES,
  calculateArchetypeBonus,
} from "@/utils/rulesEngine";
import { validateDeckBanlist } from "@/utils/banlist";

// ─── YDKE Parser ──────────────────────────────────────────────────────────────

function parseYDKE(ydkeString) {
  const trimmed = ydkeString.trim();

  if (!trimmed.startsWith("ydke://")) {
    throw new Error(
      'Chuỗi YDKE phải bắt đầu bằng "ydke://". Vui lòng kiểm tra lại.',
    );
  }

  const body = trimmed.slice("ydke://".length);
  const parts = body.split("!");

  if (parts.length < 3) {
    throw new Error(
      `YDKE không hợp lệ: cần ít nhất 3 segment (main!extra!side), chỉ có ${parts.length}.`,
    );
  }

  const [mainB64, extraB64, sideB64] = parts;

  return {
    main: decodeSegment(mainB64, "main"),
    extra: decodeSegment(extraB64, "extra"),
    side: decodeSegment(sideB64, "side"),
  };
}

function decodeSegment(b64, segName) {
  if (!b64) return [];

  let buffer;
  try {
    if (typeof Buffer !== "undefined") {
      buffer = Buffer.from(b64, "base64");
    } else {
      const binary = atob(b64);
      buffer = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        buffer[i] = binary.charCodeAt(i);
      }
    }
  } catch {
    throw new Error(`Không thể decode base64 segment "${segName}": "${b64}".`);
  }

  if (buffer.length % 4 !== 0) {
    throw new Error(
      `Segment "${segName}" có độ dài byte (${buffer.length}) không chia hết cho 4.`,
    );
  }

  const passcodes = [];
  const view = new DataView(
    buffer.buffer ?? buffer,
    buffer.byteOffset ?? 0,
    buffer.byteLength ?? buffer.length,
  );

  for (let i = 0; i < buffer.length; i += 4) {
    passcodes.push(view.getUint32(i, true)); // little-endian
  }

  return passcodes;
}

// ─── YDK Text Parser ──────────────────────────────────────────────────────────

function parseYDK(ydkText) {
  const lines = ydkText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result = { main: [], extra: [], side: [] };
  let currentSection = null;

  for (const line of lines) {
    if (line === "#main") {
      currentSection = "main";
      continue;
    }
    if (line === "#extra") {
      currentSection = "extra";
      continue;
    }
    if (line === "!side") {
      currentSection = "side";
      continue;
    }
    if (line.startsWith("#") || line.startsWith("!") || line.startsWith("//")) {
      continue;
    }

    const id = parseInt(line, 10);
    if (!isNaN(id) && currentSection) {
      result[currentSection].push(id);
    }
  }

  if (result.main.length === 0 && result.extra.length === 0) {
    throw new Error(
      "File YDK không có card nào được nhận diện. Kiểm tra format #main / #extra.",
    );
  }

  return result;
}

// ─── Auto-detect Format ───────────────────────────────────────────────────────

function parseDeckInput(input) {
  const trimmed = input.trim();

  if (trimmed.startsWith("ydke://")) {
    return parseYDKE(trimmed);
  }

  if (trimmed.includes("#main") || trimmed.includes("#extra")) {
    return parseYDK(trimmed);
  }

  throw new Error(
    'Không nhận ra định dạng. Vui lòng dán chuỗi "ydke://..." hoặc nội dung file .ydk (có #main, #extra).',
  );
}

// ─── Map Passcodes → CardData ─────────────────────────────────────────────────

function mapIdsToCards(ids, db) {
  const cards = [];
  const unknownIds = [];

  for (const id of ids) {
    const card = db.get(id);
    if (card) {
      cards.push(card);
    } else {
      unknownIds.push(id);
    }
  }

  return { cards, unknownIds };
}

// ─── Apply Archetype Bonuses ──────────────────────────────────────────────────

function applyArchetypeBonuses(
  validationResult,
  archetypeKey,
  bonusMap,
  teamWins,
  teamLosses,
) {
  if (!bonusMap[archetypeKey] || bonusMap[archetypeKey].total === 0) {
    return validationResult;
  }

  const bonus = bonusMap[archetypeKey].total;

  const newWinsRequired = Math.max(
    0,
    (validationResult.winsRequired || 0) - bonus,
  );
  const newLossesRequired = Math.max(
    0,
    (validationResult.lossesRequired || 0) - bonus,
  );

  const winsConditionMet = newWinsRequired === 0 || teamWins >= newWinsRequired;
  const lossesConditionMet =
    newLossesRequired === 0 || teamLosses >= newLossesRequired;
  const winsOrLossesConditionMet =
    validationResult.winsOrLossesConditionMet !== false
      ? validationResult.winsOrLossesConditionMet
      : false;
  const teamConditionMet =
    winsConditionMet && lossesConditionMet && winsOrLossesConditionMet;

  return {
    ...validationResult,
    winsRequired: newWinsRequired,
    lossesRequired: newLossesRequired,
    winsConditionMet,
    lossesConditionMet,
    teamConditionMet,
    overallPass: validationResult.deckConditionMet && teamConditionMet,
    bonusApplied: {
      scalingBonus: bonusMap[archetypeKey].scalingBonus,
      specialBonus: bonusMap[archetypeKey].specialBonus,
      total: bonus,
    },
  };
}

// ─── Detect which archetypes are present in a deck ────────────────────────────

/**
 * For each archetype in ARCHETYPE_RULES, run its deck checks against the deck.
 * Returns list of archetypeKeys whose deck condition is met (i.e. cards are present).
 * Used to detect unlocked violations.
 */
function detectArchetypesInDeck(mainDeck, extraDeck, sideDeck) {
  const detected = [];
  const allCards = { mainDeck, extraDeck, sideDeck };

  for (const [key, archetype] of Object.entries(ARCHETYPE_RULES)) {
    if (!archetype.checks || archetype.checks.length === 0) continue;
    try {
      const checkResults = archetype.checks.map((check) => check(allCards));
      // Deck condition met = archetype's card requirements are satisfied in this deck
      if (checkResults.every((r) => r.pass)) {
        detected.push(key);
      }
    } catch {
      // Ignore check errors during detection
    }
  }

  return detected;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: "Request body không hợp lệ. Cần JSON." },
        { status: 400 },
      );
    }

    const {
      deckString,
      archetype,
      validateAll,
      teamMembers = [],
      teamWins = 0,
      teamLosses = 0,
      selectedArchetypes = [],
      archetypeBonuses = {},
    } = body;

    if (!deckString || typeof deckString !== "string" || !deckString.trim()) {
      return NextResponse.json(
        { error: "Thiếu trường `deckString` hoặc bị rỗng." },
        { status: 400 },
      );
    }

    const shouldValidateAll = validateAll === true;

    if (!shouldValidateAll) {
      if (!archetype || typeof archetype !== "string") {
        return NextResponse.json(
          { error: "Thiếu trường `archetype`." },
          { status: 400 },
        );
      }

      if (!ARCHETYPE_RULES[archetype]) {
        return NextResponse.json(
          {
            error: `Archetype "${archetype}" không tồn tại. Các archetype hợp lệ: ${Object.keys(ARCHETYPE_RULES).join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // 1. Parse deck string
    let parsedIds;
    try {
      parsedIds = parseDeckInput(deckString);
    } catch (parseErr) {
      return NextResponse.json(
        { error: `Lỗi parse deck: ${parseErr.message}` },
        { status: 422 },
      );
    }

    const { main: mainIds, extra: extraIds, side: sideIds } = parsedIds;

    if (mainIds.length === 0) {
      return NextResponse.json(
        { error: "Main Deck không có card nào. Kiểm tra lại chuỗi deck." },
        { status: 422 },
      );
    }

    // 2. Fetch card database (cached)
    let db;
    try {
      db = await getCardDatabase();
    } catch (dbErr) {
      return NextResponse.json(
        {
          error: `Không thể tải Card Database từ YGOPRODeck: ${dbErr.message}. Vui lòng thử lại sau.`,
        },
        { status: 503 },
      );
    }

    // 3. Map IDs → CardData
    const { cards: mainDeck, unknownIds: unknownMain } = mapIdsToCards(
      mainIds,
      db,
    );
    const { cards: extraDeck, unknownIds: unknownExtra } = mapIdsToCards(
      extraIds,
      db,
    );
    const { cards: sideDeck, unknownIds: unknownSide } = mapIdsToCards(
      sideIds,
      db,
    );

    const allUnknown = [
      ...unknownMain.map((id) => ({ id, zone: "main" })),
      ...unknownExtra.map((id) => ({ id, zone: "extra" })),
      ...unknownSide.map((id) => ({ id, zone: "side" })),
    ];

    // 4. Detect unlocked archetype violations
    // If a deck satisfies an archetype's deck condition but that archetype
    // is NOT in selectedArchetypes, it's a violation.
    const detectedArchetypes = detectArchetypesInDeck(
      mainDeck,
      extraDeck,
      sideDeck,
    );
    const unlockedSet = new Set(selectedArchetypes);

    const unlockedViolations = detectedArchetypes
      .filter((key) => !unlockedSet.has(key))
      .map((key) => ({
        archetypeKey: key,
        archetypeLabel: ARCHETYPE_RULES[key]?.label || key,
      }));

    // Whether the deck is invalid due to unlocked violations
    const hasViolations = unlockedViolations.length > 0;

    if (shouldValidateAll) {
      // Validate against ALL archetypes
      const allResults = {};

      const bonusMap =
        selectedArchetypes.length > 0
          ? calculateArchetypeBonus(selectedArchetypes)
          : {};

      for (const archetypeKey of Object.keys(ARCHETYPE_RULES)) {
        try {
          const validationResult = validateDeck(
            archetypeKey,
            { mainDeck, extraDeck, sideDeck },
            parseInt(teamWins) || 0,
            parseInt(teamLosses) || 0,
            teamMembers,
          );

          allResults[archetypeKey] = applyArchetypeBonuses(
            validationResult,
            archetypeKey,
            bonusMap,
            parseInt(teamWins) || 0,
            parseInt(teamLosses) || 0,
          );
        } catch (ruleErr) {
          allResults[archetypeKey] = {
            error: `Lỗi Rules Engine: ${ruleErr.message}`,
            overallPass: false,
          };
        }
      }

      // If there are violations, mark all results as failed
      if (hasViolations) {
        for (const key of Object.keys(allResults)) {
          allResults[key] = {
            ...allResults[key],
            overallPass: false,
            unlockedViolation: true,
          };
        }
      }

      const banlistValidation = validateDeckBanlist(
        mainDeck,
        extraDeck,
        sideDeck,
      );

      return NextResponse.json({
        success: true,
        validateAll: true,
        results: allResults,
        unlockedViolations,
        hasUnlockedViolations: hasViolations,
        deck: {
          main: mainDeck,
          extra: extraDeck,
          side: sideDeck,
        },
        banlistValidation,
        deckStats: {
          mainCount: mainDeck.length,
          extraCount: extraDeck.length,
          sideCount: sideDeck.length,
          unknownCards: allUnknown,
        },
        bonuses: {
          selectedArchetypes,
          archetypeBonuses: bonusMap,
        },
        warnings:
          allUnknown.length > 0
            ? [
                `${allUnknown.length} card không tìm thấy trong DB và bị bỏ qua: ${allUnknown
                  .slice(0, 5)
                  .map((u) => u.id)
                  .join(", ")}${allUnknown.length > 5 ? "..." : ""}`,
              ]
            : [],
      });
    } else {
      // Validate single archetype (original behavior)
      let validationResult;
      try {
        validationResult = validateDeck(
          archetype,
          { mainDeck, extraDeck, sideDeck },
          parseInt(teamWins) || 0,
          parseInt(teamLosses) || 0,
          teamMembers,
        );
      } catch (ruleErr) {
        return NextResponse.json(
          { error: `Lỗi Rules Engine: ${ruleErr.message}` },
          { status: 500 },
        );
      }

      // If violations, override pass result
      if (hasViolations) {
        validationResult = {
          ...validationResult,
          overallPass: false,
          unlockedViolation: true,
        };
      }

      const banlistValidation = validateDeckBanlist(
        mainDeck,
        extraDeck,
        sideDeck,
      );

      return NextResponse.json({
        success: true,
        archetype,
        ...validationResult,
        unlockedViolations,
        hasUnlockedViolations: hasViolations,
        deck: {
          main: mainDeck,
          extra: extraDeck,
          side: sideDeck,
        },
        banlistValidation,
        deckStats: {
          mainCount: mainDeck.length,
          extraCount: extraDeck.length,
          sideCount: sideDeck.length,
          unknownCards: allUnknown,
        },
        warnings:
          allUnknown.length > 0
            ? [
                `${allUnknown.length} card không tìm thấy trong DB và bị bỏ qua: ${allUnknown
                  .slice(0, 5)
                  .map((u) => u.id)
                  .join(", ")}${allUnknown.length > 5 ? "..." : ""}`,
              ]
            : [],
      });
    }
  } catch (err) {
    console.error("[/api/validate] Unhandled error:", err);
    return NextResponse.json(
      { error: `Lỗi máy chủ không xác định: ${err.message}` },
      { status: 500 },
    );
  }
}

// GET: trả về danh sách archetype hợp lệ (để UI load dropdown)
export async function GET() {
  const archetypes = Object.entries(ARCHETYPE_RULES).map(([key, rule]) => ({
    key,
    label: rule.label,
    description: rule.description,
    teamConditionType: rule.teamConditionType || "wins",
    winsRequired: rule.winsRequired || 0,
    lossesRequired: rule.lossesRequired || 0,
    winsOrLossesRequired: rule.winsOrLossesRequired || 0,
    rewardCards: rule.rewardCards || null,
  }));

  return NextResponse.json({ archetypes });
}
