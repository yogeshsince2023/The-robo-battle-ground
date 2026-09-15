import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const requests = await prisma.machiningRequest.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q, mode: "insensitive" as const } },
              { referenceNo: { contains: q, mode: "insensitive" as const } },
              { company: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { files: { select: { id: true, originalName: true, size: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ requests });
}
