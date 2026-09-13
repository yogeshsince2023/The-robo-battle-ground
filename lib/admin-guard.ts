import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

// Defense-in-depth: middleware already blocks unauthenticated access to
// /api/admin/*, but every handler that touches financial or personal data
// re-checks the session here directly, in case this route is ever reached
// another way (e.g. server-side fetch, future refactor of the matcher).
export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { admin: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { admin, response: null };
}
