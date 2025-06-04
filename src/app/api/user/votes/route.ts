import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const votes = await prisma.vote.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        card: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to last 50 votes
    });

    const formattedVotes = votes.map((vote) => ({
      id: vote.id,
      cardId: vote.cardId,
      cardName: vote.card.name,
      value: vote.value,
      createdAt: vote.createdAt,
    }));

    return NextResponse.json(formattedVotes);
  } catch (error) {
    console.error("GET /api/user/votes error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
