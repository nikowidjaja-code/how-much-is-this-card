import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"; // adjust the path as needed
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET handler
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get("sortBy") || "updatedAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const validFields = ["name", "value", "updatedAt"] as const;
    const validOrders = ["asc", "desc"] as const;

    const field = validFields.includes(sortBy as any)
      ? (sortBy as (typeof validFields)[number])
      : "updatedAt";
    const sortOrder = validOrders.includes(order) ? order : "desc";

    const cards = await prisma.card.findMany({
      orderBy: {
        [field]: sortOrder,
      },
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

    // Calculate mostVotedValues for each card
    const cardsWithVoteInfo = cards.map((card) => {
      // Calculate weighted votes
      const weightedVotes = card.votes.map((vote) => {
        // 1. Role-Based Weight
        const roleWeight = vote.user.role === "ADMIN" ? 5 : 1;

        // 2. Time-Based Decay
        const daysSinceVote = Math.floor(
          (Date.now() - new Date(vote.updatedAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );

        let timeWeight = 1;
        if (daysSinceVote <= 7) {
          timeWeight = 1 - daysSinceVote / 14; // 7 days = 0.5
        } else if (daysSinceVote <= 14) {
          timeWeight = 0.5 - (daysSinceVote - 7) / 28; // 14 days = 0.25
        } else if (daysSinceVote <= 30) {
          timeWeight = 0.25 - (daysSinceVote - 14) / 160; // 30 days = ~0.1
        } else {
          timeWeight = 0.1;
        }

        // Clamp minimum weight
        timeWeight = Math.max(timeWeight, 0.1);

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

      return {
        ...card,
        mostVotedValues,
        lastVoteTime,
        votes: undefined, // Remove the votes array from the response
      };
    });

    return NextResponse.json(cardsWithVoteInfo);
  } catch (error) {
    console.error("GET /api/cards error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST handler
export async function POST(req: NextRequest) {
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

    const card = await prisma.card.create({
      data: {
        name,
        value: -1, // Default value for unvalued cards
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("POST /api/cards error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
