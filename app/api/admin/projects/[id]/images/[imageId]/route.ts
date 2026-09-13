import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const { imageId } = await params;
  const image = await prisma.projectImage.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const filePath = path.join(process.cwd(), "public", image.url.replace(/^\//, ""));
  await unlink(filePath).catch(() => {});
  await prisma.projectImage.delete({ where: { id: imageId } });

  return NextResponse.json({ ok: true });
}
