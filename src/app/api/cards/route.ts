import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const cards = await prisma.card.findMany()
  return NextResponse.json(cards)
}

export async function POST(req: Request) {
  const { name, value } = await req.json()
  const card = await prisma.card.create({ data: { name, value } })
  return NextResponse.json(card, { status: 201 })
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await prisma.card.delete({
      where: { id: params.id },
    })
    return NextResponse.json(deleted)
  } catch (error) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }
}
