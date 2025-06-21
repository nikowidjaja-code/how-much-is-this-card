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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const valueFilter = searchParams.get("valueFilter");

    const validFields = ["name", "value", "updatedAt"] as const;
    const validOrders = ["asc", "desc"] as const;

    const field = validFields.includes(sortBy as any)
      ? (sortBy as (typeof validFields)[number])
      : "updatedAt";
    const sortOrder = validOrders.includes(order) ? order : "desc";

    // Calculate pagination
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Cap at 100 items per page

    // Build where clause for search and value filter
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive" as const,
      };
    }

    // Add value filtering
    if (valueFilter && valueFilter !== "all") {
      const filterValue = parseFloat(valueFilter);
      if (!isNaN(filterValue)) {
        if (filterValue === 1) {
          // Special case for "1mm+" (value > 1)
          where.value = { gt: 1 };
        } else {
          where.value = filterValue;
        }
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.card.count({ where });

    const cards = await prisma.card.findMany({
      where,
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
      skip,
      take,
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

      return {
        ...card,
        mostVotedValues,
        lastVoteTime,
        votes: undefined, // Remove the votes array from the response
      };
    });

    return NextResponse.json({
      cards: cardsWithVoteInfo,
      pagination: {
        page,
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasNextPage: page < Math.ceil(totalCount / take),
        hasPrevPage: page > 1,
      },
    });
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
