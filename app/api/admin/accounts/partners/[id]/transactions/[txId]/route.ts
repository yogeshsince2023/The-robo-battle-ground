import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; txId: string }> }
) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { txId } = await params;
  const existing = await prisma.partnerTransaction.findUnique({ where: { id: txId } });
  await prisma.partnerTransaction.delete({ where: { id: txId } });

  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "PartnerTransaction",
    entityId: txId,
    description: existing ? `Deleted partner withdrawal of ₹${existing.amount}` : undefined,
  });

  return NextResponse.json({ ok: true });
}
