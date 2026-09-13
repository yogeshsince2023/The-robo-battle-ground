"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2, X } from "lucide-react";

type Transaction = {
  id: string;
  date: string;
  amount: number;
  reason: string | null;
  paymentMethod: string | null;
  referenceNumber: string | null;
  notes: string | null;
};

type PartnerSummary = {
  id: string;
  name: string;
  slotLabel: string;
  totalTaken: number;
  lastTransaction: Transaction | null;
  transactions: Transaction[];
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [renaming, setRenaming] = useState<PartnerSummary | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [txModalFor, setTxModalFor] = useState<PartnerSummary | null>(null);
  const [txForm, setTxForm] = useState({ date: "", amount: "", reason: "", paymentMethod: "", referenceNumber: "", notes: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/accounts/partners");
    const json = await res.json();
    setPartners(json.partners || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalWithdrawals = partners.reduce((s, p) => s + p.totalTaken, 0);

  async function saveRename() {
    if (!renaming) return;
    const res = await fetch(`/api/admin/accounts/partners/${renaming.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameDraft }),
    });
    if (!res.ok) {
      toast.error("Failed to rename.");
      return;
    }
    toast.success("Partner renamed.");
    setRenaming(null);
    load();
  }

  async function addTransaction() {
    if (!txModalFor || !txForm.date || !txForm.amount) {
      toast.error("Date and amount are required.");
      return;
    }
    const res = await fetch(`/api/admin/accounts/partners/${txModalFor.id}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...txForm, amount: Number(txForm.amount) }),
    });
    if (!res.ok) {
      toast.error("Failed to add transaction.");
      return;
    }
    toast.success("Transaction added.");
    setTxModalFor(null);
    setTxForm({ date: "", amount: "", reason: "", paymentMethod: "", referenceNumber: "", notes: "" });
    load();
  }

  async function deleteTransaction(partnerId: string, txId: string) {
    if (!confirm("Delete this transaction?")) return;
    const res = await fetch(`/api/admin/accounts/partners/${partnerId}/transactions/${txId}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Partners</h1>
      <p className="mt-1 text-sm text-muted">
        Private partner withdrawal tracking. Never shown on the public website.
      </p>

      <div className="mt-6 card">
        <p className="text-xs uppercase tracking-wide text-muted">Total Partner Withdrawals</p>
        <p className="mt-1 text-2xl font-bold text-accent">{formatINR(totalWithdrawals)}</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {partners.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">{p.slotLabel}</p>
                <h2 className="font-display text-lg font-bold">{p.name}</h2>
              </div>
              <button
                onClick={() => { setRenaming(p); setNameDraft(p.name); }}
                className="text-accent hover:opacity-75"
                aria-label="Rename partner"
              >
                <Pencil size={16} />
              </button>
            </div>
            <p className="mt-3 text-2xl font-bold">{formatINR(p.totalTaken)}</p>
            <p className="text-xs text-muted">
              Last transaction: {p.lastTransaction ? new Date(p.lastTransaction.date).toLocaleDateString() : "—"}
            </p>

            <button
              onClick={() => setTxModalFor(p)}
              className="btn-outline mt-4 py-1.5 text-xs"
            >
              <Plus size={14} /> Add Transaction
            </button>

            {p.transactions.length > 0 && (
              <div className="mt-4 max-h-48 overflow-y-auto border-t border-border pt-3">
                {p.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b border-border/60 py-2 text-xs">
                    <div>
                      <p className="font-medium">{formatINR(t.amount)} <span className="text-muted">· {new Date(t.date).toLocaleDateString()}</span></p>
                      {t.reason && <p className="text-muted">{t.reason}</p>}
                    </div>
                    <button onClick={() => deleteTransaction(p.id, t.id)} className="text-danger hover:opacity-75" aria-label="Delete transaction">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {renaming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Rename Partner</h2>
              <button onClick={() => setRenaming(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <label className="label mt-4">Partner Name</label>
            <input className="input" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} />
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setRenaming(null)} className="btn-outline">Cancel</button>
              <button onClick={saveRename} className="btn-accent">Save</button>
            </div>
          </div>
        </div>
      )}

      {txModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-lg border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Add Transaction — {txModalFor.name}</h2>
              <button onClick={() => setTxModalFor(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Date *</label>
                <input type="date" className="input" value={txForm.date} onChange={(e) => setTxForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <label className="label">Amount (₹) *</label>
                <input type="number" className="input" value={txForm.amount} onChange={(e) => setTxForm((f) => ({ ...f, amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Reason</label>
                <input className="input" value={txForm.reason} onChange={(e) => setTxForm((f) => ({ ...f, reason: e.target.value }))} />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <input className="input" value={txForm.paymentMethod} onChange={(e) => setTxForm((f) => ({ ...f, paymentMethod: e.target.value }))} />
              </div>
              <div>
                <label className="label">Reference Number</label>
                <input className="input" value={txForm.referenceNumber} onChange={(e) => setTxForm((f) => ({ ...f, referenceNumber: e.target.value }))} />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input min-h-16" value={txForm.notes} onChange={(e) => setTxForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setTxModalFor(null)} className="btn-outline">Cancel</button>
              <button onClick={addTransaction} className="btn-accent">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
