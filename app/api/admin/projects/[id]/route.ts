import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      category: body.category,
      shortDescription: body.shortDescription,
      detailedDescription: body.detailedDescription,
      year: body.year,
      technologies: body.technologies,
      clientOrEvent: body.clientOrEvent,
      coverImageUrl: body.coverImageUrl,
      status: body.status,
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Project",
    entityId: project.id,
    description: `Updated project "${project.name}"`,
  });

  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.project.findUnique({ where: { id } });
  await prisma.project.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Project",
    entityId: id,
    description: existing ? `Deleted project "${existing.name}"` : undefined,
  });

  return NextResponse.json({ ok: true });
}
