/**
 * utils/rulesEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Complete Rules Engine — Yu-Gi-Oh! Tournament Deck Validator
 * All Archetypes with Scaling Conditions
 *
 * teamConditionType:
 *   "wins"        → chỉ cần wins
 *   "losses"      → chỉ cần losses
 *   "both"        → cần cả wins VÀ losses
 *   "winsOrLosses"→ thắng HOẶC thua (tổng >= threshold)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════════════════
// ARCHETYPE REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHETYPE_RULES = {
  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 10 WINS (2 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  MIKANKO: {
    label: "Mikanko",
    winsRequired: 10,
    teamCondition: 10,
    teamConditionType: "wins",
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
      return teamMembers.includes("Yuki Chan");
    },
  },

  TRAPTRIX: {
    label: "Traptrix",
    winsRequired: 10,
    teamCondition: 10,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Khai Điện") ? 15 : 20;
    },
  },

  DDD: {
    label: "D/D/D",
    winsRequired: 20,
    teamCondition: 20,
    teamConditionType: "wins",
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
      return teamMembers.includes("Kuroko Guen") ? 10 : 20;
    },
  },

  HERO: {
    label: "HERO",
    winsRequired: 20,
    teamCondition: 20,
    teamConditionType: "wins",
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
      return teamMembers.includes("Pham Le Minh") ? 10 : 20;
    },
  },

  RITUAL_BEAST: {
    label: "Ritual Beast",
    winsRequired: 20,
    teamCondition: 20,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Cell Skt") ? 25 : 30;
    },
  },

  ELFNOTE: {
    label: "Elfnote",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Nguyễn. Đ. Bình") ? 25 : 30;
    },
  },

  K9: {
    label: "K9",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
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
      return teamMembers.includes("Cell Skt") ? 25 : 30;
    },
  },

  SKY_STRIKER: {
    label: "Sky Striker",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
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
      if (teamMembers.includes("Nhật Minh")) return 20;
      return 30;
    },
  },

  SNAKE_EYES: {
    label: "Snake-Eyes",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Nguyễn. Đ. Bình") ? 35 : 40;
    },
  },

  FIENDSMITH: {
    label: "Fiendsmith",
    winsRequired: 40,
    teamCondition: 40,
    teamConditionType: "wins",
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
      return teamMembers.includes("Doãn Nhân") ? 30 : 40;
    },
  },

  LABRYNTH_ELDLICH: {
    label: "Labrynch/Eldlich",
    winsRequired: 40,
    teamCondition: 40,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Khai Điện") ? 35 : 40;
    },
  },

  VOICELESS_VOICE: {
    label: "Voiceless Voice",
    winsRequired: 40,
    teamCondition: 40,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
      return teamMembers.includes("Trương Duy") ? 40 : 50;
    },
  },

  MITSURUGI: {
    label: "Mitsurugi",
    winsRequired: 50,
    teamCondition: 50,
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
    teamConditionType: "wins",
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
  // REQUIRE LOSSES — 10 LOSSES (1 Archetype)
  // ═════════════════════════════════════════════════════════════════════════

  SCARECLAW: {
    label: "Scareclaw",
    lossesRequired: 10,
    teamCondition: 10,
    teamConditionType: "losses",
    description:
      "Main Deck: ≥ 10 Beast/Beast-Warrior Monster. Extra Deck: ≥ 3 Link Monster. Team: ≥ 10/180 losses.",
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

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 20 LOSSES (5 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  DRAGONMAID: {
    label: "Dragonmaid",
    lossesRequired: 20,
    teamCondition: 20,
    teamConditionType: "losses",
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
      return teamMembers.includes("Đào Đức") ? 10 : 20;
    },
  },

  FLOOWANDEREEZE_LOSS: {
    label: "Floowandereeze",
    lossesRequired: 20,
    teamCondition: 20,
    teamConditionType: "losses",
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
      return teamMembers.includes("Gầm Giường") ? 10 : 20;
    },
  },

  YUMMY: {
    label: "Yummy",
    lossesRequired: 20,
    teamCondition: 20,
    teamConditionType: "losses",
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
      return teamMembers.includes("Hồ Huy") ? 10 : 20;
    },
  },

  SWORDSOUL_LOSS: {
    label: "Swordsoul",
    lossesRequired: 20,
    teamCondition: 20,
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
      return teamMembers.includes("Tú Thanh") ? 20 : 30;
    },
  },

  DRAGON_RULER_LOSS: {
    label: "Dragon Ruler",
    lossesRequired: 30,
    teamCondition: 30,
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
      return teamMembers.includes("Nguyễn Đình Tấn Phát") ? 20 : 30;
    },
  },

  RUNICK: {
    label: "Runick",
    lossesRequired: 30,
    teamCondition: 30,
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
      return teamMembers.includes("Chương Trần") ? 20 : 30;
    },
  },

  YUBEL: {
    label: "Yubel",
    lossesRequired: 30,
    teamCondition: 30,
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
      return teamMembers.includes("Nos Karkin") ? 30 : 40;
    },
  },

  ENNEACRAFT: {
    label: "Enneacraft",
    lossesRequired: 40,
    teamCondition: 40,
    teamConditionType: "losses",
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
      return teamMembers.includes("Súc Vật Đại Dương") ? 30 : 40;
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // REQUIRE 50 LOSSES (1 Archetype)
  // ═════════════════════════════════════════════════════════════════════════

  MATHMECH_LOSS: {
    label: "Mathmech",
    lossesRequired: 50,
    teamCondition: 50,
    teamConditionType: "losses",
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
    teamConditionType: "losses",
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
  // REQUIRE 30 LOSSES (renamed from 100) — ZOODIAC
  // ═════════════════════════════════════════════════════════════════════════

  ZOODIAC: {
    label: "Zoodiac",
    lossesRequired: 30,
    teamCondition: 30,
    teamConditionType: "losses",
    description:
      "Extra Deck: ≥ 5 Xyz Monster. Main Deck: ≥ 5 Beast Monster. Team: ≥ 30/180 losses.",
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
  // REQUIRE BOTH WINS AND LOSSES (2 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  TEARLAMENTS_FULL_POWER: {
    label: "Tearlaments (Full Power)",
    winsRequired: 60,
    lossesRequired: 60,
    teamCondition: 120,
    teamConditionType: "both",
    description:
      "Complete Scareclaw + Mannadium + Kashtira quests. Win <2000 LP. Alternate win/loss ≥ 3 times. Team: 60W/60L at 120 total.",
    checks: [
      ({ mainDeck, extraDeck }) => {
        const allCards = [...mainDeck, ...extraDeck];
        const tearlamentCards = allCards.filter(
          (c) =>
            c.archetype?.toLowerCase().includes("tearlament") ||
            c.name?.toLowerCase().includes("tearlament"),
        );
        const count = tearlamentCards.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Tearlaments Cards: ${count} (yêu cầu ≥ ${required})`
              : `✗ Tearlaments Cards không đủ: ${count}/${required} lá. Deck cần chứa các lá Tearlaments chính.`,
          detail: `Tearlaments: ${count}`,
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
              ? `✓ Fusion (Extra): ${count} (yêu cầu ≥ ${required})`
              : `✗ Fusion không đủ: ${count}/${required} lá.`,
          detail: `Fusion: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const waterOrAqua = mainDeck.filter(
          (c) =>
            (c.isMonster && c.attribute === "WATER") ||
            c.desc?.toLowerCase().includes("send") ||
            c.desc?.toLowerCase().includes("mill"),
        );
        const count = waterOrAqua.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ WATER/Mill: ${count}`
              : `✗ WATER/Mill không đủ: ${count}/${required}.`,
          detail: `WATER/Mill: ${count}`,
        };
      },
    ],
    respectCondition: (teamMembers) => {
      return teamMembers.includes("Theodore Hamilton") ? 5 : 0;
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // NEW ARCHETYPES — REQUIRE WINS
  // ═════════════════════════════════════════════════════════════════════════

  TOON: {
    label: "Toon",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 10 monster VÀ ≥ 6 Spell/Trap. Team: ≥ 30/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const count = monsters.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Monster: ${count}`
              : `✗ Monster không đủ: ${count}/${required}.`,
          detail: `Monster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const spellTrap = mainDeck.filter((c) => c.isSpell || c.isTrap);
        const count = spellTrap.length;
        const required = 6;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell/Trap: ${count}`
              : `✗ Spell/Trap không đủ: ${count}/${required}.`,
          detail: `Spell/Trap: ${count}`,
        };
      },
    ],
  },

  BLACK_LUSTER_SOLDIER: {
    label: "Black Luster Soldier",
    lossesRequired: 30,
    teamCondition: 30,
    teamConditionType: "losses",
    description:
      "Main Deck: ≥ 5 Ritual Monster VÀ ≥ 5 Ritual Spell. Team: ≥ 30/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const ritualMonsters = mainDeck.filter(
          (c) => c.isMonster && c.isRitual,
        );
        const count = ritualMonsters.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Ritual Monster: ${count}`
              : `✗ Ritual Monster không đủ: ${count}/${required}.`,
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
              ? `✓ Ritual Spell: ${count}`
              : `✗ Ritual Spell không đủ: ${count}/${required}.`,
          detail: `Ritual Spell: ${count}`,
        };
      },
    ],
  },

  BLUE_EYES: {
    label: "Blue-Eyes",
    winsRequired: 25,
    teamCondition: 25,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 5 Normal Monster Level 8+. Extra Deck: ≥ 3 Synchro/Xyz. Team: ≥ 25/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const normalLv8 = mainDeck.filter(
          (c) => c.isMonster && !c.desc?.trim() && c.level >= 8,
        );
        const count = normalLv8.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Normal Monster Lv8+: ${count}`
              : `✗ Normal Monster Lv8+ không đủ: ${count}/${required}.`,
          detail: `Normal Lv8+: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const synchroXyz = extraDeck.filter((c) => c.isSynchro || c.isXyz);
        const count = synchroXyz.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Synchro/Xyz (Extra): ${count}`
              : `✗ Synchro/Xyz không đủ: ${count}/${required}.`,
          detail: `Synchro/Xyz: ${count}`,
        };
      },
    ],
  },

  DARK_MAGICIAN: {
    label: "Dark Magician",
    lossesRequired: 25,
    teamCondition: 25,
    teamConditionType: "losses",
    description:
      "Main Deck: ≥ 8 Spellcaster Monster VÀ Spell ≥ 40% tổng. Team: ≥ 25/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const spellcasters = mainDeck.filter(
          (c) => c.isMonster && c.race === "Spellcaster",
        );
        const count = spellcasters.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spellcaster: ${count}`
              : `✗ Spellcaster không đủ: ${count}/${required}.`,
          detail: `Spellcaster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const total = mainDeck.length;
        const ratio = total > 0 ? (spells.length / total) * 100 : 0;
        const pass = ratio >= 40;
        return {
          pass,
          message: pass
            ? `✓ Spell ratio: ${ratio.toFixed(1)}% (≥ 40%)`
            : `✗ Spell ratio không đủ: ${ratio.toFixed(1)}% / 40%.`,
          detail: `Spell%: ${ratio.toFixed(1)}%`,
        };
      },
    ],
  },

  INVOKED: {
    label: "Invoked",
    winsRequired: 25,
    teamCondition: 25,
    teamConditionType: "wins",
    description:
      "Extra Deck: ≥ 3 Fusion Monster thuộc ≥ 3 Attribute khác nhau. Team: ≥ 25/180 wins.",
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
            : `✗ Fusion/Attribute không đủ: Fusion=${fusions.length}, Attr=${attributes.size}/3.`,
          detail: `Fusion: ${fusions.length} | Attrs: ${attributes.size}`,
        };
      },
    ],
  },

  BLITZCLIQUE: {
    label: "Blitzclique",
    lossesRequired: 40,
    teamCondition: 40,
    teamConditionType: "losses",
    description:
      "Main Deck: ≥ 15 Thunder/Machine Monster VÀ ≤ 5 Trap. Team: ≥ 40/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const thunderMachine = mainDeck.filter(
          (c) => c.isMonster && (c.race === "Thunder" || c.race === "Machine"),
        );
        const count = thunderMachine.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Thunder/Machine: ${count}`
              : `✗ Thunder/Machine không đủ: ${count}/${required}.`,
          detail: `Thunder/Machine: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const max = 5;
        return {
          pass: count <= max,
          message:
            count <= max
              ? `✓ Trap: ${count} (≤ ${max})`
              : `✗ Trap quá nhiều: ${count} > ${max}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  MEMENTO: {
    label: "Memento",
    winsRequired: 50,
    teamCondition: 50,
    teamConditionType: "wins",
    description: "Main Deck: ≥ 15 Monster VÀ ≤ 6 Trap. Team: ≥ 50/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const count = monsters.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Monster: ${count}`
              : `✗ Monster không đủ: ${count}/${required}.`,
          detail: `Monster: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const max = 6;
        return {
          pass: count <= max,
          message:
            count <= max
              ? `✓ Trap: ${count} (≤ ${max})`
              : `✗ Trap quá nhiều: ${count} > ${max}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  PHANTOM_KNIGHT: {
    label: "Phantom Knight",
    lossesRequired: 25,
    teamCondition: 25,
    teamConditionType: "losses",
    description:
      "Extra Deck: ≥ 3 Xyz Rank 3-4. Main Deck: ≥ 10 DARK Warrior. Team: ≥ 25/180 losses.",
    checks: [
      ({ extraDeck }) => {
        const xyzRank34 = extraDeck.filter(
          (c) => c.isXyz && (c.level === 3 || c.level === 4),
        );
        const count = xyzRank34.length;
        const required = 3;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz Rank 3/4: ${count}`
              : `✗ Xyz Rank 3/4 không đủ: ${count}/${required}.`,
          detail: `Xyz R3/4: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const darkWarrior = mainDeck.filter(
          (c) => c.isMonster && c.race === "Warrior" && c.attribute === "DARK",
        );
        const count = darkWarrior.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ DARK Warrior: ${count}`
              : `✗ DARK Warrior không đủ: ${count}/${required}.`,
          detail: `DARK Warrior: ${count}`,
        };
      },
    ],
  },

  MAGNET_WARRIOR: {
    label: "Magnet Warrior",
    winsRequired: 20,
    teamCondition: 20,
    teamConditionType: "wins",
    description: "Main Deck: ≥ 10 EARTH Rock Monster. Team: ≥ 20/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const earthRock = mainDeck.filter(
          (c) => c.isMonster && c.race === "Rock" && c.attribute === "EARTH",
        );
        const count = earthRock.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ EARTH Rock: ${count}`
              : `✗ EARTH Rock không đủ: ${count}/${required}.`,
          detail: `EARTH Rock: ${count}`,
        };
      },
    ],
  },

  LUNALIGHT: {
    label: "Lunalight",
    lossesRequired: 25,
    teamCondition: 25,
    teamConditionType: "losses",
    description:
      "Main Deck: ≥ 10 Beast-Warrior. Extra Deck: ≥ 3 Fusion. Team: ≥ 25/180 losses.",
    checks: [
      ({ mainDeck }) => {
        const beastWarrior = mainDeck.filter(
          (c) => c.isMonster && c.race === "Beast-Warrior",
        );
        const count = beastWarrior.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Beast-Warrior: ${count}`
              : `✗ Beast-Warrior không đủ: ${count}/${required}.`,
          detail: `Beast-Warrior: ${count}`,
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
  },

  EXOSISTER: {
    label: "Exosister",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
    description:
      "Extra Deck: ≥ 4 Xyz. Main Deck: chỉ Spellcaster/Warrior. Team: ≥ 30/180 wins.",
    checks: [
      ({ extraDeck }) => {
        const xyz = extraDeck.filter((c) => c.isXyz);
        const count = xyz.length;
        const required = 4;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Xyz (Extra): ${count}`
              : `✗ Xyz không đủ: ${count}/${required}.`,
          detail: `Xyz: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const invalidMonsters = monsters.filter(
          (c) => c.race !== "Spellcaster" && c.race !== "Warrior",
        );
        const pass = invalidMonsters.length === 0;
        return {
          pass,
          message: pass
            ? `✓ Chỉ Spellcaster/Warrior (${monsters.length} monsters)`
            : `✗ Deck có ${invalidMonsters.length} monster không hợp lệ (không phải Spellcaster/Warrior).`,
          detail: `Invalid: ${invalidMonsters.length}`,
        };
      },
    ],
  },

  HECAHANDS: {
    label: "Hecahands",
    lossesRequired: 20,
    teamCondition: 20,
    teamConditionType: "losses",
    description: "Main Deck: ≥ 8 Hand Trap. Team: ≥ 20/180 losses.",
    checks: [
      ({ mainDeck }) => {
        // Detect handtraps: monsters with effect that can be activated from hand
        const handTraps = mainDeck.filter(
          (c) =>
            c.isMonster &&
            c.desc?.toLowerCase().includes("hand") &&
            (c.desc?.toLowerCase().includes("activate") ||
              c.desc?.toLowerCase().includes("special summon") ||
              c.desc?.toLowerCase().includes("negate") ||
              c.desc?.toLowerCase().includes("discard")),
        );
        const count = handTraps.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Hand Trap: ${count}`
              : `✗ Hand Trap không đủ: ${count}/${required}.`,
          detail: `Hand Trap: ${count}`,
        };
      },
    ],
  },

  PRIMITE: {
    label: "Primite",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 5 Normal Monster VÀ ≥ 10 Spell/Trap. Team: ≥ 30/180 wins.",
    checks: [
      ({ mainDeck }) => {
        // Normal monsters: isMonster with empty or no desc, not Effect
        const normalMonsters = mainDeck.filter(
          (c) =>
            c.isMonster &&
            !c.frameType?.toLowerCase().includes("effect") &&
            !c.frameType?.toLowerCase().includes("xyz") &&
            !c.frameType?.toLowerCase().includes("synchro") &&
            !c.frameType?.toLowerCase().includes("fusion") &&
            !c.frameType?.toLowerCase().includes("link") &&
            !c.frameType?.toLowerCase().includes("ritual") &&
            (c.frameType?.toLowerCase() === "normal" ||
              (!c.desc?.trim() &&
                c.frameType?.toLowerCase().includes("normal"))),
        );
        const count = normalMonsters.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Normal Monster: ${count}`
              : `✗ Normal Monster không đủ: ${count}/${required}.`,
          detail: `Normal: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const spellTrap = mainDeck.filter((c) => c.isSpell || c.isTrap);
        const count = spellTrap.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell/Trap: ${count}`
              : `✗ Spell/Trap không đủ: ${count}/${required}.`,
          detail: `Spell/Trap: ${count}`,
        };
      },
    ],
  },

  POWER_PATRON: {
    label: "Power Patron",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 8 Level 7+ Monster VÀ ≤ 12 Spell. Team: ≥ 30/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const highLevel = mainDeck.filter((c) => c.isMonster && c.level >= 7);
        const count = highLevel.length;
        const required = 8;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Level 7+ Monster: ${count}`
              : `✗ Level 7+ Monster không đủ: ${count}/${required}.`,
          detail: `Lv7+: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const max = 12;
        return {
          pass: count <= max,
          message:
            count <= max
              ? `✓ Spell: ${count} (≤ ${max})`
              : `✗ Spell quá nhiều: ${count} > ${max}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // GENERIC CARD — WINS OR LOSSES (4 Archetypes)
  // ═════════════════════════════════════════════════════════════════════════

  GENERIC_EXTRA_DECK: {
    label: "Generic Card – Extra Deck",
    winsOrLossesRequired: 120,
    teamCondition: 120,
    teamConditionType: "winsOrLosses",
    description:
      "Main Deck: ≤ 15 Monster cùng Tộc. Match: ≥ 2 Extra Deck khác nhau. Team: 120/180 trận (thắng hoặc thua).",
    rewardCards: [
      "Apollousa, Bow of the Goddess",
      "Chaos Ruler, the Chaotic Magical Dragon",
      "Beatrice, Lady of the Eternal",
      "Evilswarm Exciton Knight",
      "Crystron Halqifibrax",
      "Predaplant Verte Anaconda",
      "Number 41: Bagooska the Terribly Tired Tapir",
      "Herald of the Arc Light",
      "Union Carrier",
    ],
    checks: [
      ({ mainDeck }) => {
        const monsters = mainDeck.filter((c) => c.isMonster);
        const byRace = {};
        monsters.forEach((m) => {
          if (m.race) {
            byRace[m.race] = (byRace[m.race] || 0) + 1;
          }
        });
        const maxSameRace = Math.max(0, ...Object.values(byRace));
        const pass = maxSameRace <= 15;
        return {
          pass,
          message: pass
            ? `✓ Max same-race monsters: ${maxSameRace} (≤ 15)`
            : `✗ Quá nhiều monster cùng Tộc: ${maxSameRace} > 15.`,
          detail: `Max same race: ${maxSameRace}`,
        };
      },
    ],
  },

  GENERIC_HANDTRAP: {
    label: "Generic Card – Handtrap",
    winsOrLossesRequired: 60,
    teamCondition: 60,
    teamConditionType: "winsOrLosses",
    description:
      "Main Deck: ≥ 5 Handtrap. Match: Dùng handtrap ≥ 3 lần. Team: 60/180 trận (thắng hoặc thua).",
    rewardCards: [
      "Apollousa, Bow of the Goddess (+1 copy)",
      "Dimension Shifter (+1 copy)",
      "Droll & Lock Bird (+1 copy)",
      "Ash Blossom & Joyous Spring (+1 copy)",
      'Maxx "C" (+1 copy)',
      "PSY-Framegear Gamma (+1 copy)",
      "Artifact Scythe (+1 copy)",
    ],
    checks: [
      ({ mainDeck }) => {
        const handTraps = mainDeck.filter(
          (c) =>
            c.isMonster &&
            c.desc?.toLowerCase().includes("hand") &&
            (c.desc?.toLowerCase().includes("activate") ||
              c.desc?.toLowerCase().includes("discard") ||
              c.desc?.toLowerCase().includes("negate")),
        );
        const count = handTraps.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Handtrap: ${count}`
              : `✗ Handtrap không đủ: ${count}/${required}.`,
          detail: `Handtrap: ${count}`,
        };
      },
    ],
  },

  GENERIC_SPELL_CARD: {
    label: "Generic Card – Spell Card",
    winsOrLossesRequired: 80,
    teamCondition: 80,
    teamConditionType: "winsOrLosses",
    description:
      "Main Deck: ≥ 10 Spell. Match: Dùng ≥ 5 Spell trong 1 lượt. Team: 80/180 trận (thắng hoặc thua).",
    rewardCards: [
      "Called by the Grave (+1 copy)",
      "Crossout Designator (+1 copy)",
      "Foolish Burial (+1 copy)",
      "Gold Sarcophagus (+1 copy)",
      "Harpie's Feather Duster (+1 copy)",
      "Heavy Storm (+1 copy)",
      "Monster Reborn (+1 copy)",
      "Reinforcement of the Army (+1 copy)",
      "Terraforming (+1 copy)",
      "Pot of Prosperity (+1 copy)",
    ],
    checks: [
      ({ mainDeck }) => {
        const spells = mainDeck.filter((c) => c.isSpell);
        const count = spells.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Spell Card: ${count}`
              : `✗ Spell Card không đủ: ${count}/${required}.`,
          detail: `Spell: ${count}`,
        };
      },
    ],
  },

  GENERIC_TRAP_CARD: {
    label: "Generic Card – Trap Card",
    winsOrLossesRequired: 100,
    teamCondition: 100,
    teamConditionType: "winsOrLosses",
    description:
      "Main Deck: ≥ 10 Trap. Match: Dùng ≥ 3 Trap trong 1 lượt. Team: 100/180 trận (thắng hoặc thua).",
    rewardCards: [
      "Anti-Spell Fragrance (+1 copy)",
      "Dimensional Barrier (+1 copy)",
      "Gozen Match (+1 copy)",
      "Harpie's Feather Storm (+1 copy)",
      "Red Reboot (+1 copy)",
      "Rivalry of Warlords (+1 copy)",
      "Skill Drain (+1 copy)",
      "There Can Be Only One (+1 copy)",
    ],
    checks: [
      ({ mainDeck }) => {
        const traps = mainDeck.filter((c) => c.isTrap);
        const count = traps.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Card: ${count}`
              : `✗ Trap Card không đủ: ${count}/${required}.`,
          detail: `Trap: ${count}`,
        };
      },
    ],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // NEW ARCHETYPES — ADDED IN UPDATE
  // ═════════════════════════════════════════════════════════════════════════

  ADAMANCIPATOR: {
    label: "Adamancipator",
    winsRequired: 30,
    teamCondition: 30,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 15 Rock Monster. Extra Deck: ≥ 4 Synchro Monster. Team: ≥ 30/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const rocks = mainDeck.filter((c) => c.isMonster && c.race === "Rock");
        const count = rocks.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Rock Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Rock Monster không đủ: ${count}/${required} lá.`,
          detail: `Rock: ${count}`,
        };
      },
      ({ extraDeck }) => {
        const synchos = extraDeck.filter((c) => c.isSynchro);
        const count = synchos.length;
        const required = 4;
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

  ATLANTEAN: {
    label: "Atlantean",
    winsRequired: 20,
    teamCondition: 20,
    teamConditionType: "wins",
    description:
      "Main Deck: ≥ 15 WATER Monster (trong đó ≥ 5 Sea Serpent). Team: ≥ 20/180 wins.",
    checks: [
      ({ mainDeck }) => {
        const water = mainDeck.filter(
          (c) => c.isMonster && c.attribute === "WATER",
        );
        const count = water.length;
        const required = 15;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ WATER Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ WATER Monster không đủ: ${count}/${required} lá.`,
          detail: `WATER: ${count}`,
        };
      },
      ({ mainDeck }) => {
        const seaSerpent = mainDeck.filter(
          (c) => c.isMonster && c.race === "Sea Serpent",
        );
        const count = seaSerpent.length;
        const required = 5;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Sea Serpent Monster: ${count} (yêu cầu ≥ ${required})`
              : `✗ Sea Serpent Monster không đủ: ${count}/${required} lá.`,
          detail: `Sea Serpent: ${count}`,
        };
      },
    ],
  },

  ANUBIS_SET: {
    label: "Anubis Set",
    winsOrLossesRequired: 35,
    teamCondition: 35,
    teamConditionType: "winsOrLosses",
    description:
      "Main Deck: ≥ 10 Continuous Trap VÀ có Trap Monster / Trap tự triệu hồi thành Monster. Team: ≥ 35/180 trận (thắng hoặc thua). Nếu chưa mở khóa, các lá Anubis the Last Judge / The Man with the Mark / Temple of the Kings / Treasures of the Kings bị coi là Banned.",
    checks: [
      ({ mainDeck }) => {
        const continuousTraps = mainDeck.filter(
          (c) => c.isTrap && c.cardType?.includes("Continuous"),
        );
        const count = continuousTraps.length;
        const required = 10;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Continuous Trap: ${count} (yêu cầu ≥ ${required})`
              : `✗ Continuous Trap không đủ: ${count}/${required} lá.`,
          detail: `Continuous Trap: ${count}`,
        };
      },
      ({ mainDeck }) => {
        // Detect Trap Monsters or Traps that can special summon themselves as monsters
        // These are typically identified by frameType "trap_monster" or descriptions mentioning special summon from trap zone
        const trapMonsters = mainDeck.filter(
          (c) =>
            c.frameType?.toLowerCase().includes("trap") ||
            (c.isTrap &&
              (c.desc?.toLowerCase().includes("special summon") ||
                c.desc?.toLowerCase().includes("monster zone") ||
                c.desc?.toLowerCase().includes("trap zone"))),
        );
        const count = trapMonsters.length;
        const required = 1;
        return {
          pass: count >= required,
          message:
            count >= required
              ? `✓ Trap Monster / Trap có thể triệu hồi Monster: ${count}`
              : `✗ Cần ít nhất 1 Trap Monster hoặc Trap có khả năng triệu hồi Monster.`,
          detail: `Trap Monster: ${count}`,
        };
      },
    ],
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
    wins25: [],
    wins30: [],
    wins40: [],
    wins50: [],
    losses10: [],
    losses20: [],
    losses25: [],
    losses30: [],
    losses40: [],
    losses50: [],
    losses60: [],
    both: [],
    winsOrLosses: [],
  };

  Object.entries(ARCHETYPE_RULES).forEach(([key, archetype]) => {
    const type = archetype.teamConditionType || "wins";
    if (type === "both") {
      grouped.both.push({ key, ...archetype });
    } else if (type === "winsOrLosses") {
      grouped.winsOrLosses.push({ key, ...archetype });
    } else if (type === "wins" && archetype.winsRequired) {
      const group = `wins${archetype.winsRequired}`;
      if (grouped[group]) grouped[group].push({ key, ...archetype });
    } else if (type === "losses" && archetype.lossesRequired) {
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

  const requiresWins = (archetype.winsRequired || 0) > 0;
  const requiresLosses = (archetype.lossesRequired || 0) > 0;
  const requiresWinsOrLosses = (archetype.winsOrLossesRequired || 0) > 0;

  let winsAdjustment = 0;
  let lossesAdjustment = 0;

  if (archetype.respectCondition) {
    const result = archetype.respectCondition(teamMembers);
    if (typeof result === "number") {
      if (requiresWins) winsAdjustment = archetype.winsRequired - result;
      if (requiresLosses) lossesAdjustment = archetype.lossesRequired - result;
    } else if (result === true) {
      winsAdjustment = archetype.winsRequired || 0;
      lossesAdjustment = archetype.lossesRequired || 0;
    }
  }

  const adjustedWinsRequired = (archetype.winsRequired || 0) - winsAdjustment;
  const adjustedLossesRequired =
    (archetype.lossesRequired || 0) - lossesAdjustment;
  const adjustedWinsOrLossesRequired = archetype.winsOrLossesRequired || 0;

  const winsPasses = !requiresWins || teamWins >= adjustedWinsRequired;
  const lossesPasses = !requiresLosses || teamLosses >= adjustedLossesRequired;
  const winsOrLossesPasses =
    !requiresWinsOrLosses ||
    teamWins + teamLosses >= adjustedWinsOrLossesRequired;

  const teamPasses = winsPasses && lossesPasses && winsOrLossesPasses;
  const isEligible = deckPasses && teamPasses;

  return {
    archetypeLabel: archetype.label,
    deckConditionMet: deckPasses,
    teamConditionMet: teamPasses,
    winsConditionMet: winsPasses,
    lossesConditionMet: lossesPasses,
    winsOrLossesConditionMet: winsOrLossesPasses,
    eligible: isEligible,
    checks: checkResults,
    winsRequired: adjustedWinsRequired,
    lossesRequired: adjustedLossesRequired,
    winsOrLossesRequired: adjustedWinsOrLossesRequired,
    winsAdjustment,
    lossesAdjustment,
    respectBonusApplied: winsAdjustment > 0 || lossesAdjustment > 0,
    teamConditionType: archetype.teamConditionType || "wins",
    rewardCards: archetype.rewardCards || null,
  };
}

/**
 * Calculate archetype unlock bonuses based on selected archetypes
 */
