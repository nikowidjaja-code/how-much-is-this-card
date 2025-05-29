import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get user data with their last vote
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true,
        votes: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Format the response
    const profile = {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      lastVoteAt: user.votes[0]?.createdAt.toISOString() || null,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
