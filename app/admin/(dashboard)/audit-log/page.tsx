"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

type LogEntry = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string | null;
  ipAddress: string | null;
  createdAt: string;
};

const ACTIONS = ["LOGIN", "LOGIN_FAILED", "LOGOUT", "CREATE", "UPDATE", "DELETE", "UPLOAD"];

const ACTION_STYLE: Record<string, string> = {
  LOGIN: "bg-success/10 text-success border-success/30",
  LOGIN_FAILED: "bg-danger/10 text-danger border-danger/30",
  LOGOUT: "bg-surface-2 text-muted border-border",
  CREATE: "bg-success/10 text-success border-success/30",
  UPDATE: "bg-warning/10 text-warning border-warning/30",
  DELETE: "bg-danger/10 text-danger border-danger/30",
  UPLOAD: "bg-accent/10 text-accent border-accent/30",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const pageSize = 50;

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set("q", q);
    if (action) params.set("action", action);
    if (entityType) params.set("entityType", entityType);
    const res = await fetch(`/api/admin/audit-log?${params.toString()}`);
    const json = await res.json();
    setLogs(json.logs || []);
    setTotal(json.total || 0);
    setEntityTypes(json.entityTypes || []);
  }, [page, q, action, entityType]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Audit Log</h1>
      <p className="mt-1 text-sm text-muted">
        A record of admin logins and every create/update/delete action taken in this dashboard.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by admin, entity, or description..."
            value={q}
            onChange={(e) => { setPage(1); setQ(e.target.value); }}
          />
        </div>
        <select className="input sm:w-48" value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
        </select>
        <select className="input sm:w-48" value={entityType} onChange={(e) => { setPage(1); setEntityType(e.target.value); }}>
          <option value="">All entity types</option>
          {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border">
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="font-medium">{log.actorName}</div>
                  <div className="text-xs text-muted">{log.actorEmail}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={`badge ${ACTION_STYLE[log.action] || "border-border"}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">{log.entityType}</td>
                <td className="px-4 py-3 text-muted">{log.description || "—"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{log.ipAddress || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">No audit log entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>Page {page} of {totalPages} ({total} entries)</span>
          <div className="flex gap-2">
            <button
              className="btn-ghost py-1.5 px-3"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn-ghost py-1.5 px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
