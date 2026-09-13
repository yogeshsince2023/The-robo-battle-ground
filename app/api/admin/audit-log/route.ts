import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const action = searchParams.get("action");
  const entityType = searchParams.get("entityType");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const where = {
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(q
      ? {
          OR: [
            { actorName: { contains: q } },
            { actorEmail: { contains: q } },
            { entityType: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  const [logs, total, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
      orderBy: { entityType: "asc" },
    }),
  ]);

  return NextResponse.json({
    logs,
    total,
    page,
    pageSize: PAGE_SIZE,
    entityTypes: entityTypes.map((e) => e.entityType),
  });
}
