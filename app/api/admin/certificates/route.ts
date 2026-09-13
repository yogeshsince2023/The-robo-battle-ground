import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const certificates = await prisma.certificate.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ certificates });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.certificateId || !body?.studentName || !body?.courseName || !body?.issueDate) {
    return NextResponse.json(
      { error: "Certificate ID, student name, course name and issue date are required." },
      { status: 400 }
    );
  }

  const exists = await prisma.certificate.findUnique({ where: { certificateId: body.certificateId } });
  if (exists) {
    return NextResponse.json({ error: "A certificate with this ID already exists." }, { status: 409 });
  }

  const certificate = await prisma.certificate.create({
    data: {
      certificateId: body.certificateId,
      studentName: body.studentName,
      courseName: body.courseName,
      trainingDuration: body.trainingDuration || "",
      issueDate: new Date(body.issueDate),
      completionDate: body.completionDate ? new Date(body.completionDate) : null,
      status: body.status || "VALID",
      certificateFileUrl: body.certificateFileUrl || "",
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "Certificate",
    entityId: certificate.id,
    description: `Issued certificate ${certificate.certificateId} for ${certificate.studentName}`,
  });

  return NextResponse.json({ certificate }, { status: 201 });
}
