"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Download, Trash2 } from "lucide-react";
import { BillingFormModal } from "@/components/admin/billing-form-modal";

type Quotation = {
  id: string;
  quotationNumber: string;
  date: string;
  billToName: string;
  totalAmount: number;
  status: string;
};

const STATUS_OPTIONS = ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"];

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/quotations");
    const json = await res.json();
    setQuotations(json.quotations || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update.");
      return;
    }
    load();
  }

  async function deleteQuotation(id: string) {
    if (!confirm("Delete this quotation? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
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
          <h1 className="font-display text-2xl font-bold">Quotations</h1>
          <p className="mt-1 text-sm text-muted">Price quotations, numbered sequentially by financial year.</p>
        </div>
        <button className="btn-accent" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Quotation
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Quotation No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Bill To</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {quotations.map((q) => (
              <tr key={q.id} className="border-t border-border">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-accent">{q.quotationNumber}</td>
                <td className="whitespace-nowrap px-4 py-3">{new Date(q.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{q.billToName}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatINR(q.totalAmount)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    className="input py-1.5 text-xs"
                    value={q.status}
                    onChange={(e) => updateStatus(q.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-3">
                    <a href={`/api/admin/quotations/${q.id}/pdf`} className="text-accent hover:opacity-75" aria-label="Download PDF">
                      <Download size={16} />
                    </a>
                    <button onClick={() => deleteQuotation(q.id)} className="text-danger hover:opacity-75" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No quotations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <BillingFormModal
          kind="quotation"
          apiBase="/api/admin/quotations"
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
