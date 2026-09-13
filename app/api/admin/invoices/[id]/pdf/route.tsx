import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getBusinessSettings, getInvoiceSettings } from "@/lib/settings";
import { BillingDocument, type BillingDocumentData } from "@/components/pdf/BillingDocument";
import type { LineItem } from "@/lib/billing/gst";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const business = await getBusinessSettings();
  const invoiceSettings = await getInvoiceSettings();
  const items: LineItem[] = JSON.parse(invoice.items);
  const sameState = invoice.igstAmount === 0;

  const data: BillingDocumentData = {
    kind: "invoice",
    number: invoice.invoiceNumber,
    date: invoice.date.toLocaleDateString("en-GB").replace(/\//g, "-"),
    secondaryDateLabel: invoice.dueDate ? "Due Date" : undefined,
    secondaryDate: invoice.dueDate ? invoice.dueDate.toLocaleDateString("en-GB").replace(/\//g, "-") : undefined,
    placeOfSupply: invoice.placeOfSupply || invoiceSettings.stateCode,
    seller: {
      legalName: invoiceSettings.legalName,
      address: invoiceSettings.legalAddress,
      phone: business.phone,
      gstin: invoiceSettings.gstin,
      stateCode: invoiceSettings.stateCode,
    },
    buyer: {
      name: invoice.billToName,
      address: invoice.billToAddress,
      pincode: invoice.billToPincode || undefined,
      gstin: invoice.billToGstin || undefined,
      state: invoice.billToState || undefined,
    },
    items,
    totals: {
      subTotal: invoice.subTotal,
      discountAmount: invoice.discountAmount,
      taxableValue: invoice.subTotal - invoice.discountAmount,
      totalTax: invoice.totalTax,
      cgstAmount: invoice.cgstAmount,
      sgstAmount: invoice.sgstAmount,
      igstAmount: invoice.igstAmount,
      totalAmount: invoice.totalAmount,
    },
    amountInWords: invoice.amountInWords || "",
    sameState,
    receivedAmount: invoice.receivedAmount,
    balanceAmount: invoice.balanceAmount,
    bank: {
      name: invoiceSettings.bankName,
      accountNumber: invoiceSettings.bankAccountNumber,
      ifsc: invoiceSettings.bankIfsc,
      accountHolder: invoiceSettings.bankAccountHolder,
    },
    termsAndConditions: invoiceSettings.termsAndConditions,
    notes: invoice.notes || undefined,
  };

  const buffer = await renderToBuffer(<BillingDocument data={data} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Invoice-${invoice.invoiceNumber.replace(/\//g, "-")}.pdf"`,
    },
  });
}
