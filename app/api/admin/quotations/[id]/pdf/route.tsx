import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings, getInvoiceSettings } from "@/lib/settings";
import { BillingDocument, type BillingDocumentData } from "@/components/pdf/BillingDocument";
import type { LineItem } from "@/lib/billing/gst";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const business = await getBusinessSettings();
  const invoiceSettings = await getInvoiceSettings();
  const items: LineItem[] = JSON.parse(quotation.items);
  const sameState = quotation.igstAmount === 0;

  const data: BillingDocumentData = {
    kind: "quotation",
    number: quotation.quotationNumber,
    date: quotation.date.toLocaleDateString("en-GB").replace(/\//g, "-"),
    secondaryDateLabel: quotation.validUntil ? "Valid Until" : undefined,
    secondaryDate: quotation.validUntil
      ? quotation.validUntil.toLocaleDateString("en-GB").replace(/\//g, "-")
      : undefined,
    placeOfSupply: quotation.placeOfSupply || invoiceSettings.stateCode,
    seller: {
      legalName: invoiceSettings.legalName,
      address: invoiceSettings.legalAddress,
      phone: business.phone,
      gstin: invoiceSettings.gstin,
      stateCode: invoiceSettings.stateCode,
    },
    buyer: {
      name: quotation.billToName,
      address: quotation.billToAddress,
      pincode: quotation.billToPincode || undefined,
      gstin: quotation.billToGstin || undefined,
      state: quotation.billToState || undefined,
    },
    items,
    totals: {
      subTotal: quotation.subTotal,
      discountAmount: quotation.discountAmount,
      taxableValue: quotation.subTotal - quotation.discountAmount,
      totalTax: quotation.totalTax,
      cgstAmount: quotation.cgstAmount,
      sgstAmount: quotation.sgstAmount,
      igstAmount: quotation.igstAmount,
      totalAmount: quotation.totalAmount,
    },
    amountInWords: quotation.amountInWords || "",
    sameState,
    termsAndConditions: invoiceSettings.termsAndConditions,
    notes: quotation.notes || undefined,
  };

  const buffer = await renderToBuffer(<BillingDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Quotation-${quotation.quotationNumber.replace(/\//g, "-")}.pdf"`,
    },
  });
}
