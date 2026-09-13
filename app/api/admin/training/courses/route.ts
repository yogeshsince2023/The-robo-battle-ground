import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const courses = await prisma.trainingCourse.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ error: "Course name is required" }, { status: 400 });

  const course = await prisma.trainingCourse.create({
    data: {
      name: body.name,
      slug: `${slugify(body.name)}-${Date.now().toString(36)}`,
      shortDescription: body.shortDescription || "",
      detailedDescription: body.detailedDescription || "",
      duration: body.duration || "",
      mode: body.mode || "",
      fees: body.fees || "",
      eligibility: body.eligibility || "",
      skillsCovered: body.skillsCovered || "",
      modules: body.modules || "",
      certificateAvailable: Boolean(body.certificateAvailable),
      status: body.status || "Active",
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "TrainingCourse",
    entityId: course.id,
    description: `Created training course "${course.name}"`,
  });

  return NextResponse.json({ course }, { status: 201 });
}
