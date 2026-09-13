import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const status = searchParams.get("status");

  const enquiries = await prisma.trainingEnquiry.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q
        ? {
            OR: [
              { studentName: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
              { referenceNo: { contains: q } },
              { organization: { contains: q } },
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
