"use client";

import { CrudManager } from "@/components/admin/crud-manager";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const SOURCES = ["Arena Rental", "Training", "Machining", "Project", "Sponsorship", "Other"];

export default function IncomeAdminPage() {
  return (
    <CrudManager
      title="Income"
      description="Record all money coming into the business. This section is private and admin-only."
      apiBase="/api/admin/accounts/income"
      listKey="income"
      columns={[
        { key: "date", label: "Date", render: (r) => new Date(r.date as string).toLocaleDateString() },
        { key: "source", label: "Source" },
        { key: "amount", label: "Amount", render: (r) => formatINR(r.amount as number) },
        { key: "paymentMethod", label: "Method" },
        { key: "referenceNumber", label: "Reference" },
      ]}
      fields={[
        { name: "date", label: "Date", type: "date", required: true },
        { name: "amount", label: "Amount (₹)", type: "number", required: true },
        { name: "source", label: "Source", type: "select", options: SOURCES, required: true },
        { name: "description", label: "Description", type: "textarea", fullWidth: true },
        { name: "paymentMethod", label: "Payment Method", type: "text", placeholder: "Cash / UPI / Bank Transfer" },
        { name: "referenceNumber", label: "Reference Number", type: "text" },
        { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
      ]}
    />
  );
}
