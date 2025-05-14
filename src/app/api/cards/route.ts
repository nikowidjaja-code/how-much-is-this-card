import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust the path as needed

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const validFields = ["name", "value", "updatedAt"] as const;
    const validOrders = ["asc", "desc"] as const;

    const field = validFields.includes(sortBy as any) ? (sortBy as typeof validFields[number]) : "updatedAt";
    const sortOrder = validOrders.includes(order) ? order : "desc";

    const cards = await prisma.card.findMany({
      orderBy: {
        [field]: sortOrder,
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("GET /api/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST handler
export async function POST(req: NextRequest) {
  try {
    const { name, value } = await req.json();
    if (!name || typeof name !== "string" || !value || typeof value !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: { name, value },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
