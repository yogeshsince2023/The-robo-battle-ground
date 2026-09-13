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
  const projects = await prisma.project.findMany({
    orderBy: { displayOrder: "asc" },
    include: { images: true },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: {
      name: body.name,
      slug: `${slugify(body.name)}-${Date.now().toString(36)}`,
      category: body.category,
      shortDescription: body.shortDescription || "",
      detailedDescription: body.detailedDescription || "",
      year: body.year || "",
      technologies: body.technologies || "",
      clientOrEvent: body.clientOrEvent || "",
      coverImageUrl: body.coverImageUrl || "",
      status: body.status || "Published",
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "Project",
    entityId: project.id,
    description: `Created project "${project.name}"`,
  });

  return NextResponse.json({ project }, { status: 201 });
}
