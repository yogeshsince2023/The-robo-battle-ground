"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export type CrudField = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "date";
  options?: string[];
  required?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
};

type Row = Record<string, unknown>;

export function CrudManager({
  title,
  description,
  apiBase,
  fields,
  columns,
  listKey,
}: {
  title: string;
  description?: string;
  apiBase: string;
  fields: CrudField[];
  columns: { key: string; label: string; render?: (row: Row) => React.ReactNode }[];
  listKey: string;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(apiBase);
    const json = await res.json();
    setRows(json[listKey] || []);
  }, [apiBase, listKey]);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    const initial: Record<string, unknown> = {};
    for (const f of fields) initial[f.name] = f.type === "checkbox" ? true : "";
    setForm(initial);
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row: Row) {
    const prepared: Row = { ...row };
    for (const f of fields) {
      if (f.type === "date" && typeof prepared[f.name] === "string") {
        prepared[f.name] = (prepared[f.name] as string).slice(0, 10);
      }
    }
    setForm(prepared);
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `${apiBase}/${editing.id}` : apiBase;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Failed to save.");
      return;
    }
    toast.success(editing ? "Updated." : "Created.");
    setModalOpen(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    const res = await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        <button onClick={openCreate} className="btn-accent">
          <Plus size={16} /> Add New
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              {columns.map((c) => (
                <th key={c.key} className="whitespace-nowrap px-4 py-3">{c.label}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id as string} className="border-t border-border">
                {columns.map((c) => (
                  <td key={c.key} className="max-w-xs truncate px-4 py-3">
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => openEdit(row)} className="text-accent hover:opacity-75" aria-label="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(row.id as string)} className="text-danger hover:opacity-75" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-muted">
                  No records yet. Click &quot;Add New&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">{editing ? "Edit" : "Add"} {title}</h2>
              <button onClick={() => setModalOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <div key={f.name} className={f.fullWidth ? "sm:col-span-2" : ""}>
                  <label className="label">{f.label}{f.required && " *"}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      className="input min-h-24"
                      value={(form[f.name] as string) ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="input"
                      value={(form[f.name] as string) ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    >
                      <option value="">Select...</option>
                      {f.options?.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked }))}
                      />
                      Enabled
                    </label>
                  ) : (
                    <input
                      className="input"
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form[f.name] as string | number) ?? ""}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          [f.name]: f.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-accent">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
