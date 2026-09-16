import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { existsSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaymentMethod } from '@prisma/client';

const paymentLabels: Record<string, string> = {
  CASH: 'Especes',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte',
  OTHER: 'Autre',
};

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, shopId: string, dto: CreateSaleDto) {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, shopId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Un ou plusieurs produits sont introuvables');
    }

    let total = 0;
    const saleItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour "${product.name}". Disponible : ${product.quantity}`,
        );
      }
      const unitPrice = Number(product.sellingPrice);
      const totalPrice = unitPrice * item.quantity;
      total += totalPrice;

      saleItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const sale = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          shopId,
          sellerId: userId,
          totalAmount: total,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          saleItems: { create: saleItemsData },
        },
        include: { saleItems: true },
      });

      for (const item of saleItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            shopId,
            type: 'OUT',
            quantityChange: -item.quantity,
            reason: 'Vente',
            reference: created.id,
            createdById: userId,
          },
        });
      }

      return created;
    });

    return sale;
  }

  async findAll(shopId: string) {
    return this.prisma.sale.findMany({
      where: { shopId },
      include: {
        saleItems: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(shopId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, shopId },
      include: {
        saleItems: {
          include: { product: { select: { id: true, name: true, unit: true } } },
        },
        seller: { select: { fullName: true } },
      },
    });
    if (!sale) throw new NotFoundException('Vente introuvable');
    return sale;
  }

  // ============================================
  // Generation du recu PDF
  // ============================================
  async generateReceipt(
    shopId: string,
    saleId: string,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const sale = await this.prisma.sale.findFirst({
      where: { id: saleId, shopId },
      include: {
        saleItems: {
          include: { product: { select: { name: true, unit: true } } },
        },
        seller: { select: { fullName: true } },
        shop: {
          select: {
            name: true,
            currency: true,
            address: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!sale) throw new NotFoundException('Vente introuvable');

    const currency = sale.shop.currency || 'XOF';
    const shortId = sale.id.slice(0, 8).toUpperCase();
    const filename = `woroba-recu-${shortId}.pdf`;

    // Charge le logo en buffer si present
    let logoBuffer: Buffer | null = null;
    if (sale.shop.logoUrl) {
      try {
        const safeName = basename(sale.shop.logoUrl); // securite path traversal
        const logoPath = join(process.cwd(), 'uploads', safeName);
        if (existsSync(logoPath)) {
          logoBuffer = readFileSync(logoPath);
        }
      } catch {
        logoBuffer = null;
      }
    }

    const buffer = await this.buildReceiptPdf(
      sale,
      currency,
      shortId,
      logoBuffer,
    );
    return { buffer, filename };
  }

    private buildReceiptPdf(
    sale: any,
    currency: string,
    shortId: string,
    logoBuffer: Buffer | null = null,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 0,
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 50;
        const contentWidth = pageWidth - margin * 2;
        const leftX = margin;
        const rightX = pageWidth - margin;

        // Formate un montant : "1 500 000 F CFA" (sans espaces insecables)
        const formatMoney = (v: number | string) => {
          const n = typeof v === 'string' ? parseFloat(v) : v;
          const formatted = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
            .format(n)
            .replace(/\u202f|\u00a0/g, ' '); // remplace les espaces insecables
          return `${formatted} ${currency === 'XOF' ? 'F CFA' : currency}`;
        };

        // ============================================
        // BANDEAU VERT EN HAUT
        // ============================================
        const headerHeight = 120;

        // Rectangle vert plein (avec stroke = fill pour eviter les bugs)
        doc
          .save()
          .rect(0, 0, pageWidth, headerHeight)
          .fill('#10b981')
          .restore();

        // Logo de la boutique (ou fallback "Woroba")
        if (logoBuffer) {
          try {
            // Logo centre verticalement dans le bandeau (120px de haut)
            // Hauteur max 60px, largeur auto pour garder les proportions
            doc.image(logoBuffer, leftX, 30, { height: 50, fit: [200, 50] });
          } catch {
            // Si l'image est corrompue / format non supporte (webp, gif) :
            // fallback sur le texte
            doc
              .fillColor('#ffffff')
              .fontSize(28)
              .font('Helvetica-Bold')
              .text('Woroba', leftX, 32, { lineBreak: false });
          }
        } else {
          doc
            .fillColor('#ffffff')
            .fontSize(28)
            .font('Helvetica-Bold')
            .text('Woroba', leftX, 32, { lineBreak: false });
        }

        // Nom de la boutique (toujours affiche sous le logo / Woroba)
        doc
          .fillColor('#d1fae5')
          .fontSize(9)
          .font('Helvetica')
          .text(sale.shop.name, leftX, 88, {
            width: 250,
            lineBreak: false,
          });

        // "RECU DE VENTE" en blanc a droite
        doc
          .fillColor('#ffffff')
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('RECU DE VENTE', margin, 38, {
            align: 'right',
            width: contentWidth,
            lineBreak: false,
          });

        // Numero de recu
        doc
          .fillColor('#d1fae5')
          .fontSize(11)
          .font('Helvetica')
          .text(`N ${shortId}`, margin, 68, {
            align: 'right',
            width: contentWidth,
            lineBreak: false,
          });

        // ============================================
        // INFOS BOUTIQUE + VENTE (2 colonnes)
        // ============================================
        let y = headerHeight + 30;

        // --- Colonne gauche : EMETTEUR ---
        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('EMETTEUR', leftX, y, { lineBreak: false });

        y += 16;

        doc
          .fillColor('#0f172a')
          .fontSize(13)
          .font('Helvetica-Bold')
          .text(sale.shop.name, leftX, y, { lineBreak: false });

        y += 18;

        if (sale.shop.address) {
          doc
            .fillColor('#64748b')
            .fontSize(10)
            .font('Helvetica')
            .text(sale.shop.address, leftX, y, {
              width: 220,
              lineBreak: true,
            });
        }

        // --- Colonne droite : DATE / VENDEUR / PAIEMENT ---
        const col2X = pageWidth / 2 + 20;

        let ry = headerHeight + 30;

        // DATE
        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('DATE', col2X, ry, { lineBreak: false });

        doc
          .fillColor('#334155')
          .fontSize(10)
          .font('Helvetica')
          .text(
            new Date(sale.createdAt).toLocaleString('fr-FR', {
              dateStyle: 'long',
              timeStyle: 'short',
            }),
            col2X + 70,
            ry,
            { lineBreak: false },
          );

        // VENDEUR
        ry += 20;

        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('VENDEUR', col2X, ry, { lineBreak: false });

        doc
          .fillColor('#334155')
          .fontSize(10)
          .font('Helvetica')
          .text(sale.seller?.fullName ?? '-', col2X + 70, ry, {
            lineBreak: false,
          });

        // PAIEMENT
        ry += 20;

        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica-Bold')
          .text('PAIEMENT', col2X, ry, { lineBreak: false });

        doc
          .fillColor('#334155')
          .fontSize(10)
          .font('Helvetica')
          .text(
            paymentLabels[sale.paymentMethod] ?? sale.paymentMethod,
            col2X + 70,
            ry,
            { lineBreak: false },
          );

        // ============================================
        // TABLEAU DES ARTICLES
        // ============================================
        y = headerHeight + 130;

        // Sous-titre section
        doc
          .fillColor('#0f172a')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('DETAIL DES ARTICLES', leftX, y, { lineBreak: false });

        y += 20;

        // Colonnes calculees (proportions de contentWidth)
        const colPadding = 12;
        const col1X = leftX;
        const col1W = contentWidth * 0.52;
        const tableCol2X = leftX + contentWidth * 0.55;
        const col2W = contentWidth * 0.15 - colPadding;
        const col3X = leftX + contentWidth * 0.70;
        const col3W = contentWidth * 0.15 - colPadding;
        const col4X = leftX + contentWidth * 0.85;
        const col4W = contentWidth * 0.15 - colPadding;

        // En-tete du tableau
        const tableHeaderHeight = 30;
        doc
          .save()
          .rect(leftX, y, contentWidth, tableHeaderHeight)
          .fill('#f1f5f9')
          .restore();

        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica-Bold');

        doc.text('ARTICLE', col1X + colPadding, y + 11, {
          width: col1W - colPadding,
          lineBreak: false,
        });
        doc.text('QTE', tableCol2X, y + 11, {
          width: col2W,
          align: 'right',
          lineBreak: false,
        });
        doc.text('PRIX UNIT.', col3X, y + 11, {
          width: col3W,
          align: 'right',
          lineBreak: false,
        });
        doc.text('TOTAL', col4X, y + 11, {
          width: col4W,
          align: 'right',
          lineBreak: false,
        });

        y += tableHeaderHeight;

        // Lignes
        const rowHeight = 30;

        sale.saleItems.forEach((item: any, idx: number) => {
          // Fond alterne
          if (idx % 2 === 1) {
            doc
              .save()
              .rect(leftX, y, contentWidth, rowHeight)
              .fill('#f8fafc')
              .restore();
          }

          const unitPrice = parseFloat(item.unitPrice);
          const totalPrice = parseFloat(item.totalPrice);

          doc.fillColor('#0f172a').fontSize(10).font('Helvetica');

          doc.text(item.product.name, col1X + colPadding, y + 10, {
            width: col1W - colPadding,
            ellipsis: true,
            lineBreak: false,
          });
          doc.text(String(item.quantity), col2X, y + 10, {
            width: col2W,
            align: 'right',
            lineBreak: false,
          });
          doc.text(formatMoney(unitPrice), col3X, y + 10, {
            width: col3W,
            align: 'right',
            lineBreak: false,
          });
          doc.text(formatMoney(totalPrice), col4X, y + 10, {
            width: col4W,
            align: 'right',
            lineBreak: false,
          });

          // Separateur
          doc
            .moveTo(leftX, y + rowHeight)
            .lineTo(rightX, y + rowHeight)
            .strokeColor('#e2e8f0')
            .lineWidth(0.5)
            .stroke();

          y += rowHeight;
        });

        // ============================================
        // TOTAL (bandeau vert)
        // ============================================
        y += 8;

        const totalHeight = 50;

        doc
          .save()
          .rect(leftX, y, contentWidth, totalHeight)
          .fill('#10b981')
          .restore();

        doc
          .fillColor('#d1fae5')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('MONTANT TOTAL', leftX + 20, y + 18, { lineBreak: false });

        doc
          .fillColor('#ffffff')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(formatMoney(parseFloat(sale.totalAmount)), leftX, y + 14, {
            align: 'right',
            width: contentWidth - 20,
            lineBreak: false,
          });

        y += totalHeight + 30;

        // ============================================
        // FOOTER
        // ============================================
        const footerY = pageHeight - 130;

        // Ligne separatrice
        doc
          .moveTo(leftX, footerY)
          .lineTo(rightX, footerY)
          .strokeColor('#e2e8f0')
          .lineWidth(0.5)
          .stroke();

        doc
          .fillColor('#10b981')
          .fontSize(11)
          .font('Helvetica-Bold')
          .text('Merci de votre confiance !', leftX, footerY + 20, {
            align: 'center',
            width: contentWidth,
            lineBreak: false,
          });

        doc
          .fillColor('#94a3b8')
          .fontSize(8)
          .font('Helvetica')
          .text(
            `Recu genere par Woroba le ${new Date().toLocaleString('fr-FR')}`,
            leftX,
            footerY + 45,
            { align: 'center', width: contentWidth, lineBreak: false },
          );

        doc
          .fontSize(7)
          .text(
            'Ce document tient lieu de recu de vente. Conservez-le pour toute reclamation.',
            leftX,
            footerY + 60,
            { align: 'center', width: contentWidth, lineBreak: false },
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
