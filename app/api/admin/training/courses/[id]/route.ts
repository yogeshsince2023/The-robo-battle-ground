import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const course = await prisma.trainingCourse.update({
    where: { id },
    data: {
      name: body.name,
      shortDescription: body.shortDescription,
      detailedDescription: body.detailedDescription,
      duration: body.duration,
      mode: body.mode,
      fees: body.fees,
      eligibility: body.eligibility,
      skillsCovered: body.skillsCovered,
      modules: body.modules,
      certificateAvailable: Boolean(body.certificateAvailable),
      status: body.status,
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "TrainingCourse",
    entityId: course.id,
    description: `Updated training course "${course.name}"`,
  });

  return NextResponse.json({ course });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.trainingCourse.findUnique({ where: { id } });
  await prisma.trainingCourse.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "TrainingCourse",
    entityId: id,
    description: existing ? `Deleted training course "${existing.name}"` : undefined,
  });

  return NextResponse.json({ ok: true });
}
