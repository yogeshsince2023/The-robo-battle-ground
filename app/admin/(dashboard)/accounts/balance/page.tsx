"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

type BalanceData = {
  totals: { totalIncome: number; totalExpense: number; balance: number; totalPartnerWithdrawals: number };
  byMonth: { month: string; income: number; expense: number; withdrawal: number }[];
  incomeByCategory: { category: string; amount: number }[];
  expenseByCategory: { category: string; amount: number }[];
  partnerWithdrawals: { partner: string; amount: number }[];
};

const PIE_COLORS = ["#ff6a1a", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#ec4899"];

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

const RANGE_OPTIONS = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

export default function BalancePage() {
  const [range, setRange] = useState("this_year");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<BalanceData | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ range });
    if (range === "custom") {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    }
    const res = await fetch(`/api/admin/accounts/balance?${params.toString()}`);
    const json = await res.json();
    setData(json);
  }, [range, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Balance & Financial Overview</h1>
      <p className="mt-1 text-sm text-muted">Private financial summary — visible to admins only.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select className="input sm:w-52" value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {range === "custom" && (
          <>
            <input type="date" className="input sm:w-44" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-muted">to</span>
            <input type="date" className="input sm:w-44" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Total Income" value={data ? formatINR(data.totals.totalIncome) : "—"} />
        <Card label="Total Expenses" value={data ? formatINR(data.totals.totalExpense) : "—"} />
        <Card label="Net Balance (after withdrawals)" value={data ? formatINR(data.totals.balance) : "—"} />
        <Card label="Partner Withdrawals" value={data ? formatINR(data.totals.totalPartnerWithdrawals) : "—"} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-base font-bold">Income vs Expenses</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b33" />
                <XAxis dataKey="month" stroke="#98a1ad" fontSize={11} />
                <YAxis stroke="#98a1ad" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1b1e24", border: "1px solid #262b33" }} formatter={(v) => formatINR(Number(v))} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-base font-bold">Net Balance Trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={(data?.byMonth || []).map((m) => ({ month: m.month, net: m.income - m.expense - m.withdrawal }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b33" />
                <XAxis dataKey="month" stroke="#98a1ad" fontSize={11} />
                <YAxis stroke="#98a1ad" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1b1e24", border: "1px solid #262b33" }} formatter={(v) => formatINR(Number(v))} />
                <Line type="monotone" dataKey="net" name="Net Balance" stroke="#ff6a1a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-base font-bold">Income by Category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.incomeByCategory || []} dataKey="amount" nameKey="category" outerRadius={90} label>
                  {(data?.incomeByCategory || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1b1e24", border: "1px solid #262b33" }} formatter={(v) => formatINR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="font-display text-base font-bold">Expense by Category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.expenseByCategory || []} dataKey="amount" nameKey="category" outerRadius={90} label>
                  {(data?.expenseByCategory || []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1b1e24", border: "1px solid #262b33" }} formatter={(v) => formatINR(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="font-display text-base font-bold">Partner Withdrawals</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.partnerWithdrawals || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262b33" />
                <XAxis dataKey="partner" stroke="#98a1ad" fontSize={11} />
                <YAxis stroke="#98a1ad" fontSize={11} />
                <Tooltip contentStyle={{ background: "#1b1e24", border: "1px solid #262b33" }} formatter={(v) => formatINR(Number(v))} />
                <Bar dataKey="amount" name="Withdrawn" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}
