import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { machiningRequestSchema } from "@/lib/validations";
import { generateReferenceNumber } from "@/lib/reference-number";
import { rateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import { notifyAdmin } from "@/lib/notify";
import {
  isAllowedFile,
  isAllowedSize,
  saveUploadedFile,
} from "@/lib/file-storage";
import { MAX_UPLOAD_FILES } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const { allowed } = rateLimit(`machining-request:${ip}`, 8, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const raw = {
    name: formData.get("name")?.toString() || "",
    company: formData.get("company")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    phone: formData.get("phone")?.toString() || "",
    serviceType: formData.get("serviceType")?.toString() || "",
    material: formData.get("material")?.toString() || "",
    quantity: formData.get("quantity")?.toString() || undefined,
    requiredDeliveryDate: formData.get("requiredDeliveryDate")?.toString() || "",
    tolerance: formData.get("tolerance")?.toString() || "",
    instructions: formData.get("instructions")?.toString() || "",
  };

  const parsed = machiningRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid input." },
      { status: 400 }
    );
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length > MAX_UPLOAD_FILES) {
    return NextResponse.json({ error: `You can upload at most ${MAX_UPLOAD_FILES} files.` }, { status: 400 });
  }

  for (const file of files) {
    if (!isAllowedFile(file.name)) {
      return NextResponse.json({ error: `Unsupported file type: ${file.name}` }, { status: 400 });
    }
    if (!isAllowedSize(file.size)) {
      return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
    }
  }

  const data = parsed.data;
  const referenceNo = await generateReferenceNumber("MACH");

  const request_ = await prisma.machiningRequest.create({
    data: {
      referenceNo,
      name: data.name,
      company: data.company || null,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      material: data.material || null,
      quantity: data.quantity ?? null,
      requiredDeliveryDate: data.requiredDeliveryDate ? new Date(data.requiredDeliveryDate) : null,
      tolerance: data.tolerance || null,
      instructions: data.instructions || null,
    },
  });

  for (const file of files) {
    const saved = await saveUploadedFile(file);
    await prisma.uploadedFile.create({
      data: {
        originalName: saved.originalName,
        storedName: saved.storedName,
        mimeType: saved.mimeType,
        size: saved.size,
        machiningRequestId: request_.id,
      },
    });
  }

  await notifyAdmin("MACHINING_REQUEST", request_.referenceNo, `New machining quotation request from ${data.name}`);

  return NextResponse.json({ referenceNo: request_.referenceNo }, { status: 201 });
}
