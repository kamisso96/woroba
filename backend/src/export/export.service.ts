import { Injectable, NotFoundException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';
export type ExportType = 'products' | 'sales' | 'movements';

export type ExportResult = {
  buffer: Buffer;
  filename: string;
  mimetype: string;
};

const MIME: Record<ExportFormat, string> = {
  csv: 'text/csv; charset=utf-8',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // Point d'entree principal
  // ============================================
  async generate(
    userId: string,
    shopId: string,
    type: ExportType,
    format: ExportFormat,
  ): Promise<ExportResult> {
    const { headers, rows, title } = await this.getData(shopId, type);
    const date = new Date().toISOString().slice(0, 10);
    const filename = `woroba-${type}-${date}.${format}`;

    let buffer: Buffer;

    if (format === 'csv') {
      buffer = this.buildCsv(headers, rows);
    } else if (format === 'xlsx') {
      buffer = await this.buildXlsx(title, headers, rows);
    } else {
      buffer = await this.buildPdf(title, headers, rows);
    }

    return { buffer, filename, mimetype: MIME[format] };
  }

  // ============================================
  // Recuperation des donnees
  // ============================================
  private async getData(shopId: string, type: ExportType) {
    if (type === 'products') return this.getProductsData(shopId);
    if (type === 'sales') return this.getSalesData(shopId);
    if (type === 'movements') return this.getMovementsData(shopId);
    throw new NotFoundException('Type d\'export inconnu');
  }

  private async getProductsData(shopId: string) {
    const products = await this.prisma.product.findMany({
      where: { shopId },
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    const headers = [
      'Nom',
      'SKU',
      'Code-barres',
      'Categorie',
      'Prix achat',
      'Prix vente',
      'Quantite',
      'Seuil alerte',
      'Unite',
      'Statut',
    ];

    const rows = products.map((p) => {
      const status =
        p.quantity <= 0
          ? 'Rupture'
          : p.quantity <= p.alertThreshold
          ? 'Stock faible'
          : 'En stock';
      return [
        p.name,
        p.sku ?? '',
        p.barcode ?? '',
        p.category?.name ?? '',
        Number(p.purchasePrice).toString(),
        Number(p.sellingPrice).toString(),
        p.quantity.toString(),
        p.alertThreshold.toString(),
        p.unit,
        status,
      ];
    });

    return { headers, rows, title: 'Produits' };
  }

  private async getSalesData(shopId: string) {
    const sales = await this.prisma.sale.findMany({
      where: { shopId },
      include: {
        saleItems: {
          include: { product: { select: { name: true, unit: true } } },
        },
        seller: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Date',
      'Vendeur',
      'Articles',
      'Detail',
      'Mode paiement',
      'Total',
    ];

    const paymentLabels: Record<string, string> = {
      CASH: 'Especes',
      MOBILE_MONEY: 'Mobile Money',
      CARD: 'Carte',
      OTHER: 'Autre',
    };

    const rows = sales.map((s) => {
      const detail = s.saleItems
        .map((it) => `${it.quantity}x ${it.product.name}`)
        .join(', ');
      return [
        new Date(s.createdAt).toLocaleString('fr-FR'),
        s.seller?.fullName ?? '',
        s.saleItems.length.toString(),
        detail,
        paymentLabels[s.paymentMethod] ?? s.paymentMethod,
        Number(s.totalAmount).toFixed(2),
      ];
    });

    return { headers, rows, title: 'Ventes' };
  }

  private async getMovementsData(shopId: string) {
    const movements = await this.prisma.stockMovement.findMany({
      where: { shopId },
      include: {
        product: { select: { name: true, unit: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'Date',
      'Produit',
      'Type',
      'Variation',
      'Raison',
      'Reference',
      'Auteur',
    ];

    const typeLabels: Record<string, string> = {
      IN: 'Entree',
      OUT: 'Sortie',
      ADJUSTMENT: 'Ajustement',
    };

    const rows = movements.map((m) => [
      new Date(m.createdAt).toLocaleString('fr-FR'),
      m.product?.name ?? '',
      typeLabels[m.type] ?? m.type,
      m.quantityChange > 0
        ? `+${m.quantityChange}`
        : m.quantityChange.toString(),
      m.reason ?? '',
      m.reference ?? '',
      m.createdBy?.fullName ?? '',
    ]);

    return { headers, rows, title: 'Mouvements de stock' };
  }

  // ============================================
  // Generateurs de fichiers
  // ============================================

  // --- CSV ---
  private buildCsv(headers: string[], rows: string[][]): Buffer {
    const escape = (v: string) => {
      if (v.includes(';') || v.includes('"') || v.includes('\n')) {
        return `"${v.replace(/"/g, '""')}"`;
      }
      return v;
    };

    const lines = [
      headers.map(escape).join(';'),
      ...rows.map((r) => r.map(escape).join(';')),
    ];

    // BOM UTF-8 pour que Excel affiche correctement les accents
    return Buffer.from('\uFEFF' + lines.join('\r\n'), 'utf8');
  }

  // --- XLSX ---
  private async buildXlsx(
    title: string,
    headers: string[],
    rows: string[][],
  ): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Woroba';
    wb.created = new Date();

    const ws = wb.addWorksheet(title);

    // En-tetes
    ws.columns = headers.map((h) => ({
      header: h,
      key: h,
      width: Math.max(14, h.length + 4),
    }));

    // Style des en-tetes
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' },
    };
    ws.getRow(1).alignment = { vertical: 'middle', horizontal: 'left' };
    ws.getRow(1).height = 22;

    // Lignes
    rows.forEach((row) => {
      ws.addRow(row);
    });

    // Style des cellules de donnees
    ws.eachRow((row, idx) => {
      if (idx === 1) return;
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Auto-filter
    if (rows.length > 0) {
      ws.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length },
      };
    }

    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  // --- PDF ---
  private buildPdf(
    title: string,
    headers: string[],
    rows: string[][],
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margin: 30,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // En-tete
        doc
          .fillColor('#10b981')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('Woroba', 30, 30);

        doc
          .fillColor('#334155')
          .fontSize(14)
          .font('Helvetica-Bold')
          .text(title, 30, 58);

        doc
          .fillColor('#64748b')
          .fontSize(9)
          .font('Helvetica')
          .text(
            `Export genere le ${new Date().toLocaleString('fr-FR')}`,
            30,
            78,
          );

        // Ligne separatrice
        doc
          .moveTo(30, 95)
          .lineTo(doc.page.width - 30, 95)
          .strokeColor('#e2e8f0')
          .stroke();

        // Position de depart du tableau
        const startX = 30;
        const startY = 110;
        const pageWidth = doc.page.width - 60;
        const colWidth = pageWidth / headers.length;
        const rowHeight = 22;

        // En-tete du tableau
        doc.rect(startX, startY, pageWidth, rowHeight).fill('#10b981');
        doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
        headers.forEach((h, i) => {
          doc.text(h, startX + i * colWidth + 4, startY + 7, {
            width: colWidth - 8,
            height: rowHeight,
            ellipsis: true,
          });
        });

        // Lignes
        let y = startY + rowHeight;
        doc.font('Helvetica').fillColor('#334155');

        rows.forEach((row, rowIdx) => {
          // Saut de page si necessaire
          if (y + rowHeight > doc.page.height - 40) {
            doc.addPage();
            y = 40;

            // Re-afficher l'en-tete
            doc.rect(startX, y, pageWidth, rowHeight).fill('#10b981');
            doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
            headers.forEach((h, i) => {
              doc.text(h, startX + i * colWidth + 4, y + 7, {
                width: colWidth - 8,
                height: rowHeight,
                ellipsis: true,
              });
            });
            y += rowHeight;
            doc.font('Helvetica').fillColor('#334155');
          }

          // Fond alterne
          if (rowIdx % 2 === 1) {
            doc.rect(startX, y, pageWidth, rowHeight).fill('#f8fafc');
            doc.fillColor('#334155');
          }

          row.forEach((cell, i) => {
            doc.text(String(cell), startX + i * colWidth + 4, y + 7, {
              width: colWidth - 8,
              height: rowHeight,
              ellipsis: true,
            });
          });

          y += rowHeight;
        });

        // Footer
        doc
          .fillColor('#94a3b8')
          .fontSize(8)
          .text(
            `${rows.length} ligne${rows.length > 1 ? 's' : ''} - Woroba - Gestion de stock`,
            30,
            doc.page.height - 25,
            { align: 'center', width: doc.page.width - 60 },
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
