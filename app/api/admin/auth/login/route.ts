import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { authenticateAdmin, createSessionToken, setSessionCookie } from "@/lib/auth";
import { isRateLimited, recordAttempt, clientIpFromRequest } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const LOGIN_ATTEMPT_LIMIT = 8;
const LOGIN_ATTEMPT_WINDOW_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIpFromRequest(req);
  const rateLimitKey = `login:${ip}`;

  const { blocked, retryAfterMs } = isRateLimited(rateLimitKey, LOGIN_ATTEMPT_LIMIT);
  if (blocked) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${Math.ceil(retryAfterMs / 1000)}s.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  const admin = await authenticateAdmin(parsed.data.email, parsed.data.password);
  if (!admin) {
    // Only failed attempts consume the rate-limit budget — a correct login
    // never counts against it, even when many clients share the "unknown"
    // IP bucket (see clientIpFromRequest).
    recordAttempt(rateLimitKey, LOGIN_ATTEMPT_WINDOW_MS);
    await logAudit({
      actor: { email: parsed.data.email },
      action: "LOGIN_FAILED",
      entityType: "AdminUser",
      ipAddress: ip,
    });
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await createSessionToken({
    sub: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  await setSessionCookie(token);

  await logAudit({
    actor: { sub: admin.id, email: admin.email, name: admin.name },
    action: "LOGIN",
    entityType: "AdminUser",
    entityId: admin.id,
    ipAddress: ip,
  });

  return NextResponse.json({ ok: true });
}
