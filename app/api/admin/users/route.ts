import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const admins = await prisma.adminUser.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, password, role } = body || {};

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Name, email, and a password (min 8 characters) are required." },
      { status: 400 }
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An admin with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role) ? role : "ADMIN",
    },
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true },
  });

  const actor = await getCurrentAdmin();
  await logAudit({
    actor,
    action: "CREATE",
    entityType: "AdminUser",
    entityId: admin.id,
    description: `Created admin user ${admin.email} (role: ${admin.role})`,
  });

  return NextResponse.json({ admin }, { status: 201 });
}
