import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const admin = await getCurrentAdmin();
  await clearSessionCookie();
  if (admin) {
    await logAudit({
      actor: admin,
      action: "LOGOUT",
      entityType: "AdminUser",
      entityId: admin.sub,
    });
  }
  return NextResponse.json({ ok: true });
}
