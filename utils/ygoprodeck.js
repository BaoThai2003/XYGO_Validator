/**
 * utils/ygoprodeck.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Caching layer cho YGOPRODeck API.
 *
 * Chiến lược:
 *  - Lần đầu tiên được gọi → fetch toàn bộ cardinfo từ YGOPRODeck một lần.
 *  - Kết quả được lưu trong module-level Map (tồn tại suốt vòng đời server).
 *  - Các lần gọi tiếp theo → trả về từ cache ngay lập tức (0 network request).
 *  - TTL mặc định 24h; sau đó cache tự hết hạn và fetch lại lần tiếp theo.
 *
 * ⚠️  Next.js App Router chạy Edge/Node per-instance, nên cache này hoạt
 *     tốt trong development & single-process production. Nếu deploy multi-
 *     instance thì nâng cấp lên Redis/KV store.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const YGOPRODECK_API = "https://db.ygoprodeck.com/api/v7/cardinfo.php?misc=yes";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 giờ

/** @type {{ map: Map<number, CardData> | null, fetchedAt: number }} */
let cardCache = {
  map: null,
  fetchedAt: 0,
};

/**
 * Fetch toàn bộ card database từ YGOPRODeck và trả về Map<passcode, card>.
 * Nếu cache còn hạn → trả về ngay, không fetch lại.
 *
 * @returns {Promise<Map<number, CardData>>}
 */
export async function getCardDatabase() {
  const now = Date.now();
  const isExpired = now - cardCache.fetchedAt > CACHE_TTL_MS;

  if (cardCache.map && !isExpired) {
    console.log("[CardDB] Cache HIT — skipping API fetch.");
    return cardCache.map;
  }

  console.log("[CardDB] Cache MISS — fetching from YGOPRODeck...");

  const res = await fetch(YGOPRODECK_API, {
    // next.js cache tag để revalidate thủ công nếu cần
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(
      `YGOPRODeck API trả về lỗi: ${res.status} ${res.statusText}`,
    );
  }

  const json = await res.json();

  if (!json?.data || !Array.isArray(json.data)) {
    throw new Error("Định dạng response từ YGOPRODeck không hợp lệ.");
  }

  /** @type {Map<number, CardData>} */
  const map = new Map();

  for (const card of json.data) {
    // Passcode chính
    map.set(card.id, normalizeCard(card));

    // Alias passcode (e.g., alternate artwork)
    if (card.card_sets) {
      // YGOPRODeck đôi khi có alias ids trong misc_info
    }
    const miscInfo = card.misc_info?.[0];
    if (miscInfo?.beta_id && miscInfo.beta_id !== card.id) {
      map.set(miscInfo.beta_id, normalizeCard(card));
    }
  }

  cardCache = { map, fetchedAt: now };
  console.log(`[CardDB] Đã cache ${map.size} card.`);

  return map;
}

/**
 * Tra cứu một card theo passcode.
 * @param {number} passcode
 * @returns {Promise<CardData | null>}
 */
export async function lookupCard(passcode) {
  const db = await getCardDatabase();
  return db.get(passcode) ?? null;
}

/**
 * Normalize raw YGOPRODeck card object thành shape gọn hơn.
 * Chỉ giữ lại các trường cần thiết cho Rules Engine.
 *
 * @param {object} raw
 * @returns {CardData}
 */
function normalizeCard(raw) {
  const type = raw.type ?? "";
  const frameType = raw.frameType ?? "";
  const desc = raw.desc ?? "";

  // Parse cardType (subtype) từ card type string
  // E.g., "Equip Spell Card" -> ["Equip"]
  //       "Quick-Play Spell Card" -> ["Quick-Play"]
  //       "Continuous Trap Card" -> ["Continuous"]
  const parseCardType = (typeStr) => {
    const types = [];
    const typeL = typeStr.toLowerCase();

    // Spell Card subtypes
    if (typeL.includes("spell")) {
      if (typeL.includes("equip")) types.push("Equip");
      if (typeL.includes("field")) types.push("Field");
      if (typeL.includes("quick-play")) types.push("Quick-Play");
      if (typeL.includes("ritual")) types.push("Ritual");
      if (typeL.includes("normal") && !types.length) types.push("Normal");
    }

    // Trap Card subtypes
    if (typeL.includes("trap")) {
      if (typeL.includes("continuous")) types.push("Continuous");
      if (typeL.includes("counter")) types.push("Counter");
      if (typeL.includes("normal") && !types.length) types.push("Normal");
    }

    return types.length > 0 ? types : [];
  };

  // Detect if card is a Tuner from description text
  const isTuner =
    (raw.type ?? "").toLowerCase().includes("tuner") ||
    (desc.toLowerCase().includes("tuner") &&
      (desc.toLowerCase().includes("synchro") ||
        desc.toLowerCase().includes("synchron")));

  const cardTypeArray = parseCardType(type);

  return {
    id: raw.id,
    name: raw.name,
    type: type, // "Effect Monster", "Spell Card", "Trap Card", etc.
    frameType: frameType, // "effect", "xyz", "pendulum", "spell", "trap"...
    cardType: cardTypeArray, // ["Equip"], ["Quick-Play"], ["Continuous"], etc.
    desc: desc,
    race: raw.race ?? "", // Monster Type: "Warrior", "Spellcaster", "Thunder"...
    attribute: raw.attribute ?? "", // "DARK", "LIGHT", "FIRE", "WATER", "EARTH", "WIND", "DIVINE"
    level: raw.level ?? raw.rank ?? raw.linkval ?? 0,
    atk: raw.atk ?? 0,
    def: raw.def ?? 0,
    scale: raw.scale ?? null, // Pendulum scale
    linkval: raw.linkval ?? null,
    archetype: raw.archetype ?? "",
    // Derived helpers (tính sẵn để Rules Engine dùng nhanh)
    isMonster: type.toLowerCase().includes("monster"),
    isSpell: type.toLowerCase().includes("spell"),
    isTrap: type.toLowerCase().includes("trap"),
    isXyz: frameType.toLowerCase().includes("xyz"),
    isSynchro: frameType.toLowerCase().includes("synchro"),
    isFusion: frameType.toLowerCase().includes("fusion"),
    isLink: frameType.toLowerCase().includes("link"),
    isPendulum: frameType.toLowerCase().includes("pendulum"),
    isRitual: frameType.toLowerCase() === "ritual",
    isTuner: isTuner,
    isExtraDeck: ["xyz", "synchro", "fusion", "link"].some((t) =>
      frameType.toLowerCase().includes(t),
    ),
  };
}

/**
 * @typedef {Object} CardData
 * @property {number}  id
 * @property {string}  name
 * @property {string}  type
 * @property {string}  frameType
 * @property {string[]} cardType - Subtype array ["Equip", "Quick-Play", "Continuous", etc.]
 * @property {string}  desc
 * @property {string}  race
 * @property {string}  attribute
 * @property {number}  level
 * @property {number}  atk
 * @property {number}  def
 * @property {number|null} scale
 * @property {number|null} linkval
 * @property {string}  archetype
 * @property {boolean} isMonster
 * @property {boolean} isSpell
 * @property {boolean} isTrap
 * @property {boolean} isXyz
 * @property {boolean} isSynchro
 * @property {boolean} isFusion
 * @property {boolean} isLink
 * @property {boolean} isPendulum
 * @property {boolean} isRitual
 * @property {boolean} isTuner
 * @property {boolean} isExtraDeck
 */
