import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const entry = await prisma.incomeTransaction.update({
    where: { id },
    data: {
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      source: body.source,
      description: body.description,
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
    },
  });

  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Income",
    entityId: entry.id,
    description: `Updated income entry (₹${entry.amount}, ${entry.source})`,
  });

  return NextResponse.json({ entry });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.incomeTransaction.findUnique({ where: { id } });
  await prisma.incomeTransaction.delete({ where: { id } });

  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Income",
    entityId: id,
    description: existing ? `Deleted income entry (₹${existing.amount}, ${existing.source})` : undefined,
  });

  return NextResponse.json({ ok: true });
}
