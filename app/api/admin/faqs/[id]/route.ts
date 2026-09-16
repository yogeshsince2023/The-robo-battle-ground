import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const faq = await prisma.faq.update({
    where: { id },
    data: { category: body.category, question: body.question, answer: body.answer },
  });
  return NextResponse.json({ faq });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.faq.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
