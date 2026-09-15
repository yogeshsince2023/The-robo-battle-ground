import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

import { savePublicMedia } from "@/lib/file-storage";

const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Generic image upload used by site-wide media settings (hero background,
// navbar logo). Saves via savePublicMedia and returns a public URL —
// the caller (admin content page) then PUTs that URL into /api/admin/settings.
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

  const url = await savePublicMedia(file, "uploads/site");
  return NextResponse.json({ url }, { status: 201 });
}
