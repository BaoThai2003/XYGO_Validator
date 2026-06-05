/**
 * utils/rulesEngine-full.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Rules Engine — Yu-Gi-Oh! Tournament Deck Validator
 * All 50 Archetypes with Scaling Conditions
 *
 * STRUCTURE:
 * - winsRequired: Trận thắng cần thiết (10/20/30/40/50 wins)
 * - lossesRequired: Trận thua cần thiết (20/30/40/50/60/100 losses)
 * - deckCondition: Checks để xác thực deck configuration
 * - teamCondition: Checks để xác thực team performance
 * - respectCondition: Special bonuses từ team members
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE REGISTRY — 50 ARCHETYPES
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHETYPE_RULES = {
  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 10 WINS (2 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  MIKANKO: {
    label: "Mikanko",
    winsRequired: 10,
    teamCondition: 10,
    description:
      "Main Deck: ≥ 6 Monster + ≥ 3 Equip Spell. Team: ≥ 10/180 wins.",
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
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Yuki Chan thì mở khóa tất cả
      return teamMembers.includes("Yuki Chan");
    },
  },

  TRAPTRIX: {
    label: "Traptrix",
    winsRequired: 10,
    teamCondition: 10,
    description:
      "Main Deck: ≥ 10 Trap + ≥ 10 Insect/Plant Monster. Team: ≥ 10/180 wins.",
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
              : `✗ Insect/Plant không đủ: ${count}/${required} lá.`,
          detail: `Insect/Plant: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Nguyễn Nguyên thì mở khóa tất cả
      return teamMembers.includes("Nguyễn Nguyên");
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 20 WINS (5 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  CHIMERA: {
    label: "Chimera (Illusion)",
    winsRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 2 Attribute + ≥ 2 Type (Illusion/Beast/Fiend). Team: ≥ 20/180 wins.",
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
          detail: `Attributes: ${count}`,
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
              ? `✓ Monster Type (Illusion/Beast/Fiend): ${count} loại`
              : `✗ Type không đủ: ${count}/${required} loại.`,
          detail: `Types: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Khai Điện thì chỉ cần 15 wins
      return teamMembers.includes("Khai Điện") ? 15 : 20;
    },
  },

  DDD: {
    label: "D/D/D",
    winsRequired: 20,
    teamCondition: 20,
    description:
      "Extra Deck: ≥ 1 Link + ≥ 1 Fusion + ≥ 1 Synchro + ≥ 1 Xyz. Team: ≥ 20/180 wins.",
    checks: [
      ({ extraDeck }) => {
        const links = extraDeck.filter((c) => c.isLink);
        const fusions = extraDeck.filter((c) => c.isFusion);
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const xyzs = extraDeck.filter((c) => c.isXyz);
        const pass =
          links.length >= 1 &&
          fusions.length >= 1 &&
          synchos.length >= 1 &&
          xyzs.length >= 1;
        return {
          pass,
          message: pass
            ? `✓ Extra Deck types: Link=${links.length} Fusion=${fusions.length} Synchro=${synchos.length} Xyz=${xyzs.length}`
            : `✗ Extra Deck không đủ: Link=${links.length} Fusion=${fusions.length} Synchro=${synchos.length} Xyz=${xyzs.length}.`,
          detail: `Link:${links.length} Fus:${fusions.length} Syn:${synchos.length} Xyz:${xyzs.length}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Kuroko Guen thì chỉ cần 10 wins
      return teamMembers.includes("Kuroko Guen") ? 10 : 20;
    },
  },

  HERO: {
    label: "HERO",
    winsRequired: 20,
    teamCondition: 20,
    description:
      "Extra Deck: ≥ 3 Fusion (3 Attribute khác). Team: ≥ 20/180 wins.",
    checks: [
      ({ extraDeck }) => {
        const fusions = extraDeck.filter((c) => c.isFusion);
        const attributes = new Set(
          fusions.map((c) => c.attribute).filter(Boolean),
        );
        const pass = fusions.length >= 3 && attributes.size >= 3;
        return {
          pass,
          message: pass
            ? `✓ Fusion: ${fusions.length} với ${attributes.size} Attribute`
            : `✗ Fusion hoặc Attribute không đủ: ${fusions.length}/${3}, Attr: ${attributes.size}/${3}.`,
          detail: `Fusion: ${fusions.length} | Attributes: ${attributes.size}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Pham Le Minh thì chỉ cần 10 wins
      return teamMembers.includes("Pham Le Minh") ? 10 : 20;
    },
  },

  RITUAL_BEAST: {
    label: "Ritual Beast",
    winsRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 8 WIND Monster. Extra Deck: ≥ 4 Fusion Monster. Team: ≥ 20/180 wins.",
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
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Nguyễn Hữu Lộc thì chỉ cần 10 wins
      return teamMembers.includes("Nguyễn Hữu Lộc") ? 10 : 20;
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 30 WINS (10 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  ARTMAGE: {
    label: "Artmage",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 3 Attribute (LIGHT+DARK bắt buộc) + ≥ 10 Pendulum + ≥ 10 Spell. Team: ≥ 30/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const attributes = new Set(
          monsters.map((c) => c.attribute).filter(Boolean),
        );
        const hasLight = attributes.has("LIGHT");
        const hasDark = attributes.has("DARK");
        const pass = attributes.size >= 3 && hasLight && hasDark;
        return {
          pass,
          message: pass
            ? `✓ Attribute: ${[...attributes].join(", ")} (LIGHT+DARK+others)`
            : `✗ Attribute không đủ: ${[...attributes].join(", ")} (cần LIGHT+DARK).`,
          detail: `Attributes: ${attributes.size}`,
        };
      },
      ({ mainDeck }) => {
        const pendulums = mainDeck.filter((c) => c.isPendulum && c.isMonster);
        const count = pendulums.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Pendulum: ${count} (yêu cầu ≥ ${required})`
              : `✗ Pendulum không đủ: ${count}/${required}.`,
          detail: `Pendulum: ${count}`,
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
              ? `✓ Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell không đủ: ${count}/${required}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Cell Skt thì chỉ cần 25 wins
      return teamMembers.includes("Cell Skt") ? 25 : 30;
    },
  },

  ELFNOTE: {
    label: "Elfnote",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 10 Fairy/Spellcaster + ≥ 10 Spell. Team: ≥ 30/180 wins.",
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
              ? `✓ Fairy/Spellcaster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Fairy/Spellcaster không đủ: ${count}/${required}.`,
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
              ? `✓ Spell: ${count} (yêu cầu ≥ ${required})`
              : `✗ Spell không đủ: ${count}/${required}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  FIRE_KING: {
    label: "Fire King",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 3 Archetype + ≥ 10 FIRE Monster. Team: ≥ 30/180.",
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
              ? `✓ Archetype: ${count} (yêu cầu ≥ ${required})`
              : `✗ Archetype không đủ: ${count}/${required}.`,
          detail: `Archetypes: ${count}`,
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
              ? `✓ FIRE: ${count} (yêu cầu ≥ ${required})`
              : `✗ FIRE không đủ: ${count}/${required}.`,
          detail: `FIRE: ${count}`,
        };
      },
    ],
  },

  HORUS: {
    label: "Horus",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 3 Archetype + ≥ 4 Level 8 Monster (khác Attribute). Team: ≥ 30/180.",
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
              ? `✓ Archetype: ${count}`
              : `✗ Archetype không đủ: ${count}/${required}.`,
          detail: `Archetypes: ${count}`,
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
            ? `✓ Level 8: ${level8.length} với ${attributes.size} Attribute`
            : `✗ Level 8 hoặc Attribute: ${level8.length}/${4}, Attr: ${attributes.size}/${4}.`,
          detail: `Lv8: ${level8.length} | Attrs: ${attributes.size}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Nguyễn. Đ. Bình thì chỉ cần 25 wins
      return teamMembers.includes("Nguyễn. Đ. Bình") ? 25 : 30;
    },
  },

  K9: {
    label: "K9",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 10 EARTH/LIGHT Monster + ≥ 5 Beast/Beast-Warrior. Team: ≥ 30/180.",
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
              ? `✓ EARTH/LIGHT: ${count}`
              : `✗ EARTH/LIGHT không đủ: ${count}/${required}.`,
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
              ? `✓ Beast/Beast-Warrior: ${count}`
              : `✗ Beast/Beast-Warrior không đủ: ${count}/${required}.`,
          detail: `Beast/B-Warrior: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu trong đội có Cell Skt thì chỉ cần 25 wins
      return teamMembers.includes("Cell Skt") ? 25 : 30;
    },
  },

  SKY_STRIKER: {
    label: "Sky Striker",
    winsRequired: 30,
    teamCondition: 30,
    description: "Main Deck: ≥ 20 Spell + ≤ 10 Monster. Team: ≥ 30/180.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 20;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell: ${count}`
              : `✗ Spell không đủ: ${count}/${required}.`,
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
              ? `✓ Monster: ${count} (≤ ${max})`
              : `✗ Monster quá nhiều: ${count} > ${max}.`,
          detail: `Monster: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Nhật Minh (captain) thì 20 wins
      if (teamMembers.includes("Nhật Minh")) return 20;
      // Nếu có người tên chứa "Hùng" hoặc "Vũ" giảm 2 Spell yêu cầu mỗi người
      // "Hùng Vũ" thì yêu cầu ≥ 10 Spell
      return 30;
    },
  },

  SNAKE_EYES: {
    label: "Snake-Eyes",
    winsRequired: 30,
    teamCondition: 30,
    description: "Main Deck: ≥ 10 FIRE Monster. Team: ≥ 30/180.",
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
              ? `✓ FIRE: ${count}`
              : `✗ FIRE không đủ: ${count}/${required}.`,
          detail: `FIRE: ${count}`,
        };
      },
    ],
  },

  VAALMONICA: {
    label: "Vaalmonica",
    winsRequired: 30,
    teamCondition: 30,
    description: "Main Deck: ≥ 10 Spell Card. Team: ≥ 30/180.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell: ${count}`
              : `✗ Spell không đủ: ${count}/${required}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  VANQUISH_SOUL: {
    label: "Vanquish Soul",
    winsRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 4 Attribute (EARTH+FIRE+DARK bắt buộc) mỗi ≥ 3 Monster. Team: ≥ 30/180.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const byAttribute = {};
        monsters.forEach((m) => {
          if (m.attribute) {
            byAttribute[m.attribute] = (byAttribute[m.attribute] || 0) + 1;
          }
        });
        const hasEarth = (byAttribute["EARTH"] || 0) >= 3;
        const hasFire = (byAttribute["FIRE"] || 0) >= 3;
        const hasDark = (byAttribute["DARK"] || 0) >= 3;
        const totalUnique = Object.keys(byAttribute).length;
        const pass = totalUnique >= 4 && hasEarth && hasFire && hasDark;
        return {
          pass,
          message: pass
            ? `✓ 4 Attributes (EARTH+FIRE+DARK+other) ≥ 3 mỗi cái`
            : `✗ Attribute không đủ hoặc thiếu bắt buộc.`,
          detail: `Attributes: ${Object.entries(byAttribute)
            .map(([k, v]) => `${k}:${v}`)
            .join(", ")}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Quochau Do thì 20 wins
      return teamMembers.includes("Quochau Do") ? 20 : 30;
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 40 WINS (9 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  CENTUR_ION: {
    label: "Centur-Ion",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Extra Deck: ≥ 7 Synchro Monster (không bao gồm starter). Team: ≥ 40/180.",
    checks: [
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro: ${count}`
              : `✗ Synchro không đủ: ${count}/${required}.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Nguyễn. Đ. Bình thì 35 wins
      return teamMembers.includes("Nguyễn. Đ. Bình") ? 35 : 40;
    },
  },

  FIENDSMITH: {
    label: "Fiendsmith",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 Fiend Monster + ≥ 5 card với GY Special Summon. Team: ≥ 40/180.",
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
              ? `✓ Fiend: ${count}`
              : `✗ Fiend không đủ: ${count}/${required}.`,
          detail: `Fiend: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const gySpecial = mainDeck.filter(
          (c) =>
            c.desc?.toLowerCase().includes("graveyard") ||
            c.desc?.toLowerCase().includes("gy") ||
            c.desc?.toLowerCase().includes("special summon"),
        );
        const count = gySpecial.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ GY Special Summon: ${count}`
              : `✗ GY Special Summon không đủ: ${count}/${required}.`,
          detail: `GY Summon: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Doãn Nhân thì 30 wins
      return teamMembers.includes("Doãn Nhân") ? 30 : 40;
    },
  },

  LABRYNTH_ELDLICH: {
    label: "Labrynth/Eldlich",
    winsRequired: 40,
    teamCondition: 40,
    description: "Main Deck: ≥ 20 Trap Card. Team: ≥ 40/180.",
    checks: [
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 20;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap: ${count}`
              : `✗ Trap không đủ: ${count}/${required}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có "Phú" hoặc "Tài" trong tên giảm 5 mỗi người (tối đa 30)
      let reduction = 0;
      teamMembers.forEach((name) => {
        if (name.includes("Phú") || name.includes("Tài")) {
          reduction += 5;
        }
      });
      return Math.max(10, 40 - Math.min(reduction, 30));
    },
  },

  PURRELY: {
    label: "Purrely",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 Quick-Play Spell. Match: LP > 10000 + 3 Xyz on field. Team: ≥ 40/180.",
    checks: [
      ({ mainDeck }) => {
        const quickPlay = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickPlay.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play: ${count}`
              : `✗ Quick-Play không đủ: ${count}/${required}.`,
          detail: `Quick-Play: ${count}`,
        };
      },
    ],
  },

  RADIANT_TYPHOON: {
    label: "Radiant Typhoon",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 3 Archetype + ≥ 10 Quick-Play Spell. Team: ≥ 40/180.",
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
              ? `✓ Archetype: ${count}`
              : `✗ Archetype không đủ: ${count}/${required}.`,
          detail: `Archetypes: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const quickPlay = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickPlay.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play: ${count}`
              : `✗ Quick-Play không đủ: ${count}/${required}.`,
          detail: `Quick-Play: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có cả Nguyễn Quang và Sang Truong thì 20 wins
      // Nếu chỉ có một thì 30 wins
      const hasNguyen = teamMembers.includes("Nguyễn Quang");
      const hasSang = teamMembers.includes("Sang Truong");
      if (hasNguyen && hasSang) return 20;
      if (hasNguyen || hasSang) return 30;
      return 40;
    },
  },

  RESCUE_ACE: {
    label: "Rescue-ACE",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 Quick-Play + ≥ 10 Normal Trap + ≥ 5 Destroy card. Team: ≥ 40/180.",
    checks: [
      ({ mainDeck }) => {
        const quickPlay = mainDeck.filter(
          (c) => c.isSpell && c.cardType?.includes("Quick-Play"),
        );
        const count = quickPlay.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Quick-Play: ${count}`
              : `✗ Quick-Play không đủ: ${count}/${required}.`,
          detail: `Quick-Play: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const normalTrap = mainDeck.filter(
          (c) => c.isTrap && !c.cardType?.includes("Continuous"),
        );
        const count = normalTrap.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Normal Trap: ${count}`
              : `✗ Normal Trap không đủ: ${count}/${required}.`,
          detail: `Normal Trap: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const destroy = mainDeck.filter(
          (c) =>
            c.desc?.toLowerCase().includes("destroy") ||
            c.desc?.toLowerCase().includes("remove"),
        );
        const count = destroy.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Destroy effect: ${count}`
              : `✗ Destroy effect không đủ: ${count}/${required}.`,
          detail: `Destroy: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Khai Điện thì 35 wins
      return teamMembers.includes("Khai Điện") ? 35 : 40;
    },
  },

  VOICELESS_VOICE: {
    label: "Voiceless Voice",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 LIGHT Monster + Deck: ≥ 5 Ritual Monster/Spell. Team: ≥ 40/180.",
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
              ? `✓ LIGHT: ${count}`
              : `✗ LIGHT không đủ: ${count}/${required}.`,
          detail: `LIGHT: ${count}`,
        };
      },
      ({ mainDeck, extraDeck, sideDeck }) => {
        const allCards = [...mainDeck, ...extraDeck, ...sideDeck];
        const ritual = allCards.filter(
          (c) =>
            (c.race === "Ritual Monster" && c.isMonster) ||
            (c.isSpell && c.cardType?.includes("Ritual")),
        );
        const count = ritual.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Monster/Spell: ${count}`
              : `✗ Ritual không đủ: ${count}/${required}.`,
          detail: `Ritual: ${count}`,
        };
      },
    ],
  },

  KASHTIRA: {
    label: "Kashtira",
    winsRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 Psychic Monster. Extra Deck: ≥ 5 Xyz Monster. Team: ≥ 40/180.",
    checks: [
      ({ mainDeck }) => {
        const psychic = mainDeck.filter(
          (c) => c.isMonster && c.race === "Psychic",
        );
        const count = psychic.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Psychic: ${count}`
              : `✗ Psychic không đủ: ${count}/${required}.`,
          detail: `Psychic: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const xyz = extraDeck.filter((c) => c.isXyz);
        const count = xyz.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz (Extra): ${count}`
              : `✗ Xyz không đủ: ${count}/${required}.`,
          detail: `Xyz: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 50 WINS (7 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  BRANDED: {
    label: "Branded",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 10 Fusion Material Monster. Extra Deck: ≥ 5 Fusion Monster. Team: ≥ 50/180.",
    checks: [
      ({ mainDeck }) => {
        const fusionMaterial = mainDeck.filter(
          (c) =>
            c.isMonster &&
            (c.desc?.toLowerCase().includes("fusion") || c.race === "Fusion"),
        );
        const count = fusionMaterial.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Fusion Material: ${count}`
              : `✗ Fusion Material không đủ: ${count}/${required}.`,
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
              ? `✓ Fusion (Extra): ${count}`
              : `✗ Fusion không đủ: ${count}/${required}.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có "Đạt", "Trần", "Quang", "Bảo" giảm 5 mỗi người (max 30)
      let reduction = 0;
      const keywords = ["Đạt", "Trần", "Quang", "Bảo"];
      teamMembers.forEach((name) => {
        keywords.forEach((kw) => {
          if (name.includes(kw)) reduction += 5;
        });
      });
      return Math.max(20, 50 - Math.min(reduction, 30));
    },
  },

  DRACOTAIL: {
    label: "Dracotail",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 15 Dragon Monster + ≥ 5 Dragon Special Summon card. Team: ≥ 50/180.",
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
              ? `✓ Dragon: ${count}`
              : `✗ Dragon không đủ: ${count}/${required}.`,
          detail: `Dragon: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const dragonSpecial = mainDeck.filter(
          (c) =>
            c.desc?.toLowerCase().includes("dragon") &&
            (c.desc?.toLowerCase().includes("special summon") ||
              c.desc?.toLowerCase().includes("summon")),
        );
        const count = dragonSpecial.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Dragon Special: ${count}`
              : `✗ Dragon Special không đủ: ${count}/${required}.`,
          detail: `Dragon Special: ${count}`,
        };
      },
    ],
  },

  KEWL_TUNE: {
    label: "Kewl Tune",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 10 Tuner Monster. Extra Deck: ≥ 7 Synchro Monster. Team: ≥ 50/180.",
    checks: [
      ({ mainDeck }) => {
        const tuners = mainDeck.filter((c) => c.isMonster && c.isTuner);
        const count = tuners.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tuner: ${count}`
              : `✗ Tuner không đủ: ${count}/${required}.`,
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
              ? `✓ Synchro (Extra): ${count}`
              : `✗ Synchro không đủ: ${count}/${required}.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Trương Duy thì 40 wins
      return teamMembers.includes("Trương Duy") ? 40 : 50;
    },
  },

  MITSURUGI: {
    label: "Mitsurugi",
    winsRequired: 50,
    teamCondition: 50,
    description: "Main Deck: ≥ 10 Reptile Monster. Team: ≥ 50/180.",
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
              ? `✓ Reptile: ${count}`
              : `✗ Reptile không đủ: ${count}/${required}.`,
          detail: `Reptile: ${count}`,
        };
      },
    ],
  },

  RYZEAL: {
    label: "Ryzeal",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 10 LIGHT/Thunder Monster. Extra Deck: ≥ 7 Xyz Monster. Team: ≥ 50/180.",
    checks: [
      ({ mainDeck }) => {
        const lightThunder = mainDeck.filter(
          (c) =>
            c.isMonster && (c.attribute === "LIGHT" || c.race === "Thunder"),
        );
        const count = lightThunder.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ LIGHT/Thunder: ${count}`
              : `✗ LIGHT/Thunder không đủ: ${count}/${required}.`,
          detail: `LIGHT/Thunder: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const xyz = extraDeck.filter((c) => c.isXyz);
        const count = xyz.length;
        const required = 7;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz (Extra): ${count}`
              : `✗ Xyz không đủ: ${count}/${required}.`,
          detail: `Xyz: ${count}`,
        };
      },
    ],
  },

  TENPAI_DRAGON: {
    label: "Tenpai Dragon",
    winsRequired: 50,
    teamCondition: 50,
    description: "Main Deck: ≥ 12 Dragon Monster. Team: ≥ 50/180.",
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
              ? `✓ Dragon: ${count}`
              : `✗ Dragon không đủ: ${count}/${required}.`,
          detail: `Dragon: ${count}`,
        };
      },
    ],
  },

  WHITE_FOREST: {
    label: "White Forest",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 12 Spell Card. Extra Deck: ≥ 5 Synchro Monster. Team: ≥ 50/180.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 12;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell: ${count}`
              : `✗ Spell không đủ: ${count}/${required}.`,
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
              ? `✓ Synchro (Extra): ${count}`
              : `✗ Synchro không đủ: ${count}/${required}.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  MALICE: {
    label: "M∀LICE",
    winsRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 25 DARK Monster + ≥ 45 card tổng cộng. Team: ≥ 50/180.",
    checks: [
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
              ? `✓ DARK Monster: ${count}`
              : `✗ DARK Monster không đủ: ${count}/${required}.`,
          detail: `DARK: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const count = mainDeck.length;
        const required = 45;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tổng Main Deck: ${count}`
              : `✗ Main Deck quá ít: ${count}/${required}.`,
          detail: `Total Main: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 20 LOSSES (5 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  SCARECLAW: {
    label: "Scareclaw",
    lossesRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 10 Beast/Beast-Warrior Monster. Extra Deck: ≥ 3 Link Monster. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const beastWarrior = mainDeck.filter(
          (c) =>
            c.isMonster && (c.race === "Beast" || c.race === "Beast-Warrior"),
        );
        const count = beastWarrior.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Beast/Beast-Warrior: ${count}`
              : `✗ Beast/Beast-Warrior không đủ: ${count}/${required}.`,
          detail: `Beast/B-Warrior: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const links = extraDeck.filter((c) => c.isLink);
        const count = links.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Link (Extra): ${count}`
              : `✗ Link không đủ: ${count}/${required}.`,
          detail: `Link: ${count}`,
        };
      },
    ],
  },

  DRAGONMAID: {
    label: "Dragonmaid",
    lossesRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 8 Dragon Monster. Extra Deck: ≥ 3 Fusion Monster. Team: ≥ 20/180 losses.",
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
              ? `✓ Dragon: ${count}`
              : `✗ Dragon không đủ: ${count}/${required}.`,
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
              ? `✓ Fusion (Extra): ${count}`
              : `✗ Fusion không đủ: ${count}/${required}.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Đào Đức thì chỉ cần 10 losses
      return teamMembers.includes("Đào Đức") ? 10 : 20;
    },
  },

  FLOOWANDEREEZE_LOSS: {
    label: "Floowandereeze",
    lossesRequired: 20,
    teamCondition: 20,
    description: "Main Deck: ≥ 15 Winged Beast Monster. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const wingedBeast = mainDeck.filter(
          (c) => c.isMonster && c.race === "Winged Beast",
        );
        const count = wingedBeast.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Winged Beast: ${count}`
              : `✗ Winged Beast không đủ: ${count}/${required}.`,
          detail: `Winged Beast: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Gầm Giường thì chỉ cần 10 losses
      return teamMembers.includes("Gầm Giường") ? 10 : 20;
    },
  },

  CONTINUOUS_TRAP_DECK: {
    label: "Continuous Trap Deck",
    lossesRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 10 Continuous Spell/Trap Card. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const continuous = mainDeck.filter(
          (c) =>
            (c.isTrap && c.cardType?.includes("Continuous")) ||
            (c.isSpell && c.cardType?.includes("Continuous")),
        );
        const count = continuous.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Continuous: ${count}`
              : `✗ Continuous không đủ: ${count}/${required}.`,
          detail: `Continuous: ${count}`,
        };
      },
    ],
  },

  YUMMY: {
    label: "Yummy",
    lossesRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 10 Ritual Monster + ≥ 5 Ritual Spell/Tribute effect. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const ritual = mainDeck.filter(
          (c) => c.isMonster && c.race === "Ritual Monster",
        );
        const count = ritual.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Monster: ${count}`
              : `✗ Ritual Monster không đủ: ${count}/${required}.`,
          detail: `Ritual: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const ritualSpell = mainDeck.filter(
          (c) =>
            (c.isSpell && c.cardType?.includes("Ritual")) ||
            c.desc?.toLowerCase().includes("ritual") ||
            c.desc?.toLowerCase().includes("tribute"),
        );
        const count = ritualSpell.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Spell/Tribute: ${count}`
              : `✗ Ritual Spell/Tribute không đủ: ${count}/${required}.`,
          detail: `Ritual Spell: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Hồ Huy thì chỉ cần 10 losses
      return teamMembers.includes("Hồ Huy") ? 10 : 20;
    },
  },

  SWORDSOUL_LOSS: {
    label: "Swordsoul",
    lossesRequired: 20,
    teamCondition: 20,
    description:
      "Main Deck: ≥ 10 Wyrm Monster. Extra Deck: ≥ 7 Synchro Monster. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const wyrm = mainDeck.filter((c) => c.isMonster && c.race === "Wyrm");
        const count = wyrm.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Wyrm: ${count}`
              : `✗ Wyrm không đủ: ${count}/${required}.`,
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
              ? `✓ Synchro (Extra): ${count}`
              : `✗ Synchro không đủ: ${count}/${required}.`,
          detail: `Synchro: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 30 LOSSES (6 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  BYSTIAL_LOSS: {
    label: "Bystial",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 3 Level 6 Dragon Monster (LIGHT/DARK). Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const level6Dragon = mainDeck.filter(
          (c) =>
            c.isMonster &&
            c.race === "Dragon" &&
            c.level === 6 &&
            (c.attribute === "LIGHT" || c.attribute === "DARK"),
        );
        const count = level6Dragon.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Level 6 Dragon: ${count}`
              : `✗ Level 6 Dragon không đủ: ${count}/${required}.`,
          detail: `Lv6 Dragon: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Tú Thanh thì chỉ cần 20 losses
      return teamMembers.includes("Tú Thanh") ? 20 : 30;
    },
  },

  DRAGON_RULER_LOSS: {
    label: "Dragon Ruler",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 4 Attribute (FIRE/WATER/EARTH/WIND) + ≥ 10 Dragon Monster. Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) => c.isMonster && c.race === "Dragon",
        );
        const attributes = new Set(
          dragons.map((c) => c.attribute).filter(Boolean),
        );
        const hasAll = ["FIRE", "WATER", "EARTH", "WIND"].every((a) =>
          attributes.has(a),
        );
        return {
          pass: hasAll,
          message: hasAll
            ? `✓ 4 Attributes: ${[...attributes].join(", ")}`
            : `✗ Attributes không đủ: ${[...attributes].join(", ")}.`,
          detail: `Attributes: ${attributes.size}`,
        };
      },
      ({ mainDeck }) => {
        const dragons = mainDeck.filter(
          (c) => c.isMonster && c.race === "Dragon",
        );
        const count = dragons.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Dragon: ${count}`
              : `✗ Dragon không đủ: ${count}/${required}.`,
          detail: `Dragon: ${count}`,
        };
      },
    ],
  },

  METALFOES_LOSS: {
    label: "Metalfoes",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 8 Pendulum Monster. Extra Deck: ≥ 3 Fusion Monster. Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const pendulum = mainDeck.filter((c) => c.isPendulum && c.isMonster);
        const count = pendulum.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Pendulum: ${count}`
              : `✗ Pendulum không đủ: ${count}/${required}.`,
          detail: `Pendulum: ${count}`,
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
              ? `✓ Fusion (Extra): ${count}`
              : `✗ Fusion không đủ: ${count}/${required}.`,
          detail: `Fusion: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Nguyễn Đình Tấn Phát thì chỉ cần 20 losses
      return teamMembers.includes("Nguyễn Đình Tấn Phát") ? 20 : 30;
    },
  },

  RUNICK: {
    label: "Runick",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 10 Spell Card + ≥ 10 Trap Card. Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell: ${count}`
              : `✗ Spell không đủ: ${count}/${required}.`,
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
              ? `✓ Trap: ${count}`
              : `✗ Trap không đủ: ${count}/${required}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  SPYRAL_LOSS: {
    label: "SPYRAL",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 3 card có thể xem tay hoặc Top Deck. Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const handView = mainDeck.filter(
          (c) =>
            c.desc?.toLowerCase().includes("view") ||
            c.desc?.toLowerCase().includes("hand") ||
            c.desc?.toLowerCase().includes("top"),
        );
        const count = handView.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Hand/Deck view: ${count}`
              : `✗ Hand/Deck view không đủ: ${count}/${required}.`,
          detail: `View cards: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Chương Trần thì chỉ cần 20 losses
      return teamMembers.includes("Chương Trần") ? 20 : 30;
    },
  },

  YUBEL: {
    label: "Yubel",
    lossesRequired: 30,
    teamCondition: 30,
    description: "Main Deck: ≥ 10 Fiend Monster. Team: ≥ 30/180 losses.",
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
              ? `✓ Fiend: ${count}`
              : `✗ Fiend không đủ: ${count}/${required}.`,
          detail: `Fiend: ${count}`,
        };
      },
    ],
  },

  MANNADIUM_LOSS: {
    label: "Mannadium",
    lossesRequired: 30,
    teamCondition: 30,
    description:
      "Main Deck: ≥ 4 Archetype khác nhau + ≥ 8 Tuner Monster. Team: ≥ 30/180 losses.",
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
              ? `✓ Archetype: ${count}`
              : `✗ Archetype không đủ: ${count}/${required}.`,
          detail: `Archetypes: ${count}`,
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
              ? `✓ Tuner: ${count}`
              : `✗ Tuner không đủ: ${count}/${required}.`,
          detail: `Tuner: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 40 LOSSES (3 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  DINOSAUR: {
    label: "Dinosaur",
    lossesRequired: 40,
    teamCondition: 40,
    description:
      "Main Deck: ≥ 10 card với tên khác nhau. Team: ≥ 40/180 losses.",
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
              ? `✓ Unique names: ${count}`
              : `✗ Unique names không đủ: ${count}/${required}.`,
          detail: `Unique: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Nos Karkin thì chỉ cần 30 losses
      return teamMembers.includes("Nos Karkin") ? 30 : 40;
    },
  },

  ENNEACRAFT: {
    label: "Enneacraft",
    lossesRequired: 40,
    teamCondition: 40,
    description: "Main Deck: ≥ 12 Spell Card. Team: ≥ 40/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 12;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell: ${count}`
              : `✗ Spell không đủ: ${count}/${required}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Súc Vật Đại Dương thì chỉ cần 30 losses
      return teamMembers.includes("Súc Vật Đại Dương") ? 30 : 40;
    },
  },

  MATHMECH_LOSS: {
    label: "Mathmech",
    lossesRequired: 50,
    teamCondition: 50,
    description:
      "Main Deck: ≥ 10 Cyberse Monster. Extra Deck: ≥ 1 Xyz + ≥ 1 Link Monster. Team: ≥ 50/180 losses.",
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
              ? `✓ Cyberse: ${count}`
              : `✗ Cyberse không đủ: ${count}/${required}.`,
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
            : `✗ Xyz or Link: ${xyz.length}/${1}, Link: ${link.length}/${1}.`,
          detail: `Xyz: ${xyz.length} | Link: ${link.length}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 60 LOSSES (1 Archetype)
  // ═════════════════════════════════════════════════════════════════════════

  UNCHAINED_LOSS: {
    label: "Unchained",
    lossesRequired: 60,
    teamCondition: 60,
    description:
      "Main Deck: ≥ 10 Fiend Monster + ≥ 5 Trap Card. Team: ≥ 60/180 losses.",
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
              ? `✓ Fiend: ${count}`
              : `✗ Fiend không đủ: ${count}/${required}.`,
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
              ? `✓ Trap: ${count}`
              : `✗ Trap không đủ: ${count}/${required}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 100 LOSSES (1 Archetype)
  // ═════════════════════════════════════════════════════════════════════════

  ZOODIAC_FULL_POWER: {
    label: "Zoodiac (Full Power)",
    lossesRequired: 100,
    teamCondition: 100,
    description:
      "Extra Deck: ≥ 5 Xyz Monster. Main Deck: ≥ 5 Beast Monster. Team: ≥ 100/180 losses + Top 3 ranking.",
    checks: [
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
              ? `✓ Beast: ${count}`
              : `✗ Beast không đủ: ${count}/${required}.`,
          detail: `Beast: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const xyz = extraDeck.filter((c) => c.isXyz);
        const count = xyz.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz (Extra): ${count}`
              : `✗ Xyz không đủ: ${count}/${required}.`,
          detail: `Xyz: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE BOTH WINS AND LOSSES (1 Archetype)
  // ═════════════════════════════════════════════════════════════════════════

  TEARLAMENTS_FULL_POWER: {
    label: "Tearlaments (Full Power)",
    winsRequired: 60,
    lossesRequired: 60,
    teamCondition: 120,
    description:
      "Complete Scareclaw + Mannadium + Kashtira quests. Win <2000 LP. Alternate win/loss ≥ 3 times. Team: 60W/60L at 120 total.",
    checks: [
      ({ mainDeck, extraDeck }) => {
        // Check for diverse archetype support (Scareclaw, Mannadium, Kashtira components)
        const archetypes = new Set(
          [...mainDeck, ...extraDeck]
            .map((c) => c.archetype?.toLowerCase())
            .filter(Boolean),
        );

        const questArchetypes = [
          "scareclaw",
          "mannadium",
          "kashtira",
          "tearlaments",
        ];
        const hasQuestArchetypes = questArchetypes.filter((qa) =>
          Array.from(archetypes).some((a) => a?.includes(qa)),
        ).length;

        const pass = hasQuestArchetypes >= 2;
        return {
          pass,
          message: pass
            ? `✓ Quest Archetypes Detected: ${hasQuestArchetypes}/${questArchetypes.length}`
            : `✗ Need multiple quest archetypes (Scareclaw/Mannadium/Kashtira/Tearlaments): found ${hasQuestArchetypes}`,
          detail: `Quest Archetypes: ${hasQuestArchetypes}`,
        };
      },
      ({ mainDeck }) => {
        // Check for diverse support cards and floodgates
        const supportCards = mainDeck.filter(
          (c) =>
            c.isSpell ||
            c.isTrap ||
            (c.isMonster &&
              c.race !== "Dragon" &&
              c.race !== "Synchro Monster"),
        );
        const pass = supportCards.length >= 10;
        return {
          pass,
          message: pass
            ? `✓ Support Cards: ${supportCards.length}`
            : `✗ Need diverse support cards: ${supportCards.length}/10`,
          detail: `Support: ${supportCards.length}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      // Nếu có Theodore Hamilton thì được chênh lệch 5 trận trên mỗi điều kiện
      return teamMembers.includes("Theodore Hamilton") ? 5 : 0;
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all archetypes grouped by requirement type
 */
