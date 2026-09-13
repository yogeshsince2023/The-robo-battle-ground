import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ARENA_DIR = path.join(process.cwd(), "public", "arena");

export async function GET() {
  const photos = await prisma.arenaPhoto.findMany({ orderBy: { displayOrder: "asc" } });
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
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
    return NextResponse.json({ error: "Image too large (max 10MB)." }, { status: 400 });
  }

  await mkdir(ARENA_DIR, { recursive: true });
  const storedName = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(ARENA_DIR, storedName), buffer);

  const count = await prisma.arenaPhoto.count();
  const photo = await prisma.arenaPhoto.create({
    data: { url: `/arena/${storedName}`, displayOrder: count },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPLOAD",
    entityType: "ArenaPhoto",
    entityId: photo.id,
    description: "Uploaded a new arena gallery photo",
  });

  return NextResponse.json({ photo }, { status: 201 });
}
