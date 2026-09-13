import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { certificateVerifySchema } from "@/lib/validations";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const { allowed } = rateLimit(`cert-verify:${ip}`, 20, 5 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ found: false, error: "Too many requests." }, { status: 429 });
  }

  const certificateId = req.nextUrl.searchParams.get("certificateId") || "";
  const parsed = certificateVerifySchema.safeParse({ certificateId });
  if (!parsed.success) {
    return NextResponse.json({ found: false });
  }

  const cert = await prisma.certificate.findUnique({
    where: { certificateId: parsed.data.certificateId },
  });

  if (!cert) {
    return NextResponse.json({ found: false });
  }

  // Only expose fields relevant to public verification — never internal notes/ids.
  return NextResponse.json({
    found: true,
    certificate: {
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      courseName: cert.courseName,
      trainingDuration: cert.trainingDuration,
      issueDate: cert.issueDate,
      completionDate: cert.completionDate,
      status: cert.status,
    },
  });
}
