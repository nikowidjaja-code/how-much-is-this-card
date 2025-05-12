import { prisma } from '@/lib/prisma'
import { NextResponse, NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get('sort') || 'recent'; // default to date modified

  let orderBy;

  if (sort === 'name') {
    orderBy = { name: 'asc' };
  } else if (sort === 'value') {
    orderBy = { value: 'desc' };
  } else {
    orderBy = { updatedAt: 'desc' }; // default: recently modified
  }

  const cards = await prisma.card.findMany({
    orderBy,
  });

  return NextResponse.json(cards);
}

export async function POST(req: Request) {
  const { name, value } = await req.json()
  const card = await prisma.card.create({ data: { name, value } })
  return NextResponse.json(card, { status: 201 })
}