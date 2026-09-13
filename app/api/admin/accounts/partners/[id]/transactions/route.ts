import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.date || !body?.amount) {
    return NextResponse.json({ error: "Date and amount are required." }, { status: 400 });
  }

  const transaction = await prisma.partnerTransaction.create({
    data: {
      partnerId: id,
      date: new Date(body.date),
      amount: Number(body.amount),
      reason: body.reason || "",
      paymentMethod: body.paymentMethod || "",
      referenceNumber: body.referenceNumber || "",
      notes: body.notes || "",
    },
  });

  const partner = await prisma.partner.findUnique({ where: { id } });
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "PartnerTransaction",
    entityId: transaction.id,
    description: `Recorded partner withdrawal of ₹${transaction.amount} for ${partner?.name || id}`,
  });

  return NextResponse.json({ transaction }, { status: 201 });
}
