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
  // 10 WINS REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  MARINCESS: {
    label: "Marincess",
    description:
      "Main Deck: ≥ 10 Water Monster. Extra Deck: ≥ 5 Water Link Monster.",
    checks: [
      ({ mainDeck }) => {
        const waterMonsters = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "WATER",
        );
        const count = waterMonsters.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Water Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Water Monster không đủ: ${count}/${required} lá.`,
          detail: `Water Monster: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const waterLinks = extraDeck.filter(
          (c) => c.isLink && c.attribute === "WATER",
        );
        const count = waterLinks.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Water Link Monster (Extra): ${count} (yêu cầu ≥ ${required})`
              : `✗ Water Link Monster không đủ: ${count}/${required} lá.`,
          detail: `Water Link: ${count}`,
        };
      },
    ],
  },

  MIKANKO: {
    label: "Mikanko",
    description: "Main Deck: ≥ 6 Monster + ≥ 3 Equip Spell.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const count = monsters.length;
        const required = 6;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Monster không đủ: ${count}/${required} lá.`,
          detail: `Monster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const equipSpells = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Equip"),
        );
        const count = equipSpells.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Equip Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Equip Spell không đủ: ${count}/${required} lá.`,
          detail: `Equip Spell: ${count}`,
        };
      },
    ],
  },

  TRAPTRIX: {
    label: "Traptrix",
    description: "Main Deck: ≥ 10 Trap + ≥ 10 Insect/Plant Monster.",
    checks: [
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Trap Card không đủ: ${count}/${required} lá.`,
          detail: `Trap Card: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const insectPlant = mainDeck.filter(
          (c) => c.isMonster && (c.race === "Insect" || c.race === "Plant"),
        );
        const count = insectPlant.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Insect/Plant Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Insect/Plant Monster không đủ: ${count}/${required} lá.`,
          detail: `Insect/Plant: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 20 WINS REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  BLUE_EYES: {
    label: "Blue-Eyes",
    description: "Main Deck: ≥ 6 Level 8 Monster.",
    checks: [
      ({ mainDeck }) => {
        const level8 = mainDeck.filter((c) => c.isMonster && c.level === 8);
        const count = level8.length;
        const required = 6;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Level 8 Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Level 8 Monster không đủ: ${count}/${required} lá.`,
          detail: `Level 8: ${count}`,
        };
      },
    ],
  },

  CHIMERA: {
    label: "Chimera (Illusion)",
    description:
      "Main Deck: ≥ 2 Attribute + ≥ 2 Monster Type (Illusion/Beast/Fiend).",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const attributes = new Set(
          monsters.map((c) => c.attribute).filter(Boolean),
        );
        const count = attributes.size;
        const required = 2;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Attribute: ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Attribute không đủ: ${count}/${required} loại.`,
          detail: `Attribute: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const types = new Set(
          monsters
            .map((c) => c.race)
            .filter((r) => r === "Illusion" || r === "Beast" || r === "Fiend"),
        );
        const count = types.size;
        const required = 2;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Monster Type (Illusion/Beast/Fiend): ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Type không đủ: ${count}/${required} loại.`,
          detail: `Type: ${count}`,
        };
      },
    ],
  },

  DDD: {
    label: "D/D/D",
    description: "Extra Deck: ≥ 1 Link, ≥ 1 Fusion, ≥ 1 Synchro, ≥ 1 Xyz.",
    checks: [
      ({ extraDeck }) => {
        const links = extraDeck.filter((c) => c.isLink);
        return {
          pass: links.length >= 1,
          message:
            links.length >= 1
              ? `✓ Link Monster: ${links.length}`
              : `✗ Link Monster không đủ.`,
          detail: `Link: ${links.length}`,
        };
      },
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        return {
          pass: fusions.length >= 1,
          message:
            fusions.length >= 1
              ? `✓ Fusion Monster: ${fusions.length}`
              : `✗ Fusion Monster không đủ.`,
          detail: `Fusion: ${fusions.length}`,
        };
      },
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        return {
          pass: synchos.length >= 1,
          message:
            synchos.length >= 1
              ? `✓ Synchro Monster: ${synchos.length}`
              : `✗ Synchro Monster không đủ.`,
          detail: `Synchro: ${synchos.length}`,
        };
      },
      ({ extraDeck }) => {
        const xyzs = extraDeck.filter((c) => c.isXyz);
        return {
          pass: xyzs.length >= 1,
          message:
            xyzs.length >= 1
              ? `✓ Xyz Monster: ${xyzs.length}`
              : `✗ Xyz Monster không đủ.`,
          detail: `Xyz: ${xyzs.length}`,
        };
      },
    ],
  },

  DARK_MAGICIAN: {
    label: "Dark Magician",
    description:
      "Main Deck: ≥ 5 Spellcaster Monster + ≥ 6 Spell + ≥ 1 Level 7/6/1.",
    checks: [
      ({ mainDeck }) => {
        const spellcasters = mainDeck.filter(
          (c) => c.isMonster && c.race === "Spellcaster",
        );
        const count = spellcasters.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spellcaster Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spellcaster không đủ: ${count}/${required} lá.`,
          detail: `Spellcaster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 6;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell không đủ: ${count}/${required} lá.`,
          detail: `Spell: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const level7 = mainDeck.filter((c) => c.isMonster && c.level === 7);
        const level6 = mainDeck.filter((c) => c.isMonster && c.level === 6);
        const level1 = mainDeck.filter((c) => c.isMonster && c.level === 1);
        const pass =
          level7.length >= 1 && level6.length >= 1 && level1.length >= 1;
        return {
          pass,
          message: pass
            ? `✓ Level 7/6/1 Monster: ${level7.length}/${level6.length}/${level1.length}`
            : `✗ Thiếu Level 7/6/1: ${level7.length}/${level6.length}/${level1.length}.`,
          detail: `Lv7: ${level7.length} | Lv6: ${level6.length} | Lv1: ${level1.length}`,
        };
      },
    ],
  },

  FLOOWANDEREEZE: {
    label: "Floowandereeze",
    description: "Main Deck: ≥ 15 Winged Beast Monster.",
    checks: [
      ({ mainDeck }) => {
        const wingedBeasts = mainDeck.filter(
          (c) => c.isMonster && c.race === "Winged Beast",
        );
        const count = wingedBeasts.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Winged Beast Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Winged Beast không đủ: ${count}/${required} lá.`,
          detail: `Winged Beast: ${count}`,
        };
      },
    ],
  },

  HERO: {
    label: "HERO",
    description: "Extra Deck: ≥ 3 Fusion Monster với 3 Attribute khác nhau.",
    checks: [
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        const attributes = new Set(
          fusions.map((c) => c.attribute).filter(Boolean),
        );
        const count = fusions.length;
        const attrCount = attributes.size;
        const required = 3;
        const pass = count >= required && attrCount >= required;
        return {
          pass,
          message: pass
            ? `✓ Fusion Monster: ${count} với ${attrCount} Attribute (yêu cầu ≥ ${required})`
            : `✗ Fusion Monster không đủ: ${count}/${required} hoặc Attribute: ${attrCount}/${required}.`,
          detail: `Fusion: ${count} | Attributes: ${attrCount}`,
        };
      },
    ],
  },

  LIVE_TWIN: {
    label: "Live-Twin / Evil-Twin",
    description:
      "Main Deck: ≥ 10 Cyberse/Fiend Monster. Extra Deck: ≥ 2 Link-2.",
    checks: [
      ({ mainDeck }) => {
        const cybersefiend = mainDeck.filter(
          (c) => c.isMonster && (c.race === "Cyberse" || c.race === "Fiend"),
        );
        const count = cybersefiend.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Cyberse/Fiend Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Cyberse/Fiend không đủ: ${count}/${required} lá.`,
          detail: `Cyberse/Fiend: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const link2 = extraDeck.filter((c) => c.isLink && c.linkRating === 2);
        const count = link2.length;
        const required = 2;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Link-2 Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Link-2 Monster không đủ: ${count}/${required} lá.`,
          detail: `Link-2: ${count}`,
        };
      },
    ],
  },

  MANNADIUM: {
    label: "Mannadium",
    description: "Main Deck: ≥ 4 khác nhau Archetype + ≥ 8 Tuner Monster.",
    checks: [
      ({ mainDeck }) => {
        const archetypes = new Set(
          mainDeck.map((c) => c.archetype).filter(Boolean),
        );
        const count = archetypes.size;
        const required = 4;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Archetype: ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Archetype không đủ: ${count}/${required} loại.`,
          detail: `Archetype: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const tuners = mainDeck.filter((c) => c.isMonster && c.isTuner);
        const count = tuners.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tuner Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Tuner Monster không đủ: ${count}/${required} lá.`,
          detail: `Tuner: ${count}`,
        };
      },
    ],
  },

  MATHMECH: {
    label: "Mathmech",
    description:
      "Main Deck: ≥ 10 Cyberse Monster. Extra Deck: ≥ 1 Xyz + ≥ 1 Link.",
    checks: [
      ({ mainDeck }) => {
        const cyberse = mainDeck.filter(
          (c) => c.isMonster && c.race === "Cyberse",
        );
        const count = cyberse.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Cyberse Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Cyberse Monster không đủ: ${count}/${required} lá.`,
          detail: `Cyberse: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const xyz = extraDeck.filter((c) => c.isXyz);
        const link = extraDeck.filter((c) => c.isLink);
        const pass = xyz.length >= 1 && link.length >= 1;
        return {
          pass,
          message: pass
            ? `✓ Xyz: ${xyz.length}, Link: ${link.length}`
            : `✗ Xyz hoặc Link không đủ: Xyz=${xyz.length}, Link=${link.length}.`,
          detail: `Xyz: ${xyz.length} | Link: ${link.length}`,
        };
      },
    ],
  },

  RITUAL_BEAST: {
    label: "Ritual Beast",
    description: "Main Deck: ≥ 8 WIND Monster. Extra Deck: ≥ 4 Fusion Monster.",
    checks: [
      ({ mainDeck }) => {
        const winds = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "WIND",
        );
        const count = winds.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ WIND Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ WIND Monster không đủ: ${count}/${required} lá.`,
          detail: `WIND: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        const count = fusions.length;
        const required = 4;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fusion Monster (Extra): ${count} (yêu cầu ≥ ${required})`
              : `✗ Fusion Monster không đủ: ${count}/${required} lá.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
  },

  SPYRAL: {
    label: "SPYRAL",
    description: "Main Deck: ≥ 3 card có thể xem tay đối phương hoặc Top Deck.",
    checks: [
      ({ mainDeck }) => {
        const handViewing = mainDeck.filter(
          (c) =>
            c.description?.includes("view") ||
            c.description?.includes("hand") ||
            c.description?.includes("top"),
        );
        const count = handViewing.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Hand/Deck Viewing card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Hand/Deck Viewing card không đủ: ${count}/${required} lá.`,
          detail: `Viewing card: ${count}`,
        };
      },
    ],
  },

  SWORDSOUL: {
    label: "Swordsoul",
    description:
      "Main Deck: ≥ 10 Wyrm Monster. Extra Deck: ≥ 7 Synchro Monster.",
    checks: [
      ({ mainDeck }) => {
        const wyrms = mainDeck.filter((c) => c.isMonster && c.race === "Wyrm");
        const count = wyrms.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Wyrm Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Wyrm Monster không đủ: ${count}/${required} lá.`,
          detail: `Wyrm: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro Monster (Extra): ${count} (yêu cầu ≥ ${required})`
              : `✗ Synchro Monster không đủ: ${count}/${required} lá.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  UNCHAINED: {
    label: "Unchained",
    description: "Main Deck: ≥ 10 Fiend Monster + ≥ 5 Trap Card.",
    checks: [
      ({ mainDeck }) => {
        const fiends = mainDeck.filter(
          (c) => c.isMonster && c.race === "Fiend",
        );
        const count = fiends.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fiend Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fiend Monster không đủ: ${count}/${required} lá.`,
          detail: `Fiend: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Trap Card không đủ: ${count}/${required} lá.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 30 WINS REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  BYSTIAL: {
    label: "Bystial",
    description: "Main Deck: ≥ 3 Level 6 Dragon Monster (LIGHT/DARK).",
    checks: [
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) =>
            c.isMonster &&
            c.race === "Dragon" &&
            c.level === 6 &&
            (c.attribute === "LIGHT" || c.attribute === "DARK"),
        );
        const count = dragons.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Level 6 Dragon (LIGHT/DARK): ${count} (yêu cầu ≥ ${required})`
              : `✗ Level 6 Dragon không đủ: ${count}/${required} lá.`,
          detail: `Lv6 Dragon: ${count}`,
        };
      },
    ],
  },

  ELFNOTE: {
    label: "Elfnote",
    description: "Main Deck: ≥ 10 Fairy/Spellcaster Monster + ≥ 10 Spell Card.",
    checks: [
      ({ mainDeck }) => {
        const fairySpellcaster = mainDeck.filter(
          (c) =>
            c.isMonster && (c.race === "Fairy" || c.race === "Spellcaster"),
        );
        const count = fairySpellcaster.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fairy/Spellcaster Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fairy/Spellcaster không đủ: ${count}/${required} lá.`,
          detail: `Fairy/Spellcaster: ${count}`,
        };
      },
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
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  FIRE_KING: {
    label: "Fire King",
    description: "Main Deck: ≥ 3 Archetype + ≥ 10 FIRE Attribute Monster.",
    checks: [
      ({ mainDeck }) => {
        const archetypes = new Set(
          mainDeck.map((c) => c.archetype).filter(Boolean),
        );
        const count = archetypes.size;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Archetype: ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Archetype không đủ: ${count}/${required} loại.`,
          detail: `Archetype: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const fires = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "FIRE",
        );
        const count = fires.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ FIRE Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ FIRE Monster không đủ: ${count}/${required} lá.`,
          detail: `FIRE: ${count}`,
        };
      },
    ],
  },

  HORUS: {
    label: "Horus",
    description:
      "Main Deck: ≥ 3 Archetype + ≥ 4 Level 8 Monster (khác Attribute).",
    checks: [
      ({ mainDeck }) => {
        const archetypes = new Set(
          mainDeck.map((c) => c.archetype).filter(Boolean),
        );
        const count = archetypes.size;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Archetype: ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Archetype không đủ: ${count}/${required} loại.`,
          detail: `Archetype: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const level8 = mainDeck.filter((c) => c.isMonster && c.level === 8);
        const attributes = new Set(
          level8.map((c) => c.attribute).filter(Boolean),
        );
        const pass = level8.length >= 4 && attributes.size >= 4;
        return {
          pass,
          message: pass
            ? `✓ Level 8 Monster: ${level8.length} với ${attributes.size} Attribute`
            : `✗ Level 8 Monster không đủ hoặc Attribute thiếu: ${level8.length}/${4}, Attributes: ${attributes.size}/${4}.`,
          detail: `Lv8: ${level8.length} | Attributes: ${attributes.size}`,
        };
      },
    ],
  },

  K9: {
    label: "K9",
    description:
      "Main Deck: ≥ 10 EARTH/LIGHT Monster + ≥ 5 Beast/Beast-Warrior.",
    checks: [
      ({ mainDeck }) => {
        const earthLight = mainDeck.filter(
          (c) =>
            c.isMonster && (c.attribute === "EARTH" || c.attribute === "LIGHT"),
        );
        const count = earthLight.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ EARTH/LIGHT Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ EARTH/LIGHT Monster không đủ: ${count}/${required} lá.`,
          detail: `EARTH/LIGHT: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const beastWarrior = mainDeck.filter(
          (c) =>
            c.isMonster && (c.race === "Beast" || c.race === "Beast-Warrior"),
        );
        const count = beastWarrior.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Beast/Beast-Warrior Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Beast/Beast-Warrior không đủ: ${count}/${required} lá.`,
          detail: `Beast/Beast-Warrior: ${count}`,
        };
      },
    ],
  },

  SKY_STRIKER: {
    label: "Sky Striker",
    description: "Main Deck: ≥ 20 Spell Card + ≤ 10 Monster.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 20;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell Card không đủ: ${count}/${required} lá.`,
          detail: `Spell: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const count = monsters.length;
        const max = 10;
        return {
          pass: count <= max,
          message:
            count <= max
              ? `✓ Monster: ${count} (yêu cầu ≤ ${max})`
              : `✗ Monster quá nhiều: ${count} > ${max}.`,
          detail: `Monster: ${count}`,
        };
      },
    ],
  },

  SNAKE_EYES: {
    label: "Snake-Eyes",
    description: "Main Deck: ≥ 10 FIRE Monster.",
    checks: [
      ({ mainDeck }) => {
        const fires = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "FIRE",
        );
        const count = fires.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ FIRE Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ FIRE Monster không đủ: ${count}/${required} lá.`,
          detail: `FIRE: ${count}`,
        };
      },
    ],
  },

  VAALMONICA: {
    label: "Vaalmonica",
    description: "Main Deck: ≥ 10 Spell Card.",
    checks: [
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
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  VANQUISH_SOUL: {
    label: "Vanquish Soul",
    description:
      "Main Deck: ≥ 4 Attribute (EARTH/FIRE/DARK bắt buộc) + mỗi ≥ 3 Monster.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const attributes = {};

        monsters.forEach((m) => {
          if (m.attribute) {
            attributes[m.attribute] = (attributes[m.attribute] || 0) + 1;
          }
        });

        const hasEarth = attributes["EARTH"] >= 3;
        const hasFire = attributes["FIRE"] >= 3;
        const hasDark = attributes["DARK"] >= 3;
        const totalAttributes = Object.keys(attributes).length;

        const pass = hasEarth && hasFire && hasDark && totalAttributes >= 4;

        return {
          pass,
          message: pass
            ? `✓ 4 Attribute (mỗi ≥ 3): EARTH=${attributes["EARTH"]}, FIRE=${attributes["FIRE"]}, DARK=${attributes["DARK"]}`
            : `✗ Thiếu yêu cầu: EARTH=${attributes["EARTH"] || 0}, FIRE=${attributes["FIRE"] || 0}, DARK=${attributes["DARK"] || 0}, Total=${totalAttributes}/4.`,
          detail: `EARTH: ${attributes["EARTH"] || 0} | FIRE: ${attributes["FIRE"] || 0} | DARK: ${attributes["DARK"] || 0}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 40 WINS REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  CENTUR_ION: {
    label: "Centur-Ion",
    description: "Extra Deck: ≥ 7 Synchro Monster.",
    checks: [
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Synchro Monster không đủ: ${count}/${required} lá.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  FIENDSMITH: {
    label: "Fiendsmith",
    description: "Main Deck: ≥ 10 Fiend Monster + ≥ 5 Special Summon card.",
    checks: [
      ({ mainDeck }) => {
        const fiends = mainDeck.filter(
          (c) => c.isMonster && c.race === "Fiend",
        );
        const count = fiends.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fiend Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fiend Monster không đủ: ${count}/${required} lá.`,
          detail: `Fiend: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const specialSummon = mainDeck.filter((c) =>
          c.description?.includes("Special Summon"),
        );
        const count = specialSummon.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Special Summon card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Special Summon card không đủ: ${count}/${required} lá.`,
          detail: `Special Summon: ${count}`,
        };
      },
    ],
  },

  KASHTIRA: {
    label: "Kashtira",
    description: "Main Deck: ≥ 10 Psychic Monster. Extra Deck: ≥ 5 Xyz.",
    checks: [
      ({ mainDeck }) => {
        const psychics = mainDeck.filter(
          (c) => c.isMonster && c.race === "Psychic",
        );
        const count = psychics.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Psychic Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Psychic Monster không đủ: ${count}/${required} lá.`,
          detail: `Psychic: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const xyzs = extraDeck.filter((c) => c.isXyz);
        const count = xyzs.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Xyz Monster không đủ: ${count}/${required} lá.`,
          detail: `Xyz: ${count}`,
        };
      },
    ],
  },

  LABRYNTH: {
    label: "Labrynth/Eldlich",
    description: "Main Deck: ≥ 20 Trap Card.",
    checks: [
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 20;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Trap Card không đủ: ${count}/${required} lá.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  PURRELY: {
    label: "Purrely",
    description: "Main Deck: ≥ 10 Quick-Play Spell.",
    checks: [
      ({ mainDeck }) => {
        const quickSpells = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickSpells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Quick-Play Spell không đủ: ${count}/${required} lá.`,
          detail: `Quick-Play: ${count}`,
        };
      },
    ],
  },

  RADIANT_TYPHOON: {
    label: "Radiant Typhoon",
    description: "Main Deck: ≥ 3 Archetype + ≥ 10 Quick-Play Spell.",
    checks: [
      ({ mainDeck }) => {
        const archetypes = new Set(
          mainDeck.map((c) => c.archetype).filter(Boolean),
        );
        const count = archetypes.size;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Archetype: ${count} loại (yêu cầu ≥ ${required})`
              : `✗ Archetype không đủ: ${count}/${required} loại.`,
          detail: `Archetype: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const quickSpells = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickSpells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Quick-Play Spell không đủ: ${count}/${required} lá.`,
          detail: `Quick-Play: ${count}`,
        };
      },
    ],
  },

  RESCUE_ACE: {
    label: "Rescue-ACE",
    description:
      "Main Deck: ≥ 10 Quick-Play Spell + ≥ 10 Normal Trap + ≥ 5 Destroy.",
    checks: [
      ({ mainDeck }) => {
        const quickSpells = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickSpells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Quick-Play Spell không đủ: ${count}/${required} lá.`,
          detail: `Quick-Play: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const normalTraps = mainDeck.filter(
          (c) => c.isTrap && c.cardType?.includes("Normal"),
        );
        const count = normalTraps.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Normal Trap: ${count} (yêu cầu ≥ ${required})`
              : `✗ Normal Trap không đủ: ${count}/${required} lá.`,
          detail: `Normal Trap: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const destroy = mainDeck.filter((c) =>
          c.description?.includes("Destroy"),
        );
        const count = destroy.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Destroy effect card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Destroy effect card không đủ: ${count}/${required} lá.`,
          detail: `Destroy: ${count}`,
        };
      },
    ],
  },

  VOICELESS_VOICE: {
    label: "Voiceless Voice",
    description: "Main Deck: ≥ 10 LIGHT Monster + ≥ 5 Ritual Monster/Spell.",
    checks: [
      ({ mainDeck }) => {
        const lights = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "LIGHT",
        );
        const count = lights.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ LIGHT Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ LIGHT Monster không đủ: ${count}/${required} lá.`,
          detail: `LIGHT: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const ritual = mainDeck.filter(
          (c) =>
            (c.isMonster && c.cardType?.includes("Ritual")) ||
            (c.isSpell && c.cardType?.includes("Ritual")),
        );
        const count = ritual.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Monster/Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Ritual Monster/Spell không đủ: ${count}/${required} lá.`,
          detail: `Ritual: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 50 WINS REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  BRANDED: {
    label: "Branded",
    description:
      "Main Deck: ≥ 10 Fusion Material Monster. Extra Deck: ≥ 5 Fusion.",
    checks: [
      ({ mainDeck }) => {
        const fusionMaterial = mainDeck.filter((c) =>
          c.description?.includes("Fusion"),
        );
        const count = fusionMaterial.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fusion Material card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fusion Material card không đủ: ${count}/${required} lá.`,
          detail: `Fusion Material: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        const count = fusions.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fusion Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fusion Monster không đủ: ${count}/${required} lá.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
  },

  DRACOTAIL: {
    label: "Dracotail",
    description: "Main Deck: ≥ 15 Dragon Monster + ≥ 5 Special Summon card.",
    checks: [
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) => c.isMonster && c.race === "Dragon",
        );
        const count = dragons.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Dragon Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Dragon Monster không đủ: ${count}/${required} lá.`,
          detail: `Dragon: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const specialSummon = mainDeck.filter((c) =>
          c.description?.includes("Special Summon"),
        );
        const count = specialSummon.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Special Summon card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Special Summon card không đủ: ${count}/${required} lá.`,
          detail: `Special Summon: ${count}`,
        };
      },
    ],
  },

  KEWL_TUNE: {
    label: "Kewl Tune",
    description: "Main Deck: ≥ 10 Tuner Monster. Extra Deck: ≥ 7 Synchro.",
    checks: [
      ({ mainDeck }) => {
        const tuners = mainDeck.filter((c) => c.isMonster && c.isTuner);
        const count = tuners.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tuner Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Tuner Monster không đủ: ${count}/${required} lá.`,
          detail: `Tuner: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Synchro Monster không đủ: ${count}/${required} lá.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  MITSURUGI: {
    label: "Mitsurugi",
    description: "Main Deck: ≥ 10 Reptile Monster.",
    checks: [
      ({ mainDeck }) => {
        const reptiles = mainDeck.filter(
          (c) => c.isMonster && c.race === "Reptile",
        );
        const count = reptiles.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Reptile Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Reptile Monster không đủ: ${count}/${required} lá.`,
          detail: `Reptile: ${count}`,
        };
      },
    ],
  },

  TENPAI_DRAGON: {
    label: "Tenpai Dragon",
    description: "Main Deck: ≥ 12 Dragon Monster.",
    checks: [
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) => c.isMonster && c.race === "Dragon",
        );
        const count = dragons.length;
        const required = 12;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Dragon Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Dragon Monster không đủ: ${count}/${required} lá.`,
          detail: `Dragon: ${count}`,
        };
      },
    ],
  },

  WHITE_FOREST: {
    label: "White Forest",
    description: "Main Deck: ≥ 15 Spell Card. Extra Deck: ≥ 5 Synchro.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell Card không đủ: ${count}/${required} lá.`,
          detail: `Spell: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Synchro Monster không đủ: ${count}/${required} lá.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 20 LOSSES REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  DRAGONMAID: {
    label: "Dragonmaid",
    description: "Main Deck: ≥ 8 Dragon Monster. Extra Deck: ≥ 3 Fusion.",
    checks: [
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) => c.isMonster && c.race === "Dragon",
        );
        const count = dragons.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Dragon Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Dragon Monster không đủ: ${count}/${required} lá.`,
          detail: `Dragon: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        const count = fusions.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fusion Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fusion Monster không đủ: ${count}/${required} lá.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
  },

  ANTI_SPELL: {
    label: "Anti-Spell Fragnance",
    description: "Main Deck: ≥ 10 Continuous Spell/Trap.",
    checks: [
      ({ mainDeck }) => {
        const continuous = mainDeck.filter(
          (c) => (c.isSpell || c.isTrap) && c.cardType?.includes("Continuous"),
        );
        const count = continuous.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Continuous Spell/Trap: ${count} (yêu cầu ≥ ${required})`
              : `✗ Continuous Spell/Trap không đủ: ${count}/${required} lá.`,
          detail: `Continuous: ${count}`,
        };
      },
    ],
  },

  YUMMY: {
    label: "Yummy",
    description: "Main Deck: ≥ 10 Ritual Monster + ≥ 5 Ritual Spell.",
    checks: [
      ({ mainDeck }) => {
        const ritualMonsters = mainDeck.filter(
          (c) => c.isMonster && c.cardType?.includes("Ritual"),
        );
        const count = ritualMonsters.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Ritual Monster không đủ: ${count}/${required} lá.`,
          detail: `Ritual Monster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const ritualSpells = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Ritual"),
        );
        const count = ritualSpells.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Ritual Spell không đủ: ${count}/${required} lá.`,
          detail: `Ritual Spell: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 30 LOSSES REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  RUNICK: {
    label: "Runick",
    description: "Main Deck: ≥ 10 Spell Card + ≥ 10 Trap Card.",
    checks: [
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
          detail: `Spell: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Trap Card không đủ: ${count}/${required} lá.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  YUBEL: {
    label: "Yubel",
    description: "Main Deck: ≥ 10 Fiend Monster.",
    checks: [
      ({ mainDeck }) => {
        const fiends = mainDeck.filter(
          (c) => c.isMonster && c.race === "Fiend",
        );
        const count = fiends.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fiend Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fiend Monster không đủ: ${count}/${required} lá.`,
          detail: `Fiend: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 40 LOSSES REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  ENNEACRAFT: {
    label: "Enneacraft",
    description: "Main Deck: ≥ 12 Spell Card.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 12;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell Card không đủ: ${count}/${required} lá.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  DINOSAUR: {
    label: "Dinosaur Monster Type",
    description: "Main Deck: ≥ 10 card với tên khác nhau.",
    checks: [
      ({ mainDeck }) => {
        const uniqueNames = new Set(
          mainDeck.map((c) => c.name).filter(Boolean),
        );
        const count = uniqueNames.size;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Unique card name: ${count} (yêu cầu ≥ ${required})`
              : `✗ Unique card name không đủ: ${count}/${required} loại.`,
          detail: `Unique: ${count}`,
        };
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 100 LOSSES REQUIREMENT
  // ══════════════════════════════════════════════════════════════════════════

  TEARLAMENTS: {
    label: "Tearlaments (Full Power)",
    description: "Main Deck: ≥ 20 WATER/DARK/Aqua Monster.",
    checks: [
      ({ mainDeck }) => {
        const water = mainDeck.filter(
          (c) =>
            c.isMonster &&
            (c.attribute === "WATER" ||
              c.attribute === "DARK" ||
              c.race === "Aqua"),
        );
        const count = water.length;
        const required = 20;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ WATER/DARK/Aqua Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ WATER/DARK/Aqua Monster không đủ: ${count}/${required} lá.`,
          detail: `WATER/DARK/Aqua: ${count}`,
        };
      },
    ],
  },

  ZOODIAC: {
    label: "Zoodiac (Full Power)",
    description: "Extra Deck: ≥ 5 Xyz Monster. Main Deck: ≥ 5 Beast Monster.",
    checks: [
      ({ extraDeck }) => {
        const xyzs = extraDeck.filter((c) => c.isXyz);
        const count = xyzs.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Xyz Monster không đủ: ${count}/${required} lá.`,
          detail: `Xyz: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const beasts = mainDeck.filter(
          (c) => c.isMonster && c.race === "Beast",
        );
        const count = beasts.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Beast Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Beast Monster không đủ: ${count}/${required} lá.`,
          detail: `Beast: ${count}`,
        };
      },
    ],
  },
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
