import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const faqs = await prisma.faq.findMany({ orderBy: [{ category: "asc" }, { displayOrder: "asc" }] });
  return NextResponse.json({ faqs });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.question || !body?.answer || !body?.category) {
    return NextResponse.json({ error: "Category, question and answer are required." }, { status: 400 });
  }
  const faq = await prisma.faq.create({
    data: { category: body.category, question: body.question, answer: body.answer, displayOrder: 0 },
  });
  return NextResponse.json({ faq }, { status: 201 });
}
