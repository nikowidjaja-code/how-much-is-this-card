import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all votes for this card, including votes from all users
    const votes = await prisma.vote.findMany({
      where: { cardId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Calculate weighted votes
    const weightedVotes = votes.map((vote) => {
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
      const finalVoteScore = roleWeight * timeWeight;

      return {
        ...vote,
        weightedValue: finalVoteScore,
        roleWeight,
        timeWeight,
        daysSinceVote,
      };
    });

    // Group votes by their original value and sum their weighted values
    const voteGroups = weightedVotes.reduce(
      (acc: { [key: number]: number }, vote) => {
        acc[vote.value] = (acc[vote.value] || 0) + vote.weightedValue;
        return acc;
      },
      {}
    );

    // Count raw votes per value
    const rawVoteCounts = votes.reduce(
      (acc: { [key: number]: number }, vote) => {
        acc[vote.value] = (acc[vote.value] || 0) + 1;
        return acc;
      },
      {}
    );

    // Find the value with the highest weighted sum
    const maxWeightedSum = Math.max(...Object.values(voteGroups));
    const mostVotedValues = Object.entries(voteGroups)
      .filter(([_, sum]) => sum === maxWeightedSum)
      .map(([value]) => Number(value));

    // If there's a tie, set value to -1 to indicate a tie
    const finalValue = mostVotedValues.length > 1 ? -1 : mostVotedValues[0];

    return NextResponse.json({
      success: true,
      voteDistribution: voteGroups,
      rawVoteCounts,
      voteDetails: weightedVotes.map((v) => ({
        value: v.value,
        user: v.user,
        updatedAt: v.updatedAt,
        weightedValue: v.weightedValue,
        roleWeight: v.roleWeight,
        timeWeight: v.timeWeight,
        daysSinceVote: v.daysSinceVote,
      })),
      finalValue,
      mostVotedValues,
      maxWeightedSum,
      voteCount: votes.length,
      weightedVoteCount: Object.values(voteGroups).reduce((a, b) => a + b, 0),
    });
  } catch (error) {
    console.error(
      "Error fetching votes:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to fetch votes" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { value } = await req.json();
    if (typeof value !== "number") {
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await prisma.user.upsert({
      where: { email: session.user.email },
      update: {},
      create: {
        email: session.user.email,
        name: session.user.name || null,
        image: session.user.image || null,
      },
    });

    // Get existing vote if any
    const existingVote = await prisma.vote.findUnique({
      where: {
        cardId_userId: {
          cardId: params.id,
          userId: user.id,
        },
      },
    });

    // If the new vote value matches the existing vote, delete the vote (cancel it)
    if (existingVote && existingVote.value === value) {
      await prisma.vote.delete({
        where: {
          cardId_userId: {
            cardId: params.id,
            userId: user.id,
          },
        },
      });
    } else {
      // Create or update vote for this user
      await prisma.vote.upsert({
        where: {
          cardId_userId: {
            cardId: params.id,
            userId: user.id,
          },
        },
        update: {
          value,
        },
        create: {
          value,
          cardId: params.id,
          userId: user.id,
        },
      });
    }

    // Get all votes for this card, including votes from all users
    const votes = await prisma.vote.findMany({
      where: { cardId: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Calculate weighted votes
    const weightedVotes = votes.map((vote) => {
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
      const finalVoteScore = roleWeight * timeWeight;

      return {
        ...vote,
        weightedValue: finalVoteScore,
        roleWeight,
        timeWeight,
        daysSinceVote,
      };
    });

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
      .map(([value]) => Number(value));

    // If there's a tie, set value to -1 to indicate a tie
    const finalValue = mostVotedValues.length > 1 ? -1 : mostVotedValues[0];

    // Update card value
    await prisma.card.update({
      where: { id: params.id },
      data: { value: finalValue },
    });

    return NextResponse.json({
      success: true,
      voteDistribution: voteGroups,
      mostVotedValues: mostVotedValues.sort((a, b) => a - b), // Sort for consistent display
      finalValue,
      votes: votes.map((v) => ({
        value: v.value,
        user: v.user,
        updatedAt: v.updatedAt,
      })),
    });
  } catch (error) {
    console.error(
      "Vote error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
