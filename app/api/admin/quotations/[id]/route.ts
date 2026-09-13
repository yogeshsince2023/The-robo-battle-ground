import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ quotation });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      status: body.status,
      notes: body.notes,
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Quotation",
    entityId: quotation.id,
    description: `Updated quotation ${quotation.quotationNumber} (status: ${quotation.status})`,
  });

  return NextResponse.json({ quotation });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.quotation.findUnique({ where: { id } });
  await prisma.quotation.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Quotation",
    entityId: id,
    description: existing ? `Deleted quotation ${existing.quotationNumber}` : undefined,
  });

  return NextResponse.json({ ok: true });
}
