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
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Count votes per value
    const voteCounts = votes.reduce((acc: { [key: number]: number }, vote) => {
      acc[vote.value] = (acc[vote.value] || 0) + 1;
      return acc;
    }, {});

    console.log("Vote counts:", voteCounts);

    return NextResponse.json({
      success: true,
      voteDistribution: voteCounts,
      votes: votes.map((v) => ({
        value: v.value,
        user: v.user,
        updatedAt: v.updatedAt,
      })),
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

    // Create or update vote for this user
    const vote = await prisma.vote.upsert({
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

    // Get all votes for this card, including votes from all users
    const votes = await prisma.vote.findMany({
      where: { cardId: params.id },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Count votes per value
    const voteCounts = votes.reduce((acc: { [key: number]: number }, vote) => {
      acc[vote.value] = (acc[vote.value] || 0) + 1;
      return acc;
    }, {});

    console.log("Vote counts:", voteCounts);

    // Find the most voted value(s)
    const maxVotes = Math.max(...Object.values(voteCounts));
    const mostVotedValues = Object.entries(voteCounts)
      .filter(([_, count]) => count === maxVotes)
      .map(([value]) => Number(value));

    console.log("Max votes:", maxVotes);
    console.log("Most voted values:", mostVotedValues);

    // If there's an exact tie (same number of votes), set value to -1
    let finalValue = mostVotedValues.length > 1 ? -1 : mostVotedValues[0];

    console.log("Final value:", finalValue);

    // Update card value
    await prisma.card.update({
      where: { id: params.id },
      data: { value: finalValue },
    });

    return NextResponse.json({
      success: true,
      vote,
      voteDistribution: voteCounts,
      mostVotedValues: mostVotedValues,
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
