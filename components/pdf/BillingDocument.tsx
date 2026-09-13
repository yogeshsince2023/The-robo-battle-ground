import { Document, Page, View, Text } from "@react-pdf/renderer";
import { pdfStyles as s } from "./styles";
import type { LineItem, GstTotals } from "@/lib/billing/gst";

export type BillingDocumentData = {
  kind: "invoice" | "quotation";
  number: string;
  date: string;
  secondaryDateLabel?: string; // "Due Date" or "Valid Until"
  secondaryDate?: string;
  placeOfSupply: string;
  seller: {
    legalName: string;
    address: string;
    phone: string;
    gstin: string;
    stateCode: string;
  };
  buyer: {
    name: string;
    address: string;
    pincode?: string;
    gstin?: string;
    state?: string;
  };
  items: LineItem[];
  totals: GstTotals;
  amountInWords: string;
  sameState: boolean;
  receivedAmount?: number;
  balanceAmount?: number;
  bank?: {
    name: string;
    accountNumber: string;
    ifsc: string;
    accountHolder: string;
  };
  termsAndConditions: string;
  notes?: string;
};

function formatMoney(n: number) {
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BillingDocument({ data }: { data: BillingDocumentData }) {
  const title = data.kind === "invoice" ? "Tax Invoice" : "Quotation";
  const numberLabel = data.kind === "invoice" ? "Invoice No." : "Quotation No.";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>{title}</Text>

        <View style={s.outerBox}>
          {/* Header: seller + invoice meta */}
          <View style={s.row}>
            <View style={s.headerLeft}>
              <Text style={s.businessName}>{data.seller.legalName}</Text>
              <Text style={s.smallText}>{data.seller.address}</Text>
              <Text style={s.smallText}>Phone no.: {data.seller.phone}</Text>
              <Text style={s.smallText}>GSTIN: {data.seller.gstin}</Text>
              <Text style={s.smallText}>State: {data.seller.stateCode}</Text>
            </View>
            <View style={s.headerRight}>
              <View style={s.headerRightRow}>
                <View style={{ width: "100%" }}>
                  <Text style={s.headerRightLabel}>{numberLabel}</Text>
                  <Text style={s.headerRightValue}>{data.number}</Text>
                </View>
              </View>
              <View style={s.headerRightRow}>
                <View style={{ width: "100%" }}>
                  <Text style={s.headerRightLabel}>Date</Text>
                  <Text style={s.headerRightValue}>{data.date}</Text>
                </View>
              </View>
              {data.secondaryDate && (
                <View style={s.headerRightRow}>
                  <View style={{ width: "100%" }}>
                    <Text style={s.headerRightLabel}>{data.secondaryDateLabel}</Text>
                    <Text style={s.headerRightValue}>{data.secondaryDate}</Text>
                  </View>
                </View>
              )}
              <View>
                <Text style={s.headerRightLabel}>Place of supply</Text>
                <Text style={s.headerRightValue}>{data.placeOfSupply}</Text>
              </View>
            </View>
          </View>

          {/* Bill To */}
          <View style={[s.sectionDivider, s.billToBox]}>
            <Text style={s.billToLabel}>Bill To</Text>
            <Text style={s.billToName}>{data.buyer.name}</Text>
            <Text style={s.smallText}>
              {data.buyer.address}
              {data.buyer.pincode ? ` - ${data.buyer.pincode}` : ""}
            </Text>
            {data.buyer.gstin && <Text style={s.smallText}>GSTIN : {data.buyer.gstin}</Text>}
            {data.buyer.state && <Text style={s.smallText}>State: {data.buyer.state}</Text>}
          </View>

          {/* Items table */}
          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableCellHeader, s.colNum]}>#</Text>
              <Text style={[s.tableCellHeader, s.colItem]}>Item name</Text>
              <Text style={[s.tableCellHeader, s.colHsn]}>HSN/SAC</Text>
              <Text style={[s.tableCellHeader, s.colQty]}>Quantity</Text>
              <Text style={[s.tableCellHeader, s.colPrice]}>Price/Unit</Text>
              <Text style={[s.tableCellHeader, s.colGst]}>GST</Text>
              <Text style={[s.tableCellHeader, s.colAmount]}>Amount</Text>
            </View>
            {data.items.map((item, i) => {
              const amount = item.quantity * item.pricePerUnit;
              const gstAmount = amount * (item.gstRate / 100);
              return (
                <View key={i} style={s.tableRow}>
                  <Text style={[s.tableCell, s.colNum]}>{i + 1}</Text>
                  <Text style={[s.tableCell, s.colItem]}>{item.name}</Text>
                  <Text style={[s.tableCell, s.colHsn]}>{item.hsnSac}</Text>
                  <Text style={[s.tableCell, s.colQty]}>{item.quantity}</Text>
                  <Text style={[s.tableCell, s.colPrice]}>{formatMoney(item.pricePerUnit)}</Text>
                  <Text style={[s.tableCell, s.colGst]}>
                    {formatMoney(gstAmount)} ({item.gstRate}%)
                  </Text>
                  <Text style={[s.tableCell, s.colAmount]}>{formatMoney(amount + gstAmount)}</Text>
                </View>
              );
            })}
            <View style={[s.tableRow, { borderBottomWidth: 1, borderBottomColor: "#111827" }]}>
              <Text style={[s.tableCellHeader, { width: "60%" }]}>Total</Text>
              <Text style={[s.tableCellHeader, s.colQty]}>
                {data.items.reduce((sum, it) => sum + it.quantity, 0)}
              </Text>
              <Text style={[s.tableCellHeader, s.colPrice]}></Text>
              <Text style={[s.tableCellHeader, s.colGst]}>{formatMoney(data.totals.totalTax)}</Text>
              <Text style={[s.tableCellHeader, s.colAmount]}>{formatMoney(data.totals.totalAmount)}</Text>
            </View>
          </View>

          {/* Amount in words + totals */}
          <View style={s.totalsSection}>
            <View style={s.wordsBox}>
              <Text style={s.billToLabel}>{data.kind === "invoice" ? "Invoice" : "Quotation"} Amount in Words</Text>
              <Text style={[s.smallText, s.boldText]}>{data.amountInWords}</Text>
            </View>
            <View style={s.amountsBox}>
              <View style={s.amountsRow}>
                <Text style={s.amountsLabel}>Sub Total</Text>
                <Text style={s.amountsValue}>{formatMoney(data.totals.subTotal)}</Text>
              </View>
              {data.totals.discountAmount > 0 && (
                <View style={s.amountsRow}>
                  <Text style={s.amountsLabel}>Discount</Text>
                  <Text style={s.amountsValue}>- {formatMoney(data.totals.discountAmount)}</Text>
                </View>
              )}
              <View style={s.amountsRow}>
                <Text style={[s.amountsLabel, s.boldText]}>Total</Text>
                <Text style={[s.amountsValue, s.boldText]}>{formatMoney(data.totals.totalAmount)}</Text>
              </View>
              {data.kind === "invoice" && (
                <>
                  <View style={s.amountsRow}>
                    <Text style={s.amountsLabel}>Received</Text>
                    <Text style={s.amountsValue}>{formatMoney(data.receivedAmount ?? 0)}</Text>
                  </View>
                  <View style={s.amountsRowLast}>
                    <Text style={s.amountsLabel}>Balance</Text>
                    <Text style={s.amountsValue}>{formatMoney(data.balanceAmount ?? data.totals.totalAmount)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* GST breakdown table */}
          <View style={s.gstTable}>
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableCellHeader, { width: "20%" }]}>HSN/SAC</Text>
              <Text style={[s.tableCellHeader, { width: "20%" }]}>Taxable amount</Text>
              {data.sameState ? (
                <>
                  <Text style={[s.tableCellHeader, { width: "20%" }]}>CGST</Text>
                  <Text style={[s.tableCellHeader, { width: "20%" }]}>SGST</Text>
                </>
              ) : (
                <Text style={[s.tableCellHeader, { width: "40%" }]}>IGST</Text>
              )}
              <Text style={[s.tableCellHeader, { width: "20%" }]}>Total Tax</Text>
            </View>
            <View style={s.tableRow}>
              <Text style={[s.tableCell, { width: "20%" }]}>
                {Array.from(new Set(data.items.map((i) => i.hsnSac))).join(", ")}
              </Text>
              <Text style={[s.tableCell, { width: "20%" }]}>{formatMoney(data.totals.taxableValue)}</Text>
              {data.sameState ? (
                <>
                  <Text style={[s.tableCell, { width: "20%" }]}>{formatMoney(data.totals.cgstAmount)}</Text>
                  <Text style={[s.tableCell, { width: "20%" }]}>{formatMoney(data.totals.sgstAmount)}</Text>
                </>
              ) : (
                <Text style={[s.tableCell, { width: "40%" }]}>{formatMoney(data.totals.igstAmount)}</Text>
              )}
              <Text style={[s.tableCell, { width: "20%" }]}>{formatMoney(data.totals.totalTax)}</Text>
            </View>
          </View>

          {/* Footer: terms (full row), then bank details / signature (two columns) */}
          <View style={s.footerTermsRow}>
            <Text style={s.footerLabel}>Terms and conditions</Text>
            <Text style={s.smallText}>{data.termsAndConditions}</Text>
            {data.notes && (
              <>
                <Text style={[s.footerLabel, { marginTop: 6 }]}>Notes</Text>
                <Text style={s.smallText}>{data.notes}</Text>
              </>
            )}
          </View>
          <View style={s.footerRow}>
            <View style={s.footerBox}>
              {data.bank ? (
                <>
                  <Text style={s.footerLabel}>Payment / Bank Details</Text>
                  <Text style={s.smallText}>Name : {data.bank.name}</Text>
                  <Text style={s.smallText}>Account No. : {data.bank.accountNumber}</Text>
                  <Text style={s.smallText}>IFSC code : {data.bank.ifsc}</Text>
                  <Text style={s.smallText}>Account holder&apos;s name : {data.bank.accountHolder}</Text>
                </>
              ) : (
                <Text style={s.footerLabel}> </Text>
              )}
            </View>
            <View style={s.footerBoxLast}>
              <Text style={s.footerLabel}>For : {data.seller.legalName}</Text>
              <Text style={s.signatureSpace}>Authorized Signatory</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
