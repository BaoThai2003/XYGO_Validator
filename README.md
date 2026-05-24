# Yu-Gi-Oh! Tournament Deck Validator

Ứng dụng giúp ban tổ chức giải đấu tự động kiểm tra Deck Condition cho từng Archetype.

---

## Cài đặt nhanh

```bash
# 1. Tạo project Next.js mới
npx create-next-app@latest yugioh-validator --app --js --tailwind --no-src-dir --import-alias "@/*"
cd yugioh-validator

# 2. Copy các file trong repo này vào đúng vị trí (xem cấu trúc bên dưới)

# 3. Chạy dev server
npm run dev
```

Mở trình duyệt tại `http://localhost:3000`.

---

## Cấu trúc File

```
yugioh-validator/
├── app/
│   ├── globals.css            ← Tailwind + custom font/scrollbar
│   ├── layout.jsx             ← Root layout
│   ├── page.jsx               ← UI chính
│   └── api/
│       ├── validate/
│       │   └── route.js       ← POST /api/validate (parse + validate)
│       └── cards/
│           └── route.js       ← GET /api/cards (warm-up cache)
├── utils/
│   ├── ygoprodeck.js          ← Fetch & cache Card Database
│   └── rulesEngine.js         ← Rules Engine + Archetype definitions
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## Cách thêm Archetype mới

Mở file `utils/rulesEngine.js` và thêm vào object `ARCHETYPE_RULES`:

```js
MY_ARCHETYPE: {
  label: "Tên Hiển Thị",
  description: "Mô tả điều kiện ngắn.",
  checks: [
    // Dùng helper minCountCheck cho rule đơn giản:
    minCountCheck("FIRE Monster", (c) => c.isMonster && c.attribute === "FIRE", 8, "mainDeck"),

    // Hoặc viết custom function:
    ({ mainDeck, extraDeck }) => {
      const count = mainDeck.filter(c => c.level === 8 && c.isMonster).length;
      return {
        pass: count >= 6,
        message: count >= 6
          ? `✓ Level 8 Monster: ${count}`
          : `✗ Chỉ có ${count}/6 Monster Level 8.`,
        detail: `Level 8: ${count} lá`,
      };
    },
  ],
},
```

---

## CardData Schema (dùng trong checks)

| Field         | Type    | Ví dụ                                |
| ------------- | ------- | ------------------------------------ |
| `id`          | number  | `46986414`                           |
| `name`        | string  | `"Blue-Eyes White Dragon"`           |
| `type`        | string  | `"Normal Monster"`, `"Spell Card"`   |
| `frameType`   | string  | `"normal"`, `"xyz"`, `"pendulum"`    |
| `race`        | string  | `"Dragon"`, `"Thunder"`, `"Warrior"` |
| `attribute`   | string  | `"LIGHT"`, `"DARK"`, `"FIRE"`        |
| `level`       | number  | `8` (hoặc Rank/Link Rating)          |
| `isMonster`   | boolean | `true`/`false`                       |
| `isSpell`     | boolean | `true`/`false`                       |
| `isTrap`      | boolean | `true`/`false`                       |
| `isXyz`       | boolean | `true`/`false`                       |
| `isSynchro`   | boolean | `true`/`false`                       |
| `isFusion`    | boolean | `true`/`false`                       |
| `isLink`      | boolean | `true`/`false`                       |
| `isPendulum`  | boolean | `true`/`false`                       |
| `isExtraDeck` | boolean | `true`/`false`                       |
| `archetype`   | string  | `"Blue-Eyes"`, `"HERO"`              |
| `scale`       | number? | Pendulum Scale                       |

---

## Định dạng Deck được hỗ trợ

### YDKE String

```
ydke://base64main!base64extra!base64side!
```

Copy từ YGOPro Percy, EDOPro, hoặc ygoprodeck.com deck builder.

### YDK Text File

```
#main
46986414
89631139
#extra
38517737
!side
44519536
```

---

## Lưu ý về Card Database Cache

- Lần đầu chạy, app sẽ fetch ~13.000 card từ YGOPRODeck (~5-10 giây tùy mạng).
- Sau đó cache trong memory server 24 giờ — hoàn toàn không gọi API lại.
- Deploy trên serverless (Vercel) → mỗi cold start sẽ fetch lại. Nâng cấp lên Upstash Redis nếu cần persistent cache.

---

## Tech Stack

- **Next.js 14** (App Router) — Full-stack framework
- **Tailwind CSS** — Styling
- **YGOPRODeck API** — Card database (miễn phí, không cần API key)
- **YDKE parsing** — Tự implement (không phụ thuộc package ngoài)
