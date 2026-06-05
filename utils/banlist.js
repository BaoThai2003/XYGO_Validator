/**
 * utils/banlist.js
 * ─────────────────────────────────────────────────────────────────────────────
 * OCG Banlist 4/2026 — Forbidden, Limited, and Semi-Limited cards
 * Used for deck validation to ensure compliance with tournament regulations
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Map of card ID to ban status
// 0 = Forbidden (0 copies allowed)
// 1 = Limited (1 copy allowed)
// 2 = Semi-Limited (2 copies allowed)
// Unlisted cards are unlimited (3 copies allowed)

export const OCG_BANLIST_4_2026 = {
  // ─────── FORBIDDEN (0 copies) ────────
  70095154: 0, // "Fibass the Prophetic Firefist"
  26954872: 0, // "Spellbook of Judgment"
  99390841: 0, // "Swordsoul Strategist Longyuan"
  30241314: 0, // "Rhongo Rahka"
  74131780: 0, // "Master Peace, the True Dracoslayer"
  38769237: 0, // "Denglong, First of the Yang Zing"
  93830852: 0, // "Astrograph Sorcerer"
  23434538: 0, // "Fiber Jar"
  94163079: 0, // "Tribe-Infecting Virus"
  96782186: 0, // "Change of Heart"
  1784686: 0, // "Graceful Charity"
  34124316: 0, // "Pot of Greed"
  55144522: 0, // "Harpie's Feather Duster"
  35316708: 0, // "Last Will"
  42703248: 0, // "Painful Choice"
  4031928: 0, // "Sixth Sense"
  27174286: 0, // "Gate Guardian"
  95308449: 0, // "Imperial Order"
  77505596: 0, // "Return from the Different Dimension"
  40844835: 0, // "Butterfly Dagger - Elma"
  31553716: 0, // "Premature Burial"
  1898854: 0, // "Vanity's Fiend"

  // ─────── LIMITED (1 copy) ──────
  7902349: 1, // "Ash Blossom & Joyous Spring"
  5620309: 1, // "Bride of the Aqamacutus"
  74622321: 1, // "Double Iris Magician"
  73864247: 1, // "Dimensional Barrier"
  85602018: 1, // "Unending Nightmare"
  50720316: 1, // "El Shaddoll Fusion"
  30330861: 1, // "Shaddoll Fusion"
  89399912: 1, // "Nekroz of Brionac"
  15341821: 1, // "Trishula, Dragon of the Ice Barrier"
  35316708: 1, // "Last Will"
  69207766: 1, // "Exciton Knight"
  60682203: 1, // "Evilswarm Exciton Knight"
  88120522: 1, // "Swordsoul Grand Duke - Chixiao"
  85464265: 1, // "Tearlaments Scheiren"
  5816033: 1, // "Muddy Mudragon"
  9411399: 1, // "Odd-Eyes Pendulum Dragon"
  40640057: 1, // "Electrumite"
  68854861: 1, // "Heavymetalfoes Electrumite"
  74701381: 1, // "Unchained Soul of Anguish"
  99031739: 1, // "Branded Beast"
  41122814: 1, // "Teralaments Kitkallos"
  78080961: 1, // "Tearlaments Rulkallos"

  // ─────── SEMI-LIMITED (2 copies) ──────
  89631139: 2, // "Ghost Ogre & Snow Rabbit"
  32807846: 2, // "Maxx 'C'"
  85602018: 2, // "Unending Nightmare"
  19474360: 2, // "Xyz Import"
  49064013: 2, // "Compulsory Evacuation Device"
  52440842: 2, // "Raigeki"
  29401950: 2, // "Monster Reborn"
  23557835: 2, // "Snatch Steal"
  73628505: 2, // "Pot of Desires"
  85602018: 2, // "Unending Nightmare"
  30914564: 2, // "Swordsoul Strategist Longyuan"
  94820157: 2, // "Scarlight Red Dragon Archfiend"
  90390305: 2, // "Hot Red Dragon Archfiend Abyss"
  99331453: 2, // "Number 11: Big Eye"
  99177923: 2, // "Number 16: Shock Master"
  8261330: 2, // "Number 27: Dracossack"
  20758643: 2, // "Lightning Chidori"
  41122814: 2, // "Grampulse"
};

/**
 * Check if a card is legal in OCG format
 * @param {number} cardId - Card ID
 * @param {number} copies - Number of copies in deck
 * @returns {object} { isLegal, status, maxCopies }
 */
export function isCardLegal(cardId, copies = 1) {
  const banStatus = OCG_BANLIST_4_2026[cardId];

  if (banStatus === undefined) {
    // Unlimited
    return {
      isLegal: copies <= 3,
      status: "Unlimited",
      maxCopies: 3,
      copies: copies,
      violation: copies > 3 ? `Has ${copies} copies (max 3)` : null,
    };
  } else if (banStatus === 0) {
    // Forbidden
    return {
      isLegal: false,
      status: "Forbidden",
      maxCopies: 0,
      copies: copies,
      violation: `Forbidden card (${copies} copies found)`,
    };
  } else if (banStatus === 1) {
    // Limited
    return {
      isLegal: copies <= 1,
      status: "Limited",
      maxCopies: 1,
      copies: copies,
      violation: copies > 1 ? `Has ${copies} copies (max 1)` : null,
    };
  } else if (banStatus === 2) {
    // Semi-Limited
    return {
      isLegal: copies <= 2,
      status: "Semi-Limited",
      maxCopies: 2,
      copies: copies,
      violation: copies > 2 ? `Has ${copies} copies (max 2)` : null,
    };
  }

  return { isLegal: true, status: "Unknown", maxCopies: 3, copies: copies };
}

/**
 * Validate entire deck against banlist
 * @param {array} mainDeck - Main Deck cards
 * @param {array} extraDeck - Extra Deck cards
 * @param {array} sideDeck - Side Deck cards
 * @returns {object} Validation results
 */
export function validateDeckBanlist(
  mainDeck = [],
  extraDeck = [],
  sideDeck = [],
) {
  const allCards = [...mainDeck, ...extraDeck, ...sideDeck];
  const violations = [];
  const cardCounts = {};

  // Count card occurrences
  allCards.forEach((card) => {
    if (card && card.id) {
      cardCounts[card.id] = (cardCounts[card.id] || 0) + 1;
    }
  });

  // Check each card against banlist
  Object.entries(cardCounts).forEach(([cardId, count]) => {
    const card = allCards.find((c) => c && c.id === parseInt(cardId));
    if (!card) return;

    const check = isCardLegal(parseInt(cardId), count);
    if (!check.isLegal) {
      violations.push({
        cardId: parseInt(cardId),
        cardName: card.name || "Unknown Card",
        copies: count,
        maxCopies: check.maxCopies,
        status: check.status,
        violation: check.violation,
      });
    }
  });

  return {
    isValid: violations.length === 0,
    violations: violations,
    totalViolations: violations.length,
    banlistVersion: "OCG 4/2026",
  };
}

/**
 * Get banlist statistics
 * @returns {object} Statistics about the banlist
 */
export function getBanlistStats() {
  const forbidden = Object.values(OCG_BANLIST_4_2026).filter(
    (s) => s === 0,
  ).length;
  const limited = Object.values(OCG_BANLIST_4_2026).filter(
    (s) => s === 1,
  ).length;
  const semiLimited = Object.values(OCG_BANLIST_4_2026).filter(
    (s) => s === 2,
  ).length;

  return {
    forbidden,
    limited,
    semiLimited,
    total: forbidden + limited + semiLimited,
    version: "OCG 4/2026",
  };
}
