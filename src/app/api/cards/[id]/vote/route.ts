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
    console.log("Starting vote process...");
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.email) {
      console.log("No session or email found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { value } = await req.json();
    console.log("Vote value:", value);

    if (typeof value !== "number") {
      console.log("Invalid vote value type:", typeof value);
      return NextResponse.json(
        { error: "Invalid vote value" },
        { status: 400 }
      );
    }

    console.log("Getting/creating user...");
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
    console.log("User:", user);

    console.log("Creating/updating vote...");
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
    console.log("Vote:", vote);

    console.log("Calculating average...");
    // Calculate new average value for the card
    const votes = await prisma.vote.findMany({
      where: { cardId: params.id },
    });
    console.log("All votes:", votes);

    const averageValue =
      votes.reduce(
        (acc: number, vote: { value: number }) => acc + vote.value,
        0
      ) / votes.length;
    console.log("Average value:", averageValue);

    console.log("Updating card...");
    // Update card value
    await prisma.card.update({
      where: { id: params.id },
      data: { value: averageValue },
    });
    console.log("Card updated successfully");

    return NextResponse.json({ success: true, vote });
  } catch (error) {
    console.error("Vote error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Failed to process vote" },
      { status: 500 }
    );
  }
}
