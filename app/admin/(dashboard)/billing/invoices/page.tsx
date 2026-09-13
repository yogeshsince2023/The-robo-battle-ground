"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Download, Trash2 } from "lucide-react";
import { BillingFormModal } from "@/components/admin/billing-form-modal";

type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  billToName: string;
  totalAmount: number;
  receivedAmount: number;
  balanceAmount: number;
  status: string;
};

const STATUS_OPTIONS = ["DRAFT", "SENT", "PAID", "PARTIALLY_PAID", "CANCELLED"];

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/invoices");
    const json = await res.json();
    setInvoices(json.invoices || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/invoices/${id}`, {
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

  async function deleteInvoice(id: string) {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/invoices/${id}`, { method: "DELETE" });
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
          <h1 className="font-display text-2xl font-bold">Invoices</h1>
          <p className="mt-1 text-sm text-muted">GST tax invoices, numbered sequentially by financial year.</p>
        </div>
        <button className="btn-accent" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Invoice
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-surface-2">
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Invoice No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Bill To</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-border">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-accent">{inv.invoiceNumber}</td>
                <td className="whitespace-nowrap px-4 py-3">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{inv.billToName}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatINR(inv.totalAmount)}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatINR(inv.balanceAmount)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    className="input py-1.5 text-xs"
                    value={inv.status}
                    onChange={(e) => updateStatus(inv.id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex gap-3">
                    <a href={`/api/admin/invoices/${inv.id}/pdf`} className="text-accent hover:opacity-75" aria-label="Download PDF">
                      <Download size={16} />
                    </a>
                    <button onClick={() => deleteInvoice(inv.id)} className="text-danger hover:opacity-75" aria-label="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <BillingFormModal
          kind="invoice"
          apiBase="/api/admin/invoices"
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
