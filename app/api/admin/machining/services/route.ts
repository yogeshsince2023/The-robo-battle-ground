import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const services = await prisma.machiningService.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.category) {
    return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
  }
  const service = await prisma.machiningService.create({
    data: {
      category: body.category,
      title: body.title,
      description: body.description || "",
      materials: body.materials || "",
      applications: body.applications || "",
      capabilities: body.capabilities || "",
      status: body.status || "Active",
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "MachiningService",
    entityId: service.id,
    description: `Created machining service "${service.title}"`,
  });

  return NextResponse.json({ service }, { status: 201 });
}
