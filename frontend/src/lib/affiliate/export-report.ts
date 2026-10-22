import jsPDF from "jspdf";
import autoTable, { type Table } from "jspdf-autotable";
import type { AffiliateReportRow } from "@/app/(auth)/admin/affiliates/components/types";

const colors = {
  accent: [0, 163, 255],
  border: [218, 228, 241],
  header: [3, 8, 12],
  ink: [15, 23, 42],
  muted: [100, 116, 139],
  pale: [245, 247, 252],
  total: [224, 242, 254],
} satisfies Record<string, [number, number, number]>;

const toBrl = (value: number) =>
  value.toLocaleString("pt-BR", { currency: "BRL", style: "currency" });

export function createAffiliateReportPdf({
  rows,
  logo,
  issuedAt = new Date(),
}: {
  rows: AffiliateReportRow[];
  logo: Uint8Array;
  issuedAt?: Date;
}) {
  const doc = new jsPDF({ compress: true, orientation: "landscape" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = width - margin * 2;
  const totals = rows.reduce(
    (total, row) => ({
      balance: total.balance + row.balance,
      commission: total.commission + row.commissionTotal,
      pending: total.pending + row.pending,
      referrals: total.referrals + row.referralCount,
      sales: total.sales + row.salesCount,
      salesTotal: total.salesTotal + row.salesTotal,
    }),
    { balance: 0, commission: 0, pending: 0, referrals: 0, sales: 0, salesTotal: 0 }
  );

  doc.setProperties({
    author: "Atlas Hosting",
    subject: "Histórico completo de indicações e vendas comissionadas",
    title: "Atlas Hosting | Relatório de afiliados",
  });

  function drawHeader() {
    doc.setFillColor(...colors.header);
    doc.rect(0, 0, width, 43, "F");
    doc.addImage(logo, "PNG", margin, 10, 67, 17, "atlas-logo", "FAST");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...colors.accent);
    doc.text("ADMINISTRATIVO / AFILIADOS", width - margin, 15, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225);
    doc.text(
      `Histórico completo | Emissão: ${issuedAt.toLocaleDateString("pt-BR")}`,
      width - margin,
      30,
      { align: "right" }
    );
    doc.setFillColor(...colors.accent);
    doc.rect(0, 42, width, 1, "F");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...colors.ink);
  doc.text("Relatório de afiliados", margin, 57);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...colors.muted);
  doc.text(
    "Visão consolidada de indicações, vendas comissionadas e saldo disponível.",
    margin,
    64
  );

  const stats = [
    { label: "AFILIADOS", value: String(rows.length) },
    { label: "INDICAÇÕES", value: String(totals.referrals) },
    { label: "VENDAS COMISSIONADAS", value: toBrl(totals.salesTotal) },
    { label: "COMISSÕES ACUMULADAS", value: toBrl(totals.commission) },
    { label: "SALDO DISPONÍVEL", value: toBrl(totals.balance) },
    { label: "SAQUES PENDENTES", value: toBrl(totals.pending) },
  ];
  const gap = 3.5;
  const cardWidth = (contentWidth - gap * (stats.length - 1)) / stats.length;
  stats.forEach((stat, index) => {
    const x = margin + index * (cardWidth + gap);
    doc.setFillColor(...colors.pale);
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, 73, cardWidth, 25, 2, 2, "FD");
    doc.setFillColor(...colors.accent);
    doc.rect(x + 3, 78, 1, 14, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...colors.muted);
    doc.text(stat.label, x + 6, 81);
    doc.setFontSize(13);
    doc.setFontSize(Math.min(13, (13 * (cardWidth - 9)) / doc.getTextWidth(stat.value)));
    doc.setTextColor(...colors.ink);
    doc.text(stat.value, x + 6, 91);
  });

  autoTable(doc, {
    body: rows.map(row => [
      row.name, row.email, row.affiliateCode ?? "---", row.referralCount,
      row.salesCount, toBrl(row.salesTotal), toBrl(row.commissionTotal),
      toBrl(row.balance), toBrl(row.pending),
    ]),
    columnStyles: {
      0: { cellWidth: contentWidth * 0.102 },
      1: { cellWidth: contentWidth * 0.149 },
      2: { cellWidth: contentWidth * 0.102 },
      3: { cellWidth: contentWidth * 0.091, halign: "right" },
      4: { cellWidth: contentWidth * 0.071, halign: "right" },
      5: { cellWidth: contentWidth * 0.127, halign: "right" },
      6: { cellWidth: contentWidth * 0.101, halign: "right" },
      7: { cellWidth: contentWidth * 0.123, halign: "right" },
      8: { cellWidth: contentWidth * 0.134, halign: "right" },
    },
    foot: [[
      "TOTAL", "", "", totals.referrals, totals.sales, toBrl(totals.salesTotal),
      toBrl(totals.commission), toBrl(totals.balance), toBrl(totals.pending),
    ]],
    footStyles: { fillColor: colors.total, fontStyle: "bold", textColor: colors.ink },
    head: [[
      "Afiliado", "E-mail", "Código", "Indicações", "Vendas", "Valor das vendas",
      "Comissões", "Saldo disponível", "Saques pendentes",
    ]],
    headStyles: { fillColor: colors.ink, fontStyle: "bold", textColor: 255 },
    alternateRowStyles: { fillColor: colors.pale },
    margin: { bottom: 35, left: margin, right: margin, top: 52 },
    rowPageBreak: "avoid",
    showFoot: "lastPage",
    startY: 108,
    styles: {
      cellPadding: 3,
      font: "helvetica",
      fontSize: 8,
      lineColor: colors.border,
      lineWidth: 0.1,
      overflow: "linebreak",
      textColor: colors.ink,
      valign: "middle",
    },
    theme: "grid",
    willDrawPage: drawHeader,
  });

  const table = (doc as jsPDF & { lastAutoTable: Table }).lastAutoTable;
  const notesY = (table.finalY ?? 108) + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...colors.muted);
  doc.text(
    "Vendas: compras que geraram comissão. Comissões canceladas excluídas dos totais.",
    margin,
    notesY
  );
  doc.text(
    "Saldo disponível: comissões disponíveis menos saques pendentes; não inclui valores já sacados.",
    margin,
    notesY + 5
  );

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setDrawColor(...colors.border);
    doc.line(margin, height - 16, width - margin, height - 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...colors.muted);
    doc.text("ATLAS HOSTING | Programa de afiliados", margin, height - 10);
    doc.text(`Relatório de afiliados · ${page} / ${pages}`, width - margin, height - 10, {
      align: "right",
    });
  }
  return doc;
}

export async function exportAffiliateReport(rows: AffiliateReportRow[]) {
  const response = await fetch("/atlas-logo.png");
  if (!response.ok) throw new Error("Não foi possível carregar o logo do relatório.");
  const logo = new Uint8Array(await response.arrayBuffer());
  const issuedAt = new Date();
  const doc = createAffiliateReportPdf({ issuedAt, logo, rows });
  doc.save(`relatorio-afiliados-${issuedAt.toISOString().slice(0, 10)}.pdf`);
}
