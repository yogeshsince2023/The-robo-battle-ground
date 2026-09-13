import { prisma } from "@/lib/prisma";

// Indian financial year runs April -> March, written as e.g. "2026-27".
export function currentFinancialYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const startYear = month >= 4 ? year : year - 1;
  const endYearShort = String((startYear + 1) % 100).padStart(2, "0");
  return `${startYear}-${endYearShort}`;
}

// Generates the next sequential invoice/quotation number within a financial
// year, e.g. "2026-27/1", "2026-27/2". Quotations get a "QT-" prefix so the
// two series never collide even though both use the same FY string.
export async function nextInvoiceNumber(financialYear = currentFinancialYear()) {
  const last = await prisma.invoice.findFirst({
    where: { financialYear },
    orderBy: { sequence: "desc" },
  });
  const sequence = (last?.sequence ?? 0) + 1;
  return { financialYear, sequence, number: `${financialYear}/${sequence}` };
}

export async function nextQuotationNumber(financialYear = currentFinancialYear()) {
  const last = await prisma.quotation.findFirst({
    where: { financialYear },
    orderBy: { sequence: "desc" },
  });
  const sequence = (last?.sequence ?? 0) + 1;
  return { financialYear, sequence, number: `QT-${financialYear}/${sequence}` };
}
