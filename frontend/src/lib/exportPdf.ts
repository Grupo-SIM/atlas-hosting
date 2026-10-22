import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportTableToPdf({
  title,
  subtitle,
  columns,
  rows,
  filename,
}: {
  title: string;
  subtitle?: string;
  columns: string[];
  rows: (string | number)[][];
  filename: string;
}) {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.text(title, 14, 15);

  if (subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 21);
  }

  autoTable(doc, {
    body: rows,
    head: [columns],
    headStyles: { fillColor: [30, 41, 59] },
    startY: subtitle ? 26 : 20,
    styles: { cellPadding: 2, fontSize: 8 },
  });

  doc.save(filename);
}