export function getArchetypesByRequirement() {
  const grouped = {
    wins10: [],
    wins20: [],
    wins30: [],
    wins40: [],
    wins50: [],
    losses20: [],
    losses30: [],
    losses40: [],
    losses50: [],
    losses60: [],
    losses100: [],
    both: [],
  };

  Object.entries(ARCHETYPE_RULES).forEach(([key, archetype]) => {
    if (archetype.winsRequired && archetype.lossesRequired) {
      grouped.both.push({ key, ...archetype });
    } else if (archetype.winsRequired) {
      const group = `wins${archetype.winsRequired}`;
      if (grouped[group]) grouped[group].push({ key, ...archetype });
    } else if (archetype.lossesRequired) {
      const group = `losses${archetype.lossesRequired}`;
      if (grouped[group]) grouped[group].push({ key, ...archetype });
    }
  });

  return grouped;
}

/**
 * Validate archetype conditions
 */
export function validateArchetype(
  archetypeKey,
  mainDeck,
  extraDeck,
  sideDeck,
  teamWins,
  teamLosses,
  teamMembers = [],
) {
  const archetype = ARCHETYPE_RULES[archetypeKey];
  if (!archetype) return null;

  const allCards = { mainDeck, extraDeck, sideDeck };
  const checkResults = archetype.checks.map((check) => check(allCards));

  const deckPasses = checkResults.every((r) => r.pass);

  // Team condition check
  const requiresWins = archetype.winsRequired > 0;
  const requiresLosses = archetype.lossesRequired > 0;

  let winsAdjustment = 0;
  let lossesAdjustment = 0;

  if (archetype.respectCondition) {
    const result = archetype.respectCondition(teamMembers);
    if (typeof result === "number") {
      if (requiresWins) winsAdjustment = archetype.winsRequired - result;
      if (requiresLosses) lossesAdjustment = archetype.lossesRequired - result;
    } else if (result === true) {
      winsAdjustment = archetype.winsRequired;
      lossesAdjustment = archetype.lossesRequired;
    }
  }

  const adjustedWinsRequired = archetype.winsRequired - winsAdjustment;
  const adjustedLossesRequired = archetype.lossesRequired - lossesAdjustment;

  const winsPasses = !requiresWins || teamWins >= adjustedWinsRequired;
  const lossesPasses = !requiresLosses || teamLosses >= adjustedLossesRequired;

  const teamPasses = winsPasses && lossesPasses;
  const isEligible = deckPasses && teamPasses;

  return {
    archetypeLabel: archetype.label,
    deckConditionMet: deckPasses,
    teamConditionMet: teamPasses,
    winsConditionMet: winsPasses,
    lossesConditionMet: lossesPasses,
    eligible: isEligible,
    checks: checkResults,
    winsRequired: adjustedWinsRequired,
    lossesRequired: adjustedLossesRequired,
    winsAdjustment,
    lossesAdjustment,
    respectBonusApplied: winsAdjustment > 0 || lossesAdjustment > 0,
  };
}

