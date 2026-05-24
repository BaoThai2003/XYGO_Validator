/**
 * app/api/validate/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Next.js App Router API Route — POST /api/validate
 *
 * Flow:
 *  1. Nhận { deckString: string, archetype: string } từ body.
 *  2. Phát hiện format (YDKE hay YDK text).
 *  3. Parse → mảng passcode cho main/extra/side.
 *  4. Map passcode → CardData qua card database.
 *  5. Chạy Rules Engine.
 *  6. Trả JSON kết quả.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { getCardDatabase } from "@/utils/ygoprodeck";
import { validateDeck, ARCHETYPE_RULES } from "@/utils/rulesEngine";

// ─── YDKE Parser ──────────────────────────────────────────────────────────────

/**
 * Parse chuỗi ydke:// thành { main, extra, side } mảng passcode.
 * Format: ydke://<base64_main>!<base64_extra>!<base64_side>!
 *
 * Mỗi segment là base64 của chuỗi bytes chứa passcode dạng Uint32 (little-endian, 4 byte/card).
 *
 * @param {string} ydkeString
 * @returns {{ main: number[], extra: number[], side: number[] }}
 */
function parseYDKE(ydkeString) {
  const trimmed = ydkeString.trim();

  if (!trimmed.startsWith("ydke://")) {
    throw new Error(
      'Chuỗi YDKE phải bắt đầu bằng "ydke://". Vui lòng kiểm tra lại.',
    );
  }

  // Bỏ prefix "ydke://" và split theo "!"
  const body = trimmed.slice("ydke://".length);
  const parts = body.split("!");

  // Phải có ít nhất 3 phần (main!extra!side)
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

/**
 * Decode một base64 segment thành mảng passcode (Uint32 little-endian).
 * @param {string} b64
 * @param {string} segName   - Tên segment để debug
 * @returns {number[]}
 */
function decodeSegment(b64, segName) {
  if (!b64) return [];

  let buffer;
  try {
    // Node.js: dùng Buffer; Browser fallback: atob
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

/**
 * Parse nội dung file .ydk (text thuần) thành { main, extra, side }.
 *
 * Format YDK:
 *   #main
 *   123456789
 *   987654321
 *   #extra
 *   111111111
 *   !side
 *   222222222
 *
 * @param {string} ydkText
 * @returns {{ main: number[], extra: number[], side: number[] }}
 */
function parseYDK(ydkText) {
  const lines = ydkText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const result = { main: [], extra: [], side: [] };
  let currentSection = null;

  for (const line of lines) {
    // Nhận biết section header
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
    // Bỏ qua comment hoặc dòng không phải số
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

/**
 * Tự động nhận biết YDKE vs YDK và parse.
 * @param {string} input
 * @returns {{ main: number[], extra: number[], side: number[] }}
 */
function parseDeckInput(input) {
  const trimmed = input.trim();

  if (trimmed.startsWith("ydke://")) {
    return parseYDKE(trimmed);
  }

  // Kiểm tra xem có dạng YDK không (chứa #main hoặc #extra)
  if (trimmed.includes("#main") || trimmed.includes("#extra")) {
    return parseYDK(trimmed);
  }

  throw new Error(
    'Không nhận ra định dạng. Vui lòng dán chuỗi "ydke://..." hoặc nội dung file .ydk (có #main, #extra).',
  );
}

// ─── Map Passcodes → CardData ─────────────────────────────────────────────────

/**
 * Chuyển mảng passcode thành mảng CardData.
 * Card không tìm thấy trong DB sẽ được ghi nhận vào unknownIds.
 *
 * @param {number[]} ids
 * @param {Map<number, CardData>} db
 * @returns {{ cards: CardData[], unknownIds: number[] }}
 */
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

    const { deckString, archetype, validateAll } = body;

    // Validate input
    if (!deckString || typeof deckString !== "string" || !deckString.trim()) {
      return NextResponse.json(
        { error: "Thiếu trường `deckString` hoặc bị rỗng." },
        { status: 400 },
      );
    }

    // If validateAll is true, we don't need a specific archetype
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

    // Kiểm tra deck không rỗng
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

    // 4. Validate - either single archetype or all archetypes
    if (shouldValidateAll) {
      // Validate against ALL archetypes
      const allResults = {};
      for (const archetypeKey of Object.keys(ARCHETYPE_RULES)) {
        try {
          const validationResult = validateDeck(archetypeKey, {
            mainDeck,
            extraDeck,
            sideDeck,
          });
          allResults[archetypeKey] = validationResult;
        } catch (ruleErr) {
          allResults[archetypeKey] = {
            error: `Lỗi Rules Engine: ${ruleErr.message}`,
            overallPass: false,
          };
        }
      }

      // 5. Build response for validateAll
      return NextResponse.json({
        success: true,
        validateAll: true,
        results: allResults,
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
    } else {
      // Validate single archetype (original behavior)
      let validationResult;
      try {
        validationResult = validateDeck(archetype, {
          mainDeck,
          extraDeck,
          sideDeck,
        });
      } catch (ruleErr) {
        return NextResponse.json(
          { error: `Lỗi Rules Engine: ${ruleErr.message}` },
          { status: 500 },
        );
      }

      // 5. Build response for single archetype
      return NextResponse.json({
        success: true,
        archetype,
        ...validationResult,
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
  }));

  return NextResponse.json({ archetypes });
}
