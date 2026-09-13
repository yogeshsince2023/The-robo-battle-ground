import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        certificateId: body.certificateId,
        studentName: body.studentName,
        courseName: body.courseName,
        trainingDuration: body.trainingDuration,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        completionDate: body.completionDate ? new Date(body.completionDate) : null,
        status: body.status,
        certificateFileUrl: body.certificateFileUrl,
      },
    });

    const admin = await getCurrentAdmin();
    await logAudit({
      actor: admin,
      action: "UPDATE",
      entityType: "Certificate",
      entityId: certificate.id,
      description: `Updated certificate ${certificate.certificateId} (status: ${certificate.status})`,
    });

    return NextResponse.json({ certificate });
  } catch {
    return NextResponse.json({ error: "A certificate with this ID already exists." }, { status: 409 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await prisma.certificate.findUnique({ where: { id } });
  await prisma.certificate.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "Certificate",
    entityId: id,
    description: existing ? `Deleted certificate ${existing.certificateId}` : undefined,
  });

  return NextResponse.json({ ok: true });
}
