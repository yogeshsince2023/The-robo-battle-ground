import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { startOfMonth, subMonths, startOfYear, format } from "date-fns";

function resolveRange(searchParams: URLSearchParams) {
  const preset = searchParams.get("range") || "this_year";
  const now = new Date();

  if (preset === "custom") {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    return {
      start: from ? new Date(from) : startOfYear(now),
      end: to ? new Date(to) : now,
    };
  }
  if (preset === "this_month") {
    return { start: startOfMonth(now), end: now };
  }
  if (preset === "last_month") {
    const start = startOfMonth(subMonths(now, 1));
    const end = startOfMonth(now);
    return { start, end };
  }
  // this_year default
  return { start: startOfYear(now), end: now };
}

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { start, end } = resolveRange(req.nextUrl.searchParams);
  const dateWhere = { gte: start, lte: end };

  const [income, expenses, partnerTx] = await Promise.all([
    prisma.incomeTransaction.findMany({ where: { date: dateWhere } }),
    prisma.expenseTransaction.findMany({ where: { date: dateWhere } }),
    prisma.partnerTransaction.findMany({ where: { date: dateWhere }, include: { partner: true } }),
  ]);

  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0);
  const totalPartnerWithdrawals = partnerTx.reduce((s, t) => s + t.amount, 0);
  // Net balance = income - expenses - partner withdrawals (withdrawals are cash
  // leaving the business, same as an expense from a cash-in-hand perspective).
  const balance = totalIncome - totalExpense - totalPartnerWithdrawals;

  const byMonthMap = new Map<string, { income: number; expense: number; withdrawal: number }>();
  for (const t of income) {
    const key = format(t.date, "MMM yyyy");
    const entry = byMonthMap.get(key) || { income: 0, expense: 0, withdrawal: 0 };
    entry.income += t.amount;
    byMonthMap.set(key, entry);
  }
  for (const t of expenses) {
    const key = format(t.date, "MMM yyyy");
    const entry = byMonthMap.get(key) || { income: 0, expense: 0, withdrawal: 0 };
    entry.expense += t.amount;
    byMonthMap.set(key, entry);
  }
  for (const t of partnerTx) {
    const key = format(t.date, "MMM yyyy");
    const entry = byMonthMap.get(key) || { income: 0, expense: 0, withdrawal: 0 };
    entry.withdrawal += t.amount;
    byMonthMap.set(key, entry);
  }
  const byMonth = Array.from(byMonthMap.entries())
    .map(([month, v]) => ({ month, ...v }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const incomeByCategory = Object.entries(
    income.reduce<Record<string, number>>((acc, t) => {
      acc[t.source] = (acc[t.source] || 0) + t.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  const expenseByCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({ category, amount }));

  const partnerWithdrawals = Object.entries(
    partnerTx.reduce<Record<string, number>>((acc, t) => {
      const label = t.partner.name;
      acc[label] = (acc[label] || 0) + t.amount;
      return acc;
    }, {})
  ).map(([partner, amount]) => ({ partner, amount }));

  return NextResponse.json({
    range: { start, end },
    totals: { totalIncome, totalExpense, balance, totalPartnerWithdrawals },
    byMonth,
    incomeByCategory,
    expenseByCategory,
    partnerWithdrawals,
  });
}
