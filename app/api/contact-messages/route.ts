import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/reference-number";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const { allowed } = rateLimit(`contact-message:${ip}`, 10, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const referenceNo = await generateReferenceNumber("CONTACT");

  const message = await prisma.contactMessage.create({
    data: {
      referenceNo,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    },
  });

  await notifyAdmin("CONTACT_MESSAGE", message.referenceNo, `New contact message from ${data.name}`);

  return NextResponse.json({ referenceNo: message.referenceNo }, { status: 201 });
}
