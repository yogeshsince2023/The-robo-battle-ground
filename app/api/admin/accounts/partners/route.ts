import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const partners = await prisma.partner.findMany({
    orderBy: { slotLabel: "asc" },
    include: { transactions: { orderBy: { date: "desc" } } },
  });

  const summary = partners.map((p) => ({
    id: p.id,
    name: p.name,
    slotLabel: p.slotLabel,
    totalTaken: p.transactions.reduce((sum, t) => sum + t.amount, 0),
    lastTransaction: p.transactions[0] || null,
    transactions: p.transactions,
  }));

  return NextResponse.json({ partners: summary });
}
