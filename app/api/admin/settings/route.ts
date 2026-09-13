import { NextRequest, NextResponse } from "next/server";
import { setSetting, DEFAULT_SETTINGS } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  const rows = await prisma.siteSetting.findMany();
  // Start from the same defaults the public site falls back to, so a tab an
  // admin has never saved shows the real current values (not blank inputs
  // that would wipe those defaults out if saved as-is).
  const settings: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    try {
      settings[row.key] = { ...(settings[row.key] as object), ...JSON.parse(row.value) };
    } catch {
      settings[row.key] = row.value;
    }
  }
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.key || body.value === undefined) {
    return NextResponse.json({ error: "key and value are required" }, { status: 400 });
  }
  await setSetting(body.key, body.value);

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "UPDATE",
    entityType: "Settings",
    entityId: body.key,
    description: `Updated "${body.key}" website content settings`,
  });

  return NextResponse.json({ ok: true });
}
