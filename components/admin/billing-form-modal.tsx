"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, X } from "lucide-react";
import { INDIAN_STATE_OPTIONS } from "@/lib/billing/indian-states";

type ItemRow = { name: string; hsnSac: string; quantity: string; pricePerUnit: string; gstRate: string };

const EMPTY_ITEM: ItemRow = { name: "", hsnSac: "", quantity: "1", pricePerUnit: "", gstRate: "18" };

export function BillingFormModal({
  kind,
  apiBase,
  onClose,
  onSaved,
}: {
  kind: "invoice" | "quotation";
  apiBase: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [billToName, setBillToName] = useState("");
  const [billToAddress, setBillToAddress] = useState("");
  const [billToPincode, setBillToPincode] = useState("");
  const [billToGstin, setBillToGstin] = useState("");
  const [billToState, setBillToState] = useState("08-Rajasthan");
  const [sameState, setSameState] = useState(true);
  const [sellerStateCode, setSellerStateCode] = useState("08-Rajasthan");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [secondaryDate, setSecondaryDate] = useState("");
  const [receivedAmount, setReceivedAmount] = useState("0");
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [discountValue, setDiscountValue] = useState("0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => {
        const code = json.settings?.invoice?.stateCode;
        if (code) {
          setSellerStateCode(code);
          setBillToState(code);
        }
      })
      .catch(() => {});
  }, []);

  function handleStateChange(value: string) {
    setBillToState(value);
    setSameState(value === sellerStateCode);
  }

  function updateItem(i: number, field: keyof ItemRow, value: string) {
    setItems((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addItem() {
    setItems((rows) => [...rows, { ...EMPTY_ITEM }]);
  }

  function removeItem(i: number) {
    setItems((rows) => rows.filter((_, idx) => idx !== i));
  }

  const subTotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.pricePerUnit) || 0), 0);
  const discountAmountPreview = Math.min(
    Math.max(discountType === "PERCENT" ? subTotal * ((Number(discountValue) || 0) / 100) : Number(discountValue) || 0, 0),
    subTotal
  );
  const taxableValue = subTotal - discountAmountPreview;
  const totalTax = items.reduce((sum, it) => {
    const amount = (Number(it.quantity) || 0) * (Number(it.pricePerUnit) || 0);
    const share = subTotal > 0 ? amount / subTotal : 0;
    const itemTaxable = amount - share * discountAmountPreview;
    return sum + itemTaxable * ((Number(it.gstRate) || 0) / 100);
  }, 0);
  const grandTotal = taxableValue + totalTax;

  async function handleSave() {
    if (!billToName.trim()) {
      toast.error("Bill-to name is required.");
      return;
    }
    if (items.some((it) => !it.name.trim() || !it.quantity || !it.pricePerUnit)) {
      toast.error("Every item needs a name, quantity, and price.");
      return;
    }

    setSaving(true);
    const payload = {
      billToName,
      billToAddress,
      billToPincode,
      billToGstin,
      billToState,
      sameState,
      date,
      discountType,
      discountValue: Number(discountValue) || 0,
      ...(kind === "invoice" ? { dueDate: secondaryDate || undefined, receivedAmount: Number(receivedAmount) || 0 } : {}),
      ...(kind === "quotation" ? { validUntil: secondaryDate || undefined } : {}),
      notes,
      items: items.map((it) => ({
        name: it.name,
        hsnSac: it.hsnSac,
        quantity: Number(it.quantity) || 0,
        pricePerUnit: Number(it.pricePerUnit) || 0,
        gstRate: Number(it.gstRate) || 0,
      })),
    };

    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error || "Failed to save.");
      return;
    }
    toast.success(`${kind === "invoice" ? "Invoice" : "Quotation"} created.`);
    onSaved();
  }

  const label = kind === "invoice" ? "Invoice" : "Quotation";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">New {label}</h2>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Bill To (Customer / Organization Name) *</label>
            <input className="input" value={billToName} onChange={(e) => setBillToName(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Bill To Address</label>
            <textarea className="input min-h-16" value={billToAddress} onChange={(e) => setBillToAddress(e.target.value)} />
          </div>
          <div>
            <label className="label">Pin Code</label>
            <input className="input" value={billToPincode} onChange={(e) => setBillToPincode(e.target.value)} />
          </div>
          <div>
            <label className="label">Customer GSTIN</label>
            <input className="input" value={billToGstin} onChange={(e) => setBillToGstin(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Customer State</label>
            <select className="input" value={billToState} onChange={(e) => handleStateChange(e.target.value)}>
              {INDIAN_STATE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{kind === "invoice" ? "Invoice" : "Quotation"} Date</label>
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="label">{kind === "invoice" ? "Due Date" : "Valid Until"}</label>
            <input className="input" type="date" value={secondaryDate} onChange={(e) => setSecondaryDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Discount Type</label>
            <select className="input" value={discountType} onChange={(e) => setDiscountType(e.target.value as "FLAT" | "PERCENT")}>
              <option value="FLAT">Flat (₹)</option>
              <option value="PERCENT">Percent (%)</option>
            </select>
          </div>
          <div>
            <label className="label">Discount Value</label>
            <input className="input" type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="sameState"
              type="checkbox"
              checked={sameState}
              onChange={(e) => setSameState(e.target.checked)}
            />
            <label htmlFor="sameState" className="text-sm">
              Customer is in the same state (charges CGST + SGST instead of IGST)
            </label>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Items</h3>
            <button className="btn-outline py-1.5 px-3 text-xs" onClick={addItem}>
              <Plus size={14} /> Add Item
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 rounded-md border border-border p-3">
                <input
                  className="input col-span-12 sm:col-span-4"
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(i, "name", e.target.value)}
                />
                <input
                  className="input col-span-4 sm:col-span-2"
                  placeholder="HSN/SAC"
                  value={item.hsnSac}
                  onChange={(e) => updateItem(i, "hsnSac", e.target.value)}
                />
                <input
                  className="input col-span-3 sm:col-span-2"
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, "quantity", e.target.value)}
                />
                <input
                  className="input col-span-5 sm:col-span-2"
                  type="number"
                  placeholder="Price/Unit"
                  value={item.pricePerUnit}
                  onChange={(e) => updateItem(i, "pricePerUnit", e.target.value)}
                />
                <input
                  className="input col-span-4 sm:col-span-1"
                  type="number"
                  placeholder="GST %"
                  value={item.gstRate}
                  onChange={(e) => updateItem(i, "gstRate", e.target.value)}
                />
                <button
                  className="col-span-2 flex items-center justify-center text-danger sm:col-span-1"
                  onClick={() => removeItem(i)}
                  disabled={items.length <= 1}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {kind === "invoice" && (
            <div>
              <label className="label">Amount Received Now (₹)</label>
              <input className="input" type="number" value={receivedAmount} onChange={(e) => setReceivedAmount(e.target.value)} />
            </div>
          )}
          <div className={kind === "invoice" ? "" : "sm:col-span-2"}>
            <label className="label">Notes</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="mt-6 rounded-md border border-border bg-surface-2 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted">Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
          {discountAmountPreview > 0 && (
            <div className="flex justify-between"><span className="text-muted">Discount</span><span>- ₹{discountAmountPreview.toFixed(2)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted">GST</span><span>₹{totalTax.toFixed(2)}</span></div>
          <div className="mt-1 flex justify-between border-t border-border pt-1 font-semibold">
            <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-accent">
            {saving ? "Saving..." : `Create ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
