"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Save } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

type Column = {
  key: string;
  label: string;
  render?: (row: Record<string, unknown>) => React.ReactNode;
};

export function EnquiryManager({
  title,
  description,
  apiBase,
  statusOptions,
  columns,
}: {
  title: string;
  description?: string;
  apiBase: string;
  statusOptions: string[];
  columns: Column[];
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${apiBase}?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const json = await res.json();
      const list = json.enquiries || json.requests || json.messages || [];
      setRows(list);
    } catch (err: any) {
      console.error(`Failed to load from ${apiBase}:`, err);
      toast.error(err?.message || "Failed to load enquiries.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, q, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateRow(id: string, patch: Record<string, unknown>) {
    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "Failed to update.");
        return;
      }
      toast.success("Updated.");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update.");
    }
  }

  async function deleteRow(id: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    try {
      const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "Failed to delete.");
        return;
      }
      toast.success("Deleted.");
      load();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by name, email, phone, reference..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="input sm:w-56" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3">{c.label}</th>
              ))}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = row.id as string;
              const currentStatus = (row.status as string) || "NEW";
              const effectiveStatusOptions = statusOptions.includes(currentStatus)
                ? statusOptions
                : [currentStatus, ...statusOptions];

              return (
                <tr key={id} className="border-t border-border">
                  {columns.map((c) => (
                    <td key={c.key} className="whitespace-nowrap px-4 py-3">
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <select
                      className="input py-1.5 text-xs"
                      value={currentStatus}
                      onChange={(e) => updateRow(id, { status: e.target.value })}
                    >
                      {effectiveStatusOptions.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {expanded === id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="input min-h-16 text-xs"
                          defaultValue={(row.adminNotes as string) || ""}
                          onChange={(e) => setNotesDraft((d) => ({ ...d, [id]: e.target.value }))}
                        />
                        <button
                          className="btn-ghost self-start py-1 px-2.5 text-xs"
                          onClick={() => updateRow(id, { adminNotes: notesDraft[id] ?? row.adminNotes })}
                        >
                          <Save size={12} /> Save Note
                        </button>
                      </div>
                    ) : (
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => setExpanded(id)}
                      >
                        {row.adminNotes ? "Edit note" : "Add note"}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteRow(id)} className="text-danger hover:opacity-75" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 3} className="px-4 py-8 text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export { StatusBadge };
