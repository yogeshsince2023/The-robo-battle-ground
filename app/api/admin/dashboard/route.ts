import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  const [
    arenaCount,
    trainingCount,
    machiningCount,
    contactCount,
    projectCount,
    certificateCount,
    pendingQuotations,
    incomeAgg,
    expenseAgg,
    partnerAgg,
    recentArena,
    recentTraining,
    recentMachining,
    recentContact,
  ] = await Promise.all([
    prisma.arenaEnquiry.count(),
    prisma.trainingEnquiry.count(),
    prisma.machiningRequest.count(),
    prisma.contactMessage.count(),
    prisma.project.count(),
    prisma.certificate.count(),
    prisma.machiningRequest.count({ where: { status: { in: ["NEW", "UNDER_REVIEW"] } } }),
    prisma.incomeTransaction.aggregate({ _sum: { amount: true } }),
    prisma.expenseTransaction.aggregate({ _sum: { amount: true } }),
    prisma.partnerTransaction.aggregate({ _sum: { amount: true } }),
    prisma.arenaEnquiry.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.trainingEnquiry.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.machiningRequest.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const partnerWithdrawals = partnerAgg._sum.amount || 0;
  // Income already includes invoice payments (auto-recorded when an invoice is
  // marked PAID). Net balance also subtracts partner withdrawals — cash taken
  // out of the business, same as an expense from a cash-in-hand perspective.
  const balance = totalIncome - totalExpense - partnerWithdrawals;

  // Last 6 months income/expense series
  const months: { key: string; label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = startOfMonth(subMonths(new Date(), i));
    const end = startOfMonth(subMonths(new Date(), i - 1));
    months.push({ key: format(start, "yyyy-MM"), label: format(start, "MMM yy"), start, end });
  }

  const monthlySeries = await Promise.all(
    months.map(async (m) => {
      const [income, expense] = await Promise.all([
        prisma.incomeTransaction.aggregate({
          _sum: { amount: true },
          where: { date: { gte: m.start, lt: m.end } },
        }),
        prisma.expenseTransaction.aggregate({
          _sum: { amount: true },
          where: { date: { gte: m.start, lt: m.end } },
        }),
      ]);
      return {
        month: m.label,
        income: income._sum.amount || 0,
        expense: expense._sum.amount || 0,
      };
    })
  );

  const recentActivity = [
    ...recentArena.map((r) => ({ type: "Arena Enquiry", ref: r.referenceNo, name: r.name, date: r.createdAt })),
    ...recentTraining.map((r) => ({ type: "Training Enquiry", ref: r.referenceNo, name: r.studentName, date: r.createdAt })),
    ...recentMachining.map((r) => ({ type: "Machining Request", ref: r.referenceNo, name: r.name, date: r.createdAt })),
    ...recentContact.map((r) => ({ type: "Contact Message", ref: r.referenceNo, name: r.name, date: r.createdAt })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return NextResponse.json({
    counts: {
      arenaCount,
      trainingCount,
      machiningCount,
      contactCount,
      projectCount,
      certificateCount,
      pendingQuotations,
    },
    finance: { totalIncome, totalExpense, balance, partnerWithdrawals },
    monthlySeries,
    recentActivity,
  });
}
