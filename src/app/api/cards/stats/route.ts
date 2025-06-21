import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get all cards with their values
    const cards = await prisma.card.findMany({
      select: {
        value: true,
      },
    });

    // Calculate statistics
    const totalCards = cards.length;
    const unvaluedCards = cards.filter((card) => card.value === -1).length;
    const lowValueCards = cards.filter((card) => card.value === 0.25).length;
    const midValueCards = cards.filter((card) => card.value === 0.5).length;
    const highValueCards = cards.filter((card) => card.value === 0.75).length;
    const oneMMPlusCards = cards.filter((card) => card.value === 1).length;

    return NextResponse.json({
      totalCards,
      unvaluedCards,
      lowValueCards,
      midValueCards,
      highValueCards,
      oneMMPlusCards,
    });
  } catch (error) {
    console.error("GET /api/cards/stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
