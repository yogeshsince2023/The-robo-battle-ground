import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { nextQuotationNumber } from "@/lib/billing/numbering";
import { calculateGstTotals, type LineItem } from "@/lib/billing/gst";
import { numberToIndianWords } from "@/lib/billing/number-to-words";
import { getInvoiceSettings } from "@/lib/settings";

export async function GET() {
  const quotations = await prisma.quotation.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ quotations });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.billToName || !Array.isArray(body?.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Bill-to name and at least one item are required." }, { status: 400 });
  }

  const items: LineItem[] = body.items.map((it: LineItem) => ({
    name: it.name,
    hsnSac: it.hsnSac || "",
    quantity: Number(it.quantity) || 0,
    pricePerUnit: Number(it.pricePerUnit) || 0,
    gstRate: Number(it.gstRate) || 0,
  }));

  const invoiceSettings = await getInvoiceSettings();
  const sameState = body.sameState !== undefined ? Boolean(body.sameState) : true;
  const discountType = body.discountType === "PERCENT" ? "PERCENT" : "FLAT";
  const discountValue = Number(body.discountValue) || 0;
  const totals = calculateGstTotals(items, sameState, { type: discountType, value: discountValue });
  const { financialYear, sequence, number } = await nextQuotationNumber();

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: number,
      financialYear,
      sequence,
      date: body.date ? new Date(body.date) : new Date(),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      billToName: body.billToName,
      billToAddress: body.billToAddress || "",
      billToPincode: body.billToPincode || "",
      billToGstin: body.billToGstin || "",
      billToState: body.billToState || "",
      placeOfSupply: body.placeOfSupply || body.billToState || invoiceSettings.stateCode,
      items: JSON.stringify(items),
      subTotal: totals.subTotal,
      discountType,
      discountValue,
      discountAmount: totals.discountAmount,
      cgstAmount: totals.cgstAmount,
      sgstAmount: totals.sgstAmount,
      igstAmount: totals.igstAmount,
      totalTax: totals.totalTax,
      totalAmount: totals.totalAmount,
      amountInWords: numberToIndianWords(totals.totalAmount),
      notes: body.notes || "",
      status: body.status || "DRAFT",
      linkedMachiningRequestId: body.linkedMachiningRequestId || null,
    },
  });

  const admin = await getCurrentAdmin();
  await logAudit({
    actor: admin,
    action: "CREATE",
    entityType: "Quotation",
    entityId: quotation.id,
    description: `Created quotation ${quotation.quotationNumber} for ${quotation.billToName} (₹${quotation.totalAmount})`,
  });

  return NextResponse.json({ quotation }, { status: 201 });
}
