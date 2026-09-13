const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CONTACTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  CONFIRMED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  COMPLETED: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
  UNDER_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  QUOTED: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  READ: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  RESPONDED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  ARCHIVED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  VALID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  REVOKED: "bg-red-500/10 text-red-400 border-red-500/30",
  EXPIRED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
  return (
    <span className={`badge ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
