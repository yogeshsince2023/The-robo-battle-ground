import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { arenaEnquirySchema } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/reference-number";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const { allowed } = rateLimit(`arena-enquiry:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = arenaEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const referenceNo = await generateReferenceNumber("ARENA");

  const enquiry = await prisma.arenaEnquiry.create({
    data: {
      referenceNo,
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      eventName: data.eventName || null,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      participants: data.participants ?? null,
      robotCategory: data.robotCategory || null,
      expectedRobots: data.expectedRobots ?? null,
      arenaDuration: data.arenaDuration || null,
      location: data.location || null,
      message: data.message || null,
    },
  });

  await notifyAdmin("ARENA_ENQUIRY", enquiry.referenceNo, `New arena enquiry from ${data.name}`);

  return NextResponse.json({ referenceNo: enquiry.referenceNo }, { status: 201 });
}
