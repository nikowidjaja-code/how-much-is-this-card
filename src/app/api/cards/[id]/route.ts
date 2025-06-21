import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET handler for single card
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const card = await prisma.card.findUnique({
      where: { id: params.id },
      include: {
        votes: {
          include: {
            user: {
              select: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Calculate mostVotedValues for the card
    const weightedVotes = card.votes.map((vote) => {
      // 1. Role-Based Weight
      const roleWeight = vote.user.role === "ADMIN" ? 5 : 1;

      // 2. Time-Based Decay
      const daysSinceVote = Math.floor(
        (Date.now() - new Date(vote.updatedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      let timeWeight = 1;
      if (daysSinceVote > 365) {
        timeWeight = 0; // Votes older than a year have no weight
      } else if (daysSinceVote <= 7) {
        timeWeight = 1 - daysSinceVote / 14; // 7 days = 0.5
      } else if (daysSinceVote <= 14) {
        timeWeight = 0.5 - (daysSinceVote - 7) / 28; // 14 days = 0.25
      } else if (daysSinceVote <= 30) {
        timeWeight = 0.25 - (daysSinceVote - 14) / 160; // 30 days = ~0.1
      } else {
        timeWeight = 0.1;
      }

      // Clamp minimum weight (only for votes less than a year old)
      timeWeight = daysSinceVote <= 365 ? Math.max(timeWeight, 0.1) : 0;

      // 3. Final Score
      return {
        value: vote.value,
        weightedValue: roleWeight * timeWeight,
        updatedAt: vote.updatedAt,
      };
    });

    // Get the most recent vote time
    const lastVoteTime =
      weightedVotes.length > 0
        ? new Date(
            Math.max(
              ...weightedVotes.map((v) => new Date(v.updatedAt).getTime())
            )
          ).toISOString()
        : null;

    // Group votes by their original value and sum their weighted values
    const voteGroups = weightedVotes.reduce(
      (acc: { [key: number]: number }, vote) => {
        acc[vote.value] = (acc[vote.value] || 0) + vote.weightedValue;
        return acc;
      },
      {}
    );

    // Find the value with the highest weighted sum
    const maxWeightedSum = Math.max(...Object.values(voteGroups));
    const mostVotedValues = Object.entries(voteGroups)
      .filter(([_, sum]) => sum === maxWeightedSum)
      .map(([value]) => Number(value))
      .sort((a, b) => a - b); // Sort for consistent display

    return NextResponse.json({
      ...card,
      mostVotedValues,
      lastVoteTime,
      votes: undefined, // Remove the votes array from the response
    });
  } catch (error) {
    console.error("GET /api/cards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const card = await prisma.card.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("PUT /api/cards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE handler
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/cards/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
