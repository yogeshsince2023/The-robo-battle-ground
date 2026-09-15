import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lightweight page-view tracker — no cookies, no PII.
// Fires once per client-side navigation via the <Analytics> component.

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.page || typeof body.page !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Detect device from User-Agent (rough but good enough for dashboards)
  const ua = req.headers.get("user-agent") ?? "";
  let device = "desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) device = "mobile";
  else if (/tablet|ipad/i.test(ua)) device = "tablet";

  // Trim referrer to origin only (privacy)
  let referrer: string | null = null;
  if (body.referrer && typeof body.referrer === "string") {
    try {
      referrer = new URL(body.referrer).origin;
    } catch {
      referrer = null;
    }
  }

  // Fire-and-forget insert — don't block the response on DB latency
  prisma.pageView
    .create({ data: { page: body.page.slice(0, 500), referrer, device } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
