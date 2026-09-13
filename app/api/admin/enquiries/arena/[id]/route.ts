import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { status, adminNotes } = body as { status?: string; adminNotes?: string };

  const updated = await prisma.arenaEnquiry.update({
    where: { id },
    data: {
      ...(status ? { status: status as never } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    },
  });

  return NextResponse.json({ enquiry: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.arenaEnquiry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
