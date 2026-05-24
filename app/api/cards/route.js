/**
 * app/api/cards/route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * GET /api/cards — Trả về trạng thái cache Card Database.
 * Gọi endpoint này để khởi động cache trước (warm-up).
 * Ngoài ra có thể dùng để kiểm tra số card đã cache.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { getCardDatabase } from "@/utils/ygoprodeck";

export async function GET() {
  try {
    const db = await getCardDatabase();
    return NextResponse.json({
      status: "ok",
      cachedCards: db.size,
      message: `Card Database đã sẵn sàng với ${db.size} card.`,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message,
        message: "Không thể tải Card Database từ YGOPRODeck.",
      },
      { status: 503 },
    );
  }
}
