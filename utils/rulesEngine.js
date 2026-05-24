/**
 * utils/rulesEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Rules Engine cho Yu-Gi-Oh! Tournament Deck Validator.
 *
 * CÁCH THÊM ARCHETYPE MỚI:
 *  1. Tạo một object mới trong `ARCHETYPE_RULES` với key là tên archetype.
 *  2. Điền `label` (tên hiển thị), `description` (mô tả ngắn).
 *  3. Viết mảng `checks` gồm các hàm kiểm tra.
 *     Mỗi check nhận vào `{ mainDeck, extraDeck, sideDeck }` (mảng CardData)
 *     và trả về `{ pass: boolean, message: string }`.
 *
 * HELPER FUNCTIONS ở cuối file giúp viết rule nhanh hơn.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Archetype Registry ────────────────────────────────────────────────────────

/**
 * Map tên archetype → cấu hình rule.
 * Key phải khớp với value trong dropdown ở UI.
 */
export const ARCHETYPE_RULES = {
  // ══════════════════════════════════════════════════════════════════════════
  // M∀LICE — Kiểm tra Attribute và tổng số bài
  // ══════════════════════════════════════════════════════════════════════════
  MALICE: {
    label: "M∀LICE",
    description: "Main Deck ≥ 25 DARK Monster & Main Deck ≥ 45 card tổng cộng.",
    checks: [
      /**
       * Điều kiện 1: Main Deck phải có ít nhất 25 DARK Monster.
       */
      ({ mainDeck }) => {
        const darkMonsters = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "DARK",
        );
        const count = darkMonsters.length;
        const required = 25;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ DARK Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ DARK Monster không đủ: chỉ có ${count}/${required} lá.`,
          detail: `DARK Monster: ${count} lá`,
        };
      },

      /**
       * Điều kiện 2: Main Deck tổng cộng ≥ 45 card.
       */
      ({ mainDeck }) => {
        const count = mainDeck.length;
        const required = 45;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tổng Main Deck: ${count} lá (yêu cầu ≥ ${required})`
              : `✗ Main Deck chỉ có ${count}/${required} lá.`,
          detail: `Tổng Main Deck: ${count} lá`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Ryzeal — Kiểm tra Type và Extra Deck
  // ══════════════════════════════════════════════════════════════════════════
  RYZEAL: {
    label: "Ryzeal",
    description:
      "Main Deck: ≥ 10 LIGHT Monster HOẶC ≥ 10 Thunder Monster. Extra Deck: ≥ 7 Xyz Monster.",
    checks: [
      /**
       * Điều kiện 1 (OR): Main Deck ≥ 10 LIGHT Monster HOẶC ≥ 10 Thunder Monster.
       * Chỉ cần một trong hai thỏa mãn là PASS.
       */
      ({ mainDeck }) => {
        const lightMonsters = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "LIGHT",
        );
        const thunderMonsters = mainDeck.filter(
          (c) => c.isMonster && c.race === "Thunder",
        );
        const lightCount = lightMonsters.length;
        const thunderCount = thunderMonsters.length;
        const required = 10;

        const passLight = lightCount >= required;
        const passThunder = thunderCount >= required;
        const pass = passLight || passThunder;

        let message;
        if (pass) {
          const parts = [];
          if (passLight) parts.push(`LIGHT Monster: ${lightCount}`);
          if (passThunder) parts.push(`Thunder Monster: ${thunderCount}`);
          message = `✓ Đủ điều kiện OR: ${parts.join(" / ")} (yêu cầu ≥ ${required} một trong hai)`;
        } else {
          message =
            `✗ Không đủ điều kiện: LIGHT Monster = ${lightCount}, Thunder Monster = ${thunderCount} ` +
            `(cần ít nhất một loại ≥ ${required}).`;
        }

        return {
          pass,
          message,
          detail: `LIGHT: ${lightCount} | Thunder: ${thunderCount}`,
        };
      },

      /**
       * Điều kiện 2: Extra Deck ≥ 7 Xyz Monster.
       */
      ({ extraDeck }) => {
        const xyzMonsters = extraDeck.filter((c) => c.isXyz);
        const count = xyzMonsters.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz Monster trong Extra Deck: ${count} (yêu cầu ≥ ${required})`
              : `✗ Extra Deck chỉ có ${count}/${required} Xyz Monster.`,
          detail: `Xyz Extra Deck: ${count} lá`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Artmage — Kiểm tra Attribute đa dạng + Pendulum + Spell
  // ══════════════════════════════════════════════════════════════════════════
  ARTMAGE: {
    label: "Artmage",
    description:
      "Main Deck: ≥ 3 Attribute khác nhau (bắt buộc LIGHT & DARK) + ≥ 10 Pendulum Monster + ≥ 10 Spell Card.",
    checks: [
      /**
       * Điều kiện 1: Main Deck có ít nhất 3 Attribute khác nhau,
       * trong đó bắt buộc phải có LIGHT và DARK.
       */
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const attributes = new Set(
          monsters.map((c) => c.attribute).filter(Boolean),
        );

        const hasLight = attributes.has("LIGHT");
        const hasDark = attributes.has("DARK");
        const attrCount = attributes.size;
        const required = 3;

        const pass = attrCount >= required && hasLight && hasDark;

        let message;
        if (!hasLight && !hasDark) {
          message = `✗ Thiếu cả LIGHT lẫn DARK Attribute trong Monster.`;
        } else if (!hasLight) {
          message = `✗ Thiếu LIGHT Attribute. Hiện có: ${[...attributes].join(", ")}.`;
        } else if (!hasDark) {
          message = `✗ Thiếu DARK Attribute. Hiện có: ${[...attributes].join(", ")}.`;
        } else if (attrCount < required) {
          message = `✗ Chỉ có ${attrCount}/${required} Attribute khác nhau: ${[...attributes].join(", ")}.`;
        } else {
          message = `✓ Attribute đa dạng: ${[...attributes].join(", ")} (${attrCount} loại, có LIGHT & DARK)`;
        }

        return {
          pass,
          message,
          detail: `Attributes: ${[...attributes].join(", ")}`,
        };
      },

      /**
       * Điều kiện 2: Main Deck ≥ 10 Pendulum Monster.
       */
      ({ mainDeck }) => {
        const pendulums = mainDeck.filter((c) => c.isPendulum && c.isMonster);
        const count = pendulums.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Pendulum Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Pendulum Monster không đủ: ${count}/${required} lá.`,
          detail: `Pendulum Monster: ${count} lá`,
        };
      },

      /**
       * Điều kiện 3: Main Deck ≥ 10 Spell Card.
       */
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell Card không đủ: ${count}/${required} lá.`,
          detail: `Spell Card: ${count} lá`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 👇 THÊM ARCHETYPE MỚI TẠI ĐÂY
  // Sao chép template bên dưới và điền logic:
  // ══════════════════════════════════════════════════════════════════════════
  /*
  MY_NEW_ARCHETYPE: {
    label: "Tên Hiển Thị",
    description: "Mô tả điều kiện ngắn gọn.",
    checks: [
      ({ mainDeck, extraDeck, sideDeck }) => {
        // ... logic kiểm tra
        const pass = true; // thay bằng điều kiện thực tế
        return {
          pass,
          message: pass ? "✓ ..." : "✗ ...",
          detail: "...",
        };
      },
    ],
  },
  */
};

// ─── Main Validator Function ───────────────────────────────────────────────────

/**
 * Chạy toàn bộ checks của một archetype cho một bộ deck.
 *
 * @param {string} archetypeKey   - Key trong ARCHETYPE_RULES (e.g. "MALICE")
 * @param {{ mainDeck: CardData[], extraDeck: CardData[], sideDeck: CardData[] }} deck
 * @returns {{ archetypeLabel: string, overallPass: boolean, results: CheckResult[] }}
 */
export function validateDeck(archetypeKey, deck) {
  const rule = ARCHETYPE_RULES[archetypeKey];

  if (!rule) {
    throw new Error(`Không tìm thấy rule cho archetype: "${archetypeKey}"`);
  }

  const results = rule.checks.map((checkFn, i) => {
    try {
      const result = checkFn(deck);
      return {
        index: i + 1,
        pass: result.pass ?? false,
        message: result.message ?? "(Không có message)",
        detail: result.detail ?? "",
      };
    } catch (err) {
      // Catch lỗi từng check riêng để không làm crash toàn bộ validation
      console.error(
        `[RulesEngine] Lỗi tại check #${i + 1} của ${archetypeKey}:`,
        err,
      );
      return {
        index: i + 1,
        pass: false,
        message: `✗ Lỗi khi thực thi check #${i + 1}: ${err.message}`,
        detail: "",
      };
    }
  });

  const overallPass = results.every((r) => r.pass);

  return {
    archetypeLabel: rule.label,
    archetypeDescription: rule.description,
    overallPass,
    results,
    // Thống kê nhanh
    summary: {
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      failed: results.filter((r) => !r.pass).length,
    },
  };
}

