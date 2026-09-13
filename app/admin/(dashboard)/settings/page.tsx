"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2 } from "lucide-react";

type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
};

const ROLES = ["SUPER_ADMIN", "ADMIN", "STAFF"];

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [newAdmin, setNewAdmin] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const [invoiceSettings, setInvoiceSettings] = useState<Record<string, string>>({});
  const [savingInvoice, setSavingInvoice] = useState(false);

  const loadAdmins = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const json = await res.json();
    setAdmins(json.admins || []);
  }, []);

  useEffect(() => {
    loadAdmins();
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => setInvoiceSettings(json.settings?.invoice || {}));
  }, [loadAdmins]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    const res = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setSavingPassword(false);
    if (!res.ok) {
      toast.error(json.error || "Failed to change password.");
      return;
    }
    toast.success("Password changed.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreatingAdmin(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdmin),
    });
    const json = await res.json();
    setCreatingAdmin(false);
    if (!res.ok) {
      toast.error(json.error || "Failed to create admin.");
      return;
    }
    toast.success(`Admin "${newAdmin.email}" created.`);
    setNewAdmin({ name: "", email: "", password: "", role: "ADMIN" });
    loadAdmins();
  }

  async function toggleActive(admin: AdminAccount) {
    const res = await fetch(`/api/admin/users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !admin.active }),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to update.");
      return;
    }
    toast.success(admin.active ? "Admin deactivated." : "Admin activated.");
    loadAdmins();
  }

  async function changeRole(admin: AdminAccount, role: string) {
    const res = await fetch(`/api/admin/users/${admin.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      toast.error("Failed to update role.");
      return;
    }
    loadAdmins();
  }

  async function deleteAdmin(admin: AdminAccount) {
    if (!confirm(`Delete admin "${admin.email}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${admin.id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error || "Failed to delete.");
      return;
    }
    toast.success("Admin deleted.");
    loadAdmins();
  }

  async function saveInvoiceSettings() {
    setSavingInvoice(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "invoice", value: invoiceSettings }),
    });
    setSavingInvoice(false);
    if (!res.ok) {
      toast.error("Failed to save.");
      return;
    }
    toast.success("Invoice settings saved.");
  }

  function setInvoiceField(field: string, value: string) {
    setInvoiceSettings((s) => ({ ...s, [field]: value }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage admin accounts, your password, and invoicing details.</p>
      </div>

      <form onSubmit={handleChangePassword} className="card max-w-md space-y-4">
        <h2 className="font-display text-lg font-bold">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input className="input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">New Password</label>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <input className="input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
        </div>
        <button type="submit" disabled={savingPassword} className="btn-accent">
          {savingPassword ? "Saving..." : "Change Password"}
        </button>
      </form>

      <div className="card max-w-2xl">
        <h2 className="font-display text-lg font-bold">Admin Users</h2>
        <p className="mt-1 text-sm text-muted">
          Manage who can access this dashboard. &quot;Super Admin&quot; has full access to every section,
          including Accounts and Partners.
        </p>

        <form onSubmit={handleCreateAdmin} className="mt-4 grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2">
          <input className="input" placeholder="Full name" value={newAdmin.name} onChange={(e) => setNewAdmin((s) => ({ ...s, name: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin((s) => ({ ...s, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Password (min 8 chars)" value={newAdmin.password} onChange={(e) => setNewAdmin((s) => ({ ...s, password: e.target.value }))} minLength={8} required />
          <select className="input" value={newAdmin.role} onChange={(e) => setNewAdmin((s) => ({ ...s, role: e.target.value }))}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
          <button type="submit" disabled={creatingAdmin} className="btn-accent sm:col-span-2 w-fit">
            <Plus size={16} /> {creatingAdmin ? "Creating..." : "Create Admin"}
          </button>
        </form>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-2">
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2">{a.name}</td>
                  <td className="px-3 py-2">{a.email}</td>
                  <td className="px-3 py-2">
                    <select className="input py-1 text-xs" value={a.role} onChange={(e) => changeRole(a, e.target.value)}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(a)}
                      className={`badge ${a.active ? "border-success/30 bg-success/10 text-success" : "border-border bg-surface-2 text-muted"}`}
                    >
                      {a.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => deleteAdmin(a)} className="text-danger hover:opacity-75" aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card max-w-2xl">
        <h2 className="font-display text-lg font-bold">Invoice Settings</h2>
        <p className="mt-1 text-sm text-muted">
          Used on every generated invoice and quotation PDF. Must match your GST registration exactly.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Legal Business Name (as per GST)</label>
            <input className="input" value={invoiceSettings.legalName || ""} onChange={(e) => setInvoiceField("legalName", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Legal Address</label>
            <textarea className="input min-h-16" value={invoiceSettings.legalAddress || ""} onChange={(e) => setInvoiceField("legalAddress", e.target.value)} />
          </div>
          <div>
            <label className="label">GSTIN</label>
            <input className="input" value={invoiceSettings.gstin || ""} onChange={(e) => setInvoiceField("gstin", e.target.value)} />
          </div>
          <div>
            <label className="label">State (code-name, e.g. 08-Rajasthan)</label>
            <input className="input" value={invoiceSettings.stateCode || ""} onChange={(e) => setInvoiceField("stateCode", e.target.value)} />
          </div>
          <div>
            <label className="label">Bank Name</label>
            <input className="input" value={invoiceSettings.bankName || ""} onChange={(e) => setInvoiceField("bankName", e.target.value)} />
          </div>
          <div>
            <label className="label">Bank Account Number</label>
            <input className="input" value={invoiceSettings.bankAccountNumber || ""} onChange={(e) => setInvoiceField("bankAccountNumber", e.target.value)} />
          </div>
          <div>
            <label className="label">IFSC Code</label>
            <input className="input" value={invoiceSettings.bankIfsc || ""} onChange={(e) => setInvoiceField("bankIfsc", e.target.value)} />
          </div>
          <div>
            <label className="label">Account Holder Name</label>
            <input className="input" value={invoiceSettings.bankAccountHolder || ""} onChange={(e) => setInvoiceField("bankAccountHolder", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Terms and Conditions (shown on PDFs)</label>
            <textarea className="input min-h-20" value={invoiceSettings.termsAndConditions || ""} onChange={(e) => setInvoiceField("termsAndConditions", e.target.value)} />
          </div>
        </div>
        <button className="btn-accent mt-4" disabled={savingInvoice} onClick={saveInvoiceSettings}>
          {savingInvoice ? "Saving..." : "Save Invoice Settings"}
        </button>
      </div>
    </div>
  );
}
