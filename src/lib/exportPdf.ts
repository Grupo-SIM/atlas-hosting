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
    head: [columns],
    body: rows,
    startY: subtitle ? 26 : 20,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  doc.save(filename);
}
