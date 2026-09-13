import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const nextStatus = body.status ?? existing.status;
  const becomingPaid = nextStatus === "PAID" && existing.status !== "PAID";
  const leavingPaid = nextStatus !== "PAID" && existing.status === "PAID";

  let receivedAmount = body.receivedAmount !== undefined ? Number(body.receivedAmount) : existing.receivedAmount;
  if (becomingPaid) receivedAmount = existing.totalAmount;

  const admin = await getCurrentAdmin();
  let incomeTransactionId = existing.incomeTransactionId;

  if (becomingPaid && !existing.incomeTransactionId) {
    const income = await prisma.incomeTransaction.create({
      data: {
        date: new Date(),
        amount: existing.totalAmount,
        source: "Invoice",
        description: `Invoice ${existing.invoiceNumber} — ${existing.billToName}`,
        referenceNumber: existing.invoiceNumber,
      },
    });
    incomeTransactionId = income.id;
    await logAudit({
      actor: admin,
      action: "CREATE",
      entityType: "IncomeTransaction",
      entityId: income.id,
      description: `Auto-recorded income of ₹${income.amount} from invoice ${existing.invoiceNumber} marked as PAID`,
    });
  } else if (leavingPaid && existing.incomeTransactionId) {
    await prisma.incomeTransaction.delete({ where: { id: existing.incomeTransactionId } }).catch(() => {});
    await logAudit({
      actor: admin,
      action: "DELETE",
      entityType: "IncomeTransaction",
      entityId: existing.incomeTransactionId,
      description: `Removed auto-recorded income after invoice ${existing.invoiceNumber} was un-marked as PAID`,
    });
    incomeTransactionId = null;
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: nextStatus,
      receivedAmount,
      balanceAmount: existing.totalAmount - receivedAmount,
      notes: body.notes ?? existing.notes,
      incomeTransactionId,
    },
  });

  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Invoice",
    entityId: invoice.id,
    description: `Updated invoice ${invoice.invoiceNumber} (status: ${invoice.status})`,
  });

  return NextResponse.json({ invoice });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });

  if (existing?.incomeTransactionId) {
    await prisma.incomeTransaction.delete({ where: { id: existing.incomeTransactionId } }).catch(() => {});
  }
  await prisma.invoice.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Invoice",
    entityId: id,
    description: existing ? `Deleted invoice ${existing.invoiceNumber}` : undefined,
  });

  return NextResponse.json({ ok: true });
}
