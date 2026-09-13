"use client";

import { CrudManager } from "@/components/admin/crud-manager";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const CATEGORIES = ["Material", "Transport", "Equipment", "Salary", "Event Expense", "Maintenance", "Other"];

export default function ExpensesAdminPage() {
  return (
    <CrudManager
      title="Expenses"
      description="Record all money going out of the business. This section is private and admin-only."
      apiBase="/api/admin/accounts/expenses"
      listKey="expenses"
      columns={[
        { key: "date", label: "Date", render: (r) => new Date(r.date as string).toLocaleDateString() },
        { key: "category", label: "Category" },
        { key: "paidTo", label: "Paid To" },
        { key: "amount", label: "Amount", render: (r) => formatINR(r.amount as number) },
        { key: "paymentMethod", label: "Method" },
      ]}
      fields={[
        { name: "date", label: "Date", type: "date", required: true },
        { name: "amount", label: "Amount (₹)", type: "number", required: true },
        { name: "category", label: "Category", type: "select", options: CATEGORIES, required: true },
        { name: "paidTo", label: "Paid To", type: "text" },
        { name: "description", label: "Description", type: "textarea", fullWidth: true },
        { name: "paymentMethod", label: "Payment Method", type: "text", placeholder: "Cash / UPI / Bank Transfer" },
        { name: "referenceNumber", label: "Reference Number", type: "text" },
        { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
      ]}
    />
  );
}
