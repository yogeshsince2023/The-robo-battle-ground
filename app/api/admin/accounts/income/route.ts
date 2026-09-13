import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { logAudit } from "@/lib/audit";

const SOURCES = ["Arena Rental", "Training", "Machining", "Project", "Sponsorship", "Other"];

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const income = await prisma.incomeTransaction.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json({ income, sources: SOURCES });
}

export async function POST(req: NextRequest) {
  const { response, admin } = await requireAdmin();
  if (response) return response;

  const body = await req.json().catch(() => null);
  if (!body?.date || !body?.amount || !body?.source) {
    return NextResponse.json({ error: "Date, amount and source are required." }, { status: 400 });
  }

  const entry = await prisma.incomeTransaction.create({
    data: {
      date: new Date(body.date),
      amount: Number(body.amount),
      source: body.source,
      description: body.description || "",
      paymentMethod: body.paymentMethod || "",
      referenceNumber: body.referenceNumber || "",
      notes: body.notes || "",
    },
  });

  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "Income",
    entityId: entry.id,
    description: `Recorded income of ₹${entry.amount} (${entry.source})`,
  });

  return NextResponse.json({ entry }, { status: 201 });
}
