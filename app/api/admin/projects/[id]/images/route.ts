import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";

import { savePublicMedia } from "@/lib/file-storage";

const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXT.includes(ext)) {
    return NextResponse.json({ error: "Unsupported image type. Use JPG, PNG, WEBP or GIF." }, { status: 400 });
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Image too large (max 8MB)." }, { status: 400 });
  }

  const url = await savePublicMedia(file, "uploads/projects");
  const image = await prisma.projectImage.create({
    data: { projectId: id, url },
  });

  return NextResponse.json({ image }, { status: 201 });
}