export function calculateArchetypeBonus(selectedArchetypes = []) {
  const bonusMap = {};

  selectedArchetypes.forEach((arch) => {
    bonusMap[arch] = { scalingBonus: 0, specialBonus: 0, total: 0 };
  });

  const scalingBonusPerArchetype =
    Math.max(0, selectedArchetypes.length - 10) * 5;

  const archeotypesWithScaling = Math.max(0, selectedArchetypes.length - 10);
  for (
    let i = 0;
    i < archeotypesWithScaling && i < selectedArchetypes.length;
    i++
  ) {
    const idx = 10 + i;
    if (idx < selectedArchetypes.length) {
      bonusMap[selectedArchetypes[idx]].scalingBonus = 5;
    }
  }

  const specialTriad = ["SCARECLAW", "MANNADIUM_LOSS", "KASHTIRA"];
  const selectedInTriad = specialTriad.filter((arch) =>
    selectedArchetypes.includes(arch),
  );

  if (selectedInTriad.length === 1) {
    const selectedOne = selectedInTriad[0];
    specialTriad.forEach((arch) => {
      if (arch !== selectedOne && bonusMap[arch]) {
        bonusMap[arch].specialBonus = 5;
      }
    });
  } else if (selectedInTriad.length === 2) {
    const unselected = specialTriad.find(
      (arch) => !selectedInTriad.includes(arch),
    );
    if (bonusMap[unselected]) {
      bonusMap[unselected].specialBonus = 10;
    }
  }

  Object.keys(bonusMap).forEach((arch) => {
    bonusMap[arch].total =
      bonusMap[arch].scalingBonus + bonusMap[arch].specialBonus;
  });

  return bonusMap;
}

