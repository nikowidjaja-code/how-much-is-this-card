import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's votes with card details
    const votes = await prisma.vote.findMany({
      where: {
        userId: params.id,
      },
      select: {
        id: true,
        cardId: true,
        value: true,
        createdAt: true,
        card: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the response
    return NextResponse.json(
      votes.map((vote) => ({
        id: vote.id,
        cardId: vote.cardId,
        cardName: vote.card.name,
        value: vote.value,
        createdAt: vote.createdAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/user/[id]/votes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
