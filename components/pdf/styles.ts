import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  title: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  outerBox: {
    borderWidth: 1,
    borderColor: "#111827",
  },
  row: {
    flexDirection: "row",
  },
  headerLeft: {
    width: "60%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  headerRight: {
    width: "40%",
    padding: 8,
  },
  businessName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginBottom: 3,
  },
  smallText: {
    fontSize: 8.5,
    marginBottom: 1,
    lineHeight: 1.3,
  },
  headerRightRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  headerRightLabel: {
    fontSize: 8,
    color: "#4b5563",
  },
  headerRightValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  billToBox: {
    padding: 8,
  },
  billToLabel: {
    fontSize: 8,
    color: "#4b5563",
    marginBottom: 3,
  },
  billToName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableCellHeader: {
    padding: 5,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  tableCell: {
    padding: 5,
    fontSize: 8.5,
  },
  colNum: { width: "5%" },
  colItem: { width: "31%" },
  colHsn: { width: "9%" },
  colQty: { width: "8%", textAlign: "right" },
  colPrice: { width: "14%", textAlign: "right" },
  colGst: { width: "17%", textAlign: "right" },
  colAmount: { width: "16%", textAlign: "right" },
  totalsSection: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  wordsBox: {
    width: "60%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#111827",
    justifyContent: "center",
  },
  amountsBox: {
    width: "40%",
  },
  amountsRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  amountsRowLast: {
    flexDirection: "row",
  },
  amountsLabel: {
    width: "50%",
    padding: 5,
    fontSize: 8.5,
  },
  amountsValue: {
    width: "50%",
    padding: 5,
    fontSize: 8.5,
    textAlign: "right",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
  },
  gstTable: {
    borderBottomWidth: 1,
    borderBottomColor: "#111827",
  },
  footerTermsRow: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  footerRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#111827",
  },
  footerBox: {
    width: "50%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#111827",
  },
  footerBoxLast: {
    width: "50%",
    padding: 8,
  },
  footerLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    marginBottom: 4,
  },
  signatureSpace: {
    marginTop: 30,
    textAlign: "right",
    fontSize: 8.5,
  },
});
