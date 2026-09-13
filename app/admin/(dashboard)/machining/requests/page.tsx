"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Trash2, Download } from "lucide-react";

type FileRef = { id: string; originalName: string; size: number };
type Req = {
  id: string;
  referenceNo: string;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  serviceType: string;
  material: string | null;
  quantity: number | null;
  tolerance: string | null;
  instructions: string | null;
  status: string;
  quotationAmount: number | null;
  estimatedDelivery: string | null;
  adminNotes: string | null;
  files: FileRef[];
  createdAt: string;
};

const STATUS_OPTIONS = ["NEW", "UNDER_REVIEW", "QUOTED", "APPROVED", "REJECTED", "COMPLETED"];

export default function MachiningRequestsPage() {
  const [rows, setRows] = useState<Req[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Partial<Req>>>({});

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/admin/machining/requests?${params.toString()}`);
    const json = await res.json();
    setRows(json.requests || []);
  }, [q, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function save(id: string) {
    const patch = drafts[id];
    if (!patch) return;
    const res = await fetch(`/api/admin/machining/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      toast.error("Failed to save.");
      return;
    }
    toast.success("Saved.");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this quotation request and its files? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/machining/requests/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Machining Quotation Requests</h1>
      <p className="mt-1 text-sm text-muted">
        Review submitted designs, download CAD files, and manage quotations. Financial fields here are
        never shown to customers.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input sm:w-56" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((r) => {
          return (
            <div key={r.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display font-bold text-accent">{r.referenceNo}</p>
                  <p className="text-sm">{r.name} {r.company && <span className="text-muted">· {r.company}</span>}</p>
                  <p className="text-xs text-muted">{r.email} · {r.phone}</p>
                </div>
                <button onClick={() => remove(r.id)} className="text-danger hover:opacity-75" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Info label="Service" value={r.serviceType} />
                <Info label="Material" value={r.material || "—"} />
                <Info label="Quantity" value={r.quantity ? String(r.quantity) : "—"} />
                <Info label="Tolerance" value={r.tolerance || "—"} />
              </div>

              {r.instructions && (
                <p className="mt-3 text-sm text-muted">
                  <span className="font-semibold text-foreground">Instructions: </span>{r.instructions}
                </p>
              )}

              {r.files.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Design Files</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.files.map((f) => (
                      <a
                        key={f.id}
                        href={`/api/admin/files/${f.id}`}
                        className="badge inline-flex items-center gap-1.5 border-border bg-surface-2 hover:border-accent"
                      >
                        <Download size={12} /> {f.originalName} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    defaultValue={r.status}
                    onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...d[r.id], status: e.target.value } }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Quotation Amount (₹)</label>
                  <input
                    className="input"
                    type="number"
                    defaultValue={r.quotationAmount ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [r.id]: { ...d[r.id], quotationAmount: e.target.value ? Number(e.target.value) : null } }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Estimated Delivery</label>
                  <input
                    className="input"
                    placeholder="e.g. 10 working days"
                    defaultValue={r.estimatedDelivery ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...d[r.id], estimatedDelivery: e.target.value } }))}
                  />
                </div>
                <div>
                  <label className="label">Internal Notes</label>
                  <input
                    className="input"
                    defaultValue={r.adminNotes ?? ""}
                    onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...d[r.id], adminNotes: e.target.value } }))}
                  />
                </div>
              </div>

              <button
                onClick={() => save(r.id)}
                disabled={!drafts[r.id]}
                className="btn-accent mt-4"
              >
                Save Changes
              </button>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-muted">No quotation requests found.</p>}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm">{value}</p>
    </div>
  );
}