// ─── Helper Functions (dùng để viết rule nhanh hơn) ──────────────────────────

/**
 * Đếm card trong deck thỏa mãn một predicate.
 * @param {CardData[]} deck
 * @param {(card: CardData) => boolean} predicate
 * @returns {number}
 */
export function count(deck, predicate) {
  return deck.filter(predicate).length;
}

/**
 * Lấy tập hợp unique values của một property trên mảng card.
 * Ví dụ: uniqueSet(mainDeck, c => c.attribute) → Set { "DARK", "LIGHT" }
 * @param {CardData[]} deck
 * @param {(card: CardData) => string} selector
 * @returns {Set<string>}
 */
export function uniqueSet(deck, selector) {
  return new Set(deck.map(selector).filter(Boolean));
}

/**
 * Tạo một check đơn giản dạng "count >= min".
 * @param {string} label
 * @param {(card: CardData) => boolean} predicate
 * @param {number} min
 * @param {"mainDeck"|"extraDeck"|"sideDeck"} deckKey
 */
export function minCountCheck(label, predicate, min, deckKey = "mainDeck") {
  return (decks) => {
    const deck = decks[deckKey] ?? [];
    const n = count(deck, predicate);
    const pass = n >= min;
    return {
      pass,
      message: pass
        ? `✓ ${label}: ${n} (yêu cầu ≥ ${min})`
        : `✗ ${label}: chỉ có ${n}/${min} lá.`,
      detail: `${label}: ${n}`,
    };
  };
}

/**
 * @typedef {Object} CheckResult
 * @property {number}  index
 * @property {boolean} pass
 * @property {string}  message
 * @property {string}  detail
 */