/**
 * Main validation function - validates a single archetype against deck composition
 * Called by API to validate all or specific archetypes
 *
 * @param {string} archetypeKey - Archetype identifier
 * @param {object} decks - { mainDeck, extraDeck, sideDeck } CardData arrays
 * @param {number} teamWins - Team wins (default 0)
 * @param {number} teamLosses - Team losses (default 0)
 * @param {string[]} teamMembers - Team member names for respect bonuses
 * @returns {object} Validation result with overall status and requirements
 */
export function validateDeck(
  archetypeKey,
  decks,
  teamWins = 0,
  teamLosses = 0,
  teamMembers = [],
) {
  const { mainDeck = [], extraDeck = [], sideDeck = [] } = decks || {};
  const archetype = ARCHETYPE_RULES[archetypeKey];

  if (!archetype) {
    return {
      overallPass: false,
      error: `Archetype "${archetypeKey}" không tồn tại`,
      deckConditionMet: false,
      teamConditionMet: false,
      winsConditionMet: false,
      lossesConditionMet: false,
      winsRequired: 0,
      lossesRequired: 0,
    };
  }

  // Run all deck checks
  const allCards = { mainDeck, extraDeck, sideDeck };
  const checkResults = archetype.checks.map((check) => check(allCards));
  const deckConditionMet = checkResults.every((r) => r.pass);

  // Team condition check
  const requiresWins = archetype.winsRequired > 0;
  const requiresLosses = archetype.lossesRequired > 0;

  let winsAdjustment = 0;
  let lossesAdjustment = 0;

  if (archetype.respectCondition) {
    const result = archetype.respectCondition(teamMembers);
    if (typeof result === "number") {
      if (requiresWins) winsAdjustment = archetype.winsRequired - result;
      if (requiresLosses) lossesAdjustment = archetype.lossesRequired - result;
    } else if (result === true) {
      winsAdjustment = archetype.winsRequired;
      lossesAdjustment = archetype.lossesRequired;
    }
  }

  const adjustedWinsRequired = archetype.winsRequired - winsAdjustment;
  const adjustedLossesRequired = archetype.lossesRequired - lossesAdjustment;

  const winsConditionMet = !requiresWins || teamWins >= adjustedWinsRequired;
  const lossesConditionMet =
    !requiresLosses || teamLosses >= adjustedLossesRequired;

  const teamConditionMet = winsConditionMet && lossesConditionMet;
  const overallPass = deckConditionMet && teamConditionMet;

  return {
    overallPass,
    archetypeLabel: archetype.label,
    deckConditionMet,
    teamConditionMet,
    winsConditionMet,
    lossesConditionMet,
    winsRequired: adjustedWinsRequired,
    lossesRequired: adjustedLossesRequired,
    winsAdjustment,
    lossesAdjustment,
    respectBonusApplied: winsAdjustment > 0 || lossesAdjustment > 0,
    checks: checkResults,
  };
}
