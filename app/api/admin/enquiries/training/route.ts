import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const enquiries = await prisma.trainingEnquiry.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { studentName: { contains: q, mode: "insensitive" as const } },
              { email: { contains: q, mode: "insensitive" as const } },
              { phone: { contains: q, mode: "insensitive" as const } },
              { referenceNo: { contains: q, mode: "insensitive" as const } },
              { organization: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    include: { course: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    enquiries: enquiries.map((e) => ({ ...e, courseName: e.course?.name })),
  });
}
