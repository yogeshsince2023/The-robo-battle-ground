import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const actor = await getCurrentAdmin();
  if (actor?.sub === id && body.active === false) {
    return NextResponse.json({ error: "You can't deactivate your own account." }, { status: 400 });
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
      ...(body.active !== undefined ? { active: Boolean(body.active) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });

  await logAudit({
    actor,
    action: "UPDATE",
    entityType: "AdminUser",
    entityId: admin.id,
    description: `Updated admin user ${admin.email} (active: ${admin.active}, role: ${admin.role})`,
  });

  return NextResponse.json({ admin });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await getCurrentAdmin();

  if (actor?.sub === id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const activeCount = await prisma.adminUser.count({ where: { active: true } });
  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (target?.active && activeCount <= 1) {
    return NextResponse.json({ error: "Can't delete the last active admin." }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id } });

  await logAudit({
    actor,
    action: "DELETE",
    entityType: "AdminUser",
    entityId: id,
    description: target ? `Deleted admin user ${target.email}` : undefined,
  });

  return NextResponse.json({ ok: true });
}
