import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class InvoicePdfService {
  generatePdf(invoice: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Uint8Array[] = [];

      doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Header
      doc.fontSize(20).text('FAKTURA', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).text(invoice.invoiceNumber, { align: 'center' });
      doc.moveDown(1);

      // Supplier & Customer side by side
      const topY = doc.y;
      doc.fontSize(10);

      // Supplier (left)
      doc.font('Helvetica-Bold').text('Dodavatel:', 50, topY);
      doc.font('Helvetica');
      doc.text(invoice.supplierName, 50, topY + 15);
      doc.text(invoice.supplierAddress, 50, topY + 30);
      if (invoice.supplierIco) doc.text(`ICO: ${invoice.supplierIco}`, 50, topY + 45);
      if (invoice.supplierDic) doc.text(`DIC: ${invoice.supplierDic}`, 50, topY + 60);

      // Customer (right)
      doc.font('Helvetica-Bold').text('Odberatel:', 300, topY);
      doc.font('Helvetica');
      doc.text(invoice.customerName, 300, topY + 15);
      if (invoice.customerAddress) doc.text(invoice.customerAddress, 300, topY + 30);
      if (invoice.customerIco) doc.text(`ICO: ${invoice.customerIco}`, 300, topY + 45);
      if (invoice.customerDic) doc.text(`DIC: ${invoice.customerDic}`, 300, topY + 60);

      doc.moveDown(5);

      // Dates
      const dateY = doc.y;
      doc.text(`Datum vystaveni: ${new Date(invoice.issuedAt).toLocaleDateString('cs-CZ')}`, 50, dateY);
      doc.text(`Datum splatnosti: ${new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}`, 300, dateY);
      if (invoice.variableSymbol) {
        doc.text(`Variabilni symbol: ${invoice.variableSymbol}`, 50, dateY + 15);
      }
      if (invoice.bankAccount) {
        doc.text(`Bankovni ucet: ${invoice.bankAccount}`, 300, dateY + 15);
      }

      doc.moveDown(2);

      // Items table header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Popis', 50, tableTop, { width: 200 });
      doc.text('Mn.', 260, tableTop, { width: 40, align: 'right' });
      doc.text('Cena/ks', 310, tableTop, { width: 70, align: 'right' });
      doc.text('DPH %', 390, tableTop, { width: 50, align: 'right' });
      doc.text('Celkem', 450, tableTop, { width: 80, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();

      // Items
      doc.font('Helvetica');
      let itemY = tableTop + 25;
      for (const item of invoice.items) {
        doc.text(item.description, 50, itemY, { width: 200 });
        doc.text(String(item.quantity), 260, itemY, { width: 40, align: 'right' });
        doc.text(formatCZK(item.unitPrice), 310, itemY, { width: 70, align: 'right' });
        doc.text(`${item.taxRate}%`, 390, itemY, { width: 50, align: 'right' });
        doc.text(formatCZK(item.total), 450, itemY, { width: 80, align: 'right' });
        itemY += 20;
      }

      // Totals
      doc.moveTo(350, itemY + 5).lineTo(530, itemY + 5).stroke();
      itemY += 15;
      doc.text('Zaklad dane:', 350, itemY, { width: 90, align: 'right' });
      doc.text(formatCZK(invoice.subtotal), 450, itemY, { width: 80, align: 'right' });
      itemY += 15;
      doc.text(`DPH ${invoice.taxRate}%:`, 350, itemY, { width: 90, align: 'right' });
      doc.text(formatCZK(invoice.taxAmount), 450, itemY, { width: 80, align: 'right' });
      itemY += 20;
      doc.font('Helvetica-Bold');
      doc.text('Celkem k uhrade:', 350, itemY, { width: 90, align: 'right' });
      doc.text(formatCZK(invoice.total), 450, itemY, { width: 80, align: 'right' });

      // Payment method
      itemY += 30;
      doc.font('Helvetica');
      const methodLabels: Record<string, string> = {
        cash: 'Hotove',
        card: 'Kartou',
        bank_transfer: 'Prevodem',
      };
      doc.text(`Zpusob uhrady: ${methodLabels[invoice.paymentMethod] || invoice.paymentMethod}`, 50, itemY);

      if (invoice.notes) {
        itemY += 25;
        doc.text(`Poznamka: ${invoice.notes}`, 50, itemY);
      }

      doc.end();
    });
  }
}

function formatCZK(amountInHalere: number): string {
  return `${(amountInHalere / 100).toFixed(2)} Kc`;
}