/**
 * Main validation function - validates a single archetype against deck composition
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
      winsOrLossesConditionMet: false,
      winsRequired: 0,
      lossesRequired: 0,
      winsOrLossesRequired: 0,
    };
  }

  const allCards = { mainDeck, extraDeck, sideDeck };
  const checkResults = archetype.checks.map((check) => check(allCards));
  const deckConditionMet = checkResults.every((r) => r.pass);

  const requiresWins = (archetype.winsRequired || 0) > 0;
  const requiresLosses = (archetype.lossesRequired || 0) > 0;
  const requiresWinsOrLosses = (archetype.winsOrLossesRequired || 0) > 0;

  let winsAdjustment = 0;
  let lossesAdjustment = 0;

  if (archetype.respectCondition) {
    const result = archetype.respectCondition(teamMembers);
    if (typeof result === "number") {
      if (requiresWins) winsAdjustment = archetype.winsRequired - result;
      if (requiresLosses) lossesAdjustment = archetype.lossesRequired - result;
    } else if (result === true) {
      winsAdjustment = archetype.winsRequired || 0;
      lossesAdjustment = archetype.lossesRequired || 0;
    }
  }

  const adjustedWinsRequired = (archetype.winsRequired || 0) - winsAdjustment;
  const adjustedLossesRequired =
    (archetype.lossesRequired || 0) - lossesAdjustment;
  const adjustedWinsOrLossesRequired = archetype.winsOrLossesRequired || 0;

  const winsConditionMet = !requiresWins || teamWins >= adjustedWinsRequired;
  const lossesConditionMet =
    !requiresLosses || teamLosses >= adjustedLossesRequired;
  const winsOrLossesConditionMet =
    !requiresWinsOrLosses ||
    teamWins + teamLosses >= adjustedWinsOrLossesRequired;

  const teamConditionMet =
    winsConditionMet && lossesConditionMet && winsOrLossesConditionMet;
  const overallPass = deckConditionMet && teamConditionMet;

  return {
    overallPass,
    archetypeLabel: archetype.label,
    deckConditionMet,
    teamConditionMet,
    winsConditionMet,
    lossesConditionMet,
    winsOrLossesConditionMet,
    winsRequired: adjustedWinsRequired,
    lossesRequired: adjustedLossesRequired,
    winsOrLossesRequired: adjustedWinsOrLossesRequired,
    winsAdjustment,
    lossesAdjustment,
    respectBonusApplied: winsAdjustment > 0 || lossesAdjustment > 0,
    teamConditionType: archetype.teamConditionType || "wins",
    rewardCards: archetype.rewardCards || null,
    checks: checkResults,
  };
}
