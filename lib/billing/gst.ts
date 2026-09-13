export type LineItem = {
  name: string;
  hsnSac: string;
  quantity: number;
  pricePerUnit: number;
  gstRate: number; // percent, e.g. 18
};

export type DiscountInput = {
  type: "FLAT" | "PERCENT";
  value: number;
};

export type GstTotals = {
  subTotal: number;
  discountAmount: number;
  taxableValue: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
};

// Intra-state (buyer and seller in the same state) splits GST into equal
// CGST + SGST halves; inter-state charges the full rate as IGST — standard
// Indian GST treatment, matching the reference invoice (both parties in
// Rajasthan, so CGST+SGST @ 9% each on an 18% rate).
//
// An overall discount (flat rupee or percent of subtotal) is distributed
// proportionally across line items before tax, so each item's own GST rate
// is still applied to its own (post-discount) taxable share.
export function calculateGstTotals(items: LineItem[], sameState: boolean, discount?: DiscountInput): GstTotals {
  let subTotal = 0;
  for (const item of items) {
    subTotal += item.quantity * item.pricePerUnit;
  }

  let discountAmount = 0;
  if (discount && discount.value > 0) {
    discountAmount = discount.type === "PERCENT" ? subTotal * (discount.value / 100) : discount.value;
    discountAmount = Math.min(Math.max(discountAmount, 0), subTotal);
  }
  const taxableValue = subTotal - discountAmount;

  let totalTax = 0;
  for (const item of items) {
    const amount = item.quantity * item.pricePerUnit;
    const share = subTotal > 0 ? amount / subTotal : 0;
    const itemTaxable = amount - share * discountAmount;
    totalTax += itemTaxable * (item.gstRate / 100);
  }

  const cgstAmount = sameState ? totalTax / 2 : 0;
  const sgstAmount = sameState ? totalTax / 2 : 0;
  const igstAmount = sameState ? 0 : totalTax;

  return {
    subTotal: round2(subTotal),
    discountAmount: round2(discountAmount),
    taxableValue: round2(taxableValue),
    totalTax: round2(totalTax),
    cgstAmount: round2(cgstAmount),
    sgstAmount: round2(sgstAmount),
    igstAmount: round2(igstAmount),
    totalAmount: round2(taxableValue + totalTax),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
