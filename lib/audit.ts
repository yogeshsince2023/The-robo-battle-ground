import { prisma } from "@/lib/prisma";
import type { AdminSessionPayload } from "@/lib/auth";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "UPLOAD";

// Fire-and-forget audit trail. Never let a logging failure break the actual
// request — audit writes are wrapped so a DB hiccup here can't 500 an
// otherwise-successful admin action.
export async function logAudit(params: {
  actor: AdminSessionPayload | { email: string; name?: string; sub?: string } | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  description?: string;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actor && "sub" in params.actor ? params.actor.sub ?? null : null,
        actorName: params.actor?.name || "Unknown",
        actorEmail: params.actor?.email || "unknown",
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        description: params.description ?? null,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log entry:", err);
  }
}
