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

  const entry = await prisma.expenseTransaction.update({
    where: { id },
    data: {
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      paidTo: body.paidTo,
      category: body.category,
      description: body.description,
      paymentMethod: body.paymentMethod,
      referenceNumber: body.referenceNumber,
      notes: body.notes,
    },
  });

  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Expense",
    entityId: entry.id,
    description: `Updated expense entry (₹${entry.amount}, ${entry.category})`,
  });

  return NextResponse.json({ entry });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.expenseTransaction.findUnique({ where: { id } });
  await prisma.expenseTransaction.delete({ where: { id } });

  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Expense",
    entityId: id,
    description: existing ? `Deleted expense entry (₹${existing.amount}, ${existing.category})` : undefined,
  });

  return NextResponse.json({ ok: true });
}
