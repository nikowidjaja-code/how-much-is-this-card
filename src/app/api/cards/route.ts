"use client";

import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sortBy = searchParams.get("sortBy") || "updatedAt";
  const order = (searchParams.get("order") as "asc" | "desc") || "desc";

  const validFields = ["name", "value", "updatedAt"];
  const validOrders = ["asc", "desc"];

  const field = validFields.includes(sortBy) ? sortBy : "updatedAt";
  const sortOrder = validOrders.includes(order) ? order : "desc";

  const cards = await prisma.card.findMany({
    orderBy: {
      [field]: sortOrder,
    },
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const { name, value } = await req.json();
  const card = await prisma.card.create({ data: { name, value } });
  return NextResponse.json(card, { status: 201 });
}
