import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const CATEGORIES = ["Material", "Transport", "Equipment", "Salary", "Event Expense", "Maintenance", "Other"];

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const expenses = await prisma.expenseTransaction.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ expenses, categories: CATEGORIES });
}

export async function POST(req: NextRequest) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  if (!body?.date || !body?.amount || !body?.category) {
    return NextResponse.json({ error: "Date, amount and category are required." }, { status: 400 });
  }

  const entry = await prisma.expenseTransaction.create({
    data: {
      date: new Date(body.date),
      amount: Number(body.amount),
      paidTo: body.paidTo || "",
      category: body.category,
      description: body.description || "",
      paymentMethod: body.paymentMethod || "",
      referenceNumber: body.referenceNumber || "",
      notes: body.notes || "",
    },
  });

  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "Expense",
    entityId: entry.id,
    description: `Recorded expense of ₹${entry.amount} (${entry.category})`,
  });

  return NextResponse.json({ entry }, { status: 201 });
}
