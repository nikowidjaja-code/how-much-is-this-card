import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    // Create or update vote
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

    // Calculate new average value for the card
    const votes = await prisma.vote.findMany({
      where: { cardId: params.id },
    });

    const averageValue =
      votes.reduce(
        (acc: number, vote: { value: number }) => acc + vote.value,
        0
      ) / votes.length;

    // Update card value
    await prisma.card.update({
      where: { id: params.id },
      data: { value: averageValue },
    });

    return NextResponse.json({ success: true, vote });
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
