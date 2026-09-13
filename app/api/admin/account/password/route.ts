import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getCurrentAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { currentPassword, newPassword } = body || {};
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Current password and a new password (min 8 characters) are required." },
      { status: 400 }
    );
  }

  const admin = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

  const passwordHash = await hashPassword(newPassword);
  await prisma.adminUser.update({ where: { id: admin.id }, data: { passwordHash } });

  await logAudit({
    actor: session,
    action: "UPDATE",
    entityType: "AdminUser",
    entityId: admin.id,
    description: "Changed own password",
  });

  return NextResponse.json({ ok: true });
}
