import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { trainingEnquirySchema } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/reference-number";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const { allowed } = rateLimit(`training-enquiry:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = trainingEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const referenceNo = await generateReferenceNumber("TRAIN");

  const enquiry = await prisma.trainingEnquiry.create({
    data: {
      referenceNo,
      studentName: data.studentName,
      email: data.email,
      phone: data.phone,
      organization: data.organization || null,
      courseId: data.courseId || null,
      preferredBatch: data.preferredBatch || null,
      trainingMode: data.trainingMode || null,
      message: data.message || null,
    },
  });

  await notifyAdmin("TRAINING_ENQUIRY", enquiry.referenceNo, `New training enquiry from ${data.studentName}`);

  return NextResponse.json({ referenceNo: enquiry.referenceNo }, { status: 201 });
}
