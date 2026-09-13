"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  GraduationCap,
  Cog,
  FolderKanban,
  BadgeCheck,
  FileText,
  Wallet,
  Settings,
  LogOut,
  ChevronDown,
  ScrollText,
  Receipt,
} from "lucide-react";
import { useState } from "react";

type NavItem = {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Enquiries",
    icon: Swords,
    children: [
      { label: "Arena", href: "/admin/enquiries/arena" },
      { label: "Training", href: "/admin/enquiries/training" },
      { label: "Machining", href: "/admin/enquiries/machining" },
      { label: "Contact", href: "/admin/enquiries/contact" },
    ],
  },
  {
    label: "Training",
    icon: GraduationCap,
    children: [
      { label: "Courses", href: "/admin/training/courses" },
      { label: "Registrations", href: "/admin/training/registrations" },
    ],
  },
  {
    label: "Machining",
    icon: Cog,
    children: [
      { label: "Services", href: "/admin/machining/services" },
      { label: "Quotation Requests", href: "/admin/machining/requests" },
    ],
  },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Certificates", href: "/admin/certificates", icon: BadgeCheck },
  { label: "Website Content", href: "/admin/content", icon: FileText },
  {
    label: "Billing",
    icon: Receipt,
    children: [
      { label: "Invoices", href: "/admin/billing/invoices" },
      { label: "Quotations", href: "/admin/billing/quotations" },
    ],
  },
  {
    label: "Accounts",
    icon: Wallet,
    children: [
      { label: "Income", href: "/admin/accounts/income" },
      { label: "Expenses", href: "/admin/accounts/expenses" },
      { label: "Balance", href: "/admin/accounts/balance" },
      { label: "Partners", href: "/admin/accounts/partners" },
    ],
  },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of NAV) {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        initial[item.label] = true;
      }
    }
    return initial;
  });

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border p-4">
        <p className="font-display text-sm font-bold">Admin Dashboard</p>
        <p className="mt-0.5 truncate text-xs text-muted">{adminName}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          if (!item.children) {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent/10 text-accent" : "text-foreground/85 hover:bg-surface-2"
                }`}
              >
                <item.icon size={16} /> {item.label}
              </Link>
            );
          }
          const open = openGroups[item.label];
          return (
            <div key={item.label}>
              <button
                onClick={() => setOpenGroups((g) => ({ ...g, [item.label]: !g[item.label] }))}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-foreground/85 hover:bg-surface-2"
              >
                <span className="flex items-center gap-2.5"><item.icon size={16} /> {item.label}</span>
                <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                  {item.children.map((c) => {
                    const active = pathname.startsWith(c.href);
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                          active ? "text-accent" : "text-foreground/75 hover:text-foreground"
                        }`}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-surface-2"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
