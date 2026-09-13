import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { unlink } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = await prisma.arenaPhoto.findUnique({ where: { id } });
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // url is a public path like /arena/<file>; strip any query/encoding before
  // resolving to disk, and only ever look inside public/.
  const relativePath = decodeURIComponent(photo.url.split("?")[0]).replace(/^\//, "");
  const filePath = path.join(process.cwd(), "public", relativePath);
  await unlink(filePath).catch(() => {});
  await prisma.arenaPhoto.delete({ where: { id } });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "DELETE",
    entityType: "ArenaPhoto",
    entityId: id,
    description: "Removed an arena gallery photo",
  });

  return NextResponse.json({ ok: true });
}
