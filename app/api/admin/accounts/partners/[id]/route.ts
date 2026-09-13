import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const partner = await prisma.partner.update({ where: { id }, data: { name: body.name } });

  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Partner",
    entityId: partner.id,
    description: `Renamed ${partner.slotLabel} to "${partner.name}"`,
  });

  return NextResponse.json({ partner });
}
