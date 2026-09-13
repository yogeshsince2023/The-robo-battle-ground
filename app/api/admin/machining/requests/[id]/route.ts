import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteStoredFile } from "@/lib/file-storage";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { status, adminNotes, quotationAmount, estimatedDelivery } = body as {
    status?: string;
    adminNotes?: string;
    quotationAmount?: number | null;
    estimatedDelivery?: string;
  };

  const updated = await prisma.machiningRequest.update({
    where: { id },
    data: {
      ...(status ? { status: status as never } : {}),
      ...(adminNotes !== undefined ? { adminNotes } : {}),
      ...(quotationAmount !== undefined ? { quotationAmount } : {}),
      ...(estimatedDelivery !== undefined ? { estimatedDelivery } : {}),
    },
  });
  return NextResponse.json({ request: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const files = await prisma.uploadedFile.findMany({ where: { machiningRequestId: id } });
  for (const f of files) {
    await deleteStoredFile(f.storedName);
  }
  await prisma.machiningRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
