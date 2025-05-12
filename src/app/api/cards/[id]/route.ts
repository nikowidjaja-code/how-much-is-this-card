// app/api/cards/[id]/route.ts

import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  // logic to delete the card by id
  return NextResponse.json({ message: 'Deleted' });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json();
  // logic to update the card
  return NextResponse.json({ message: 'Updated' });
}
