import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const service = await prisma.machiningService.update({
    where: { id },
    data: {
      category: body.category,
      title: body.title,
      description: body.description,
      materials: body.materials,
      applications: body.applications,
      capabilities: body.capabilities,
      status: body.status,
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "MachiningService",
    entityId: service.id,
    description: `Updated machining service "${service.title}"`,
  });

  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.machiningService.findUnique({ where: { id } });
  await prisma.machiningService.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "MachiningService",
    entityId: id,
    description: existing ? `Deleted machining service "${existing.title}"` : undefined,
  });

  return NextResponse.json({ ok: true });
}
