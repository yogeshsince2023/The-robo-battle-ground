"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingDown,
  Scale,
  Users,
  Swords,
  GraduationCap,
  Cog,
  Mail,
} from "lucide-react";

type DashboardData = {
  counts: {
    arenaCount: number;
    trainingCount: number;
    machiningCount: number;
    contactCount: number;
    projectCount: number;
    certificateCount: number;
    pendingQuotations: number;
  };
  finance: { totalIncome: number; totalExpense: number; balance: number; partnerWithdrawals: number };
  monthlySeries: { month: string; income: number; expense: number }[];
  recentActivity: { type: string; ref: string; name: string; date: string }[];
};

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Business overview and recent activity.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FinanceCard icon={Wallet} label="Revenue" value={data ? formatINR(data.finance.totalIncome) : "—"} tone="success" />
        <FinanceCard icon={TrendingDown} label="Expenses" value={data ? formatINR(data.finance.totalExpense) : "—"} tone="danger" />
        <FinanceCard icon={Scale} label="Current Balance" value={data ? formatINR(data.finance.balance) : "—"} tone="accent" />
        <FinanceCard icon={Users} label="Partner Withdrawals" value={data ? formatINR(data.finance.partnerWithdrawals) : "—"} tone="muted" />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Swords} label="Arena Enquiries" value={data?.counts.arenaCount} href="/admin/enquiries/arena" />
        <StatCard icon={GraduationCap} label="Training Enquiries" value={data?.counts.trainingCount} href="/admin/enquiries/training" />
        <StatCard icon={Cog} label="Machining Requests" value={data?.counts.machiningCount} href="/admin/machining/requests" />
        <StatCard icon={Mail} label="Pending Quotations" value={data?.counts.pendingQuotations} href="/admin/machining/requests" />
      </div>

      <div className="mt-8 card">
        <h2 className="font-display text-lg font-bold">Revenue vs Expenses (last 6 months)</h2>
        <div className="mt-4 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.monthlySeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262b33" />
              <XAxis dataKey="month" stroke="#98a1ad" fontSize={12} />
              <YAxis stroke="#98a1ad" fontSize={12} />
              <Tooltip
                contentStyle={{ background: "#1b1e24", border: "1px solid #262b33", borderRadius: 8 }}
                formatter={(v) => formatINR(Number(v))}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card overflow-x-auto">
        <h2 className="font-display text-lg font-bold">Recent Activity</h2>
        <table className="mt-4 w-full min-w-[500px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Reference</th>
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentActivity.map((a) => (
              <tr key={a.ref} className="border-b border-border/60">
                <td className="py-2 pr-4">{a.type}</td>
                <td className="py-2 pr-4 font-medium text-accent">{a.ref}</td>
                <td className="py-2 pr-4">{a.name}</td>
                <td className="py-2 text-muted">{new Date(a.date).toLocaleString()}</td>
              </tr>
            ))}
            {data && data.recentActivity.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-muted">No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinanceCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone: "success" | "danger" | "accent" | "muted";
}) {
  const toneClass = {
    success: "text-success bg-success/10",
    danger: "text-danger bg-danger/10",
    accent: "text-accent bg-accent/10",
    muted: "text-muted bg-surface-2",
  }[tone];
  return (
    <div className="card">
      <span className={`flex h-9 w-9 items-center justify-center rounded-md ${toneClass}`}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Swords;
  label: string;
  value: number | undefined;
  href: string;
}) {
  return (
    <Link href={href} className="card block hover:border-accent/50">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-2 text-accent">
        <Icon size={18} />
      </span>
      <p className="mt-3 text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value ?? "—"}</p>
    </Link>
  );
}
