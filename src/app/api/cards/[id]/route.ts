import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    // Delete all votes for this card first
    await prisma.vote.deleteMany({
      where: { cardId: params.id },
    });

    // Then delete the card
    await prisma.card.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}

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

    await prisma.card.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update error:", err);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}
