/**
 * ZORA SHOP — Professional PDF Invoice Generation Service
 *
 * Generates beautiful, compliant, in-memory PDF tax invoices for delivered orders
 * using PDFKit with zero native binary or Chromium dependencies.
 *
 * Features:
 * - Pure in-memory Buffer generation (compatible with Vercel Serverless / Lambda)
 * - Brand-aligned typography and styling (Warm cocoa, caramel accents, subtle dividers)
 * - Dynamic table layouts and multi-page pagination with "Page X of Y" footers
 * - Universal Indian Rupee formatting (Rs. / INR) compatible with WinAnsi Type 1 fonts
 * - Clear Cash on Delivery (COD) distinction (Pending COD status never altered to Paid)
 * - Omission of unconfirmed/optional details without inventing fallback data
 * - Single-page invoices strictly generate exactly one page (no phantom page overflow)
 */

import PDFDocument from 'pdfkit';

/**
 * Format timestamp or date string to Indian format (e.g. 18 Nov 2026)
 * @param {string|Date} dateInput
 * @returns {string}
 */
function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Format monetary amounts safely in Indian Rupee format
 * Uses 'Rs.' to guarantee 100% font compatibility in standard PDF Type 1 fonts
 * @param {number|string} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  const num = Number(amount);
  return `Rs. ${(isNaN(num) ? 0 : num).toFixed(2)}`;
}

/**
 * Generate a professional PDF invoice Buffer from an invoice record and its snapshot
 *
 * @param {object} invoice - Complete Invoice database record (including snapshot)
 * @returns {Promise<Buffer>} - Resolved with the raw PDF Buffer
 */
export async function generateInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    try {
      if (!invoice || typeof invoice !== 'object') {
        throw new Error('Invalid invoice data: invoice object is required.');
      }

      // Safe extraction from snapshot or top-level properties
      const snapshot = invoice.snapshot || {};
      const shop = snapshot.shop || {};
      const customer = snapshot.customer || invoice.customer || {};
      const address = snapshot.deliveryAddress || (invoice.order && invoice.order.address) || null;
      const items = Array.isArray(snapshot.items) && snapshot.items.length > 0
        ? snapshot.items
        : (invoice.order && Array.isArray(invoice.order.items) ? invoice.order.items : []);
      const financials = snapshot.financials || {};
      const payment = snapshot.payment || {};
      const dates = snapshot.dates || {};

      // Shop identity: Render ONLY confirmed snapshot details; omit unprovided fields
      const shopName = shop.name || 'ZORA SHOP';
      const shopTagline = shop.tagline || null;
      const shopAddress = shop.address || null;
      const shopPhone = shop.whatsappNumber || null;
      const shopEmail = shop.contactEmail || null;

      // Invoice metadata
      const invoiceNumber = invoice.invoiceNumber || snapshot.invoiceNumber || 'INV-PENDING';
      const orderNumber = (snapshot.order && snapshot.order.orderNumber) || (invoice.order && invoice.order.orderNumber) || invoice.orderId || 'N/A';
      const issuedAt = dates.issuedAt || invoice.issuedAt || invoice.createdAt || new Date();
      const deliveryDate = dates.deliveredAt || invoice.deliveryDate || new Date();
      const orderedAt = dates.orderedAt || (snapshot.order && snapshot.order.createdAt) || (invoice.order && invoice.order.createdAt) || null;

      // Customer identity
      const customerName = customer.name || 'Valued Customer';
      const customerPhone = customer.phone || null;
      const customerEmail = customer.email || null;

      // Financials
      const subtotal = Number(financials.subtotal ?? invoice.subtotal ?? 0);
      const deliveryFee = Number(financials.deliveryFee ?? invoice.deliveryFee ?? 0);
      const discount = Number(financials.discount ?? invoice.discount ?? 0);
      const grandTotal = Number(financials.grandTotal ?? invoice.grandTotal ?? 0);

      // Payment details (Strict COD safety)
      const paymentMethod = payment.method || invoice.paymentMethod || 'COD';
      const rawPaymentStatus = payment.status || invoice.paymentStatus || 'Pending (Cash on Delivery)';
      const isCod = paymentMethod.toUpperCase().includes('COD') || paymentMethod.toUpperCase().includes('CASH');
      const paymentStatus = rawPaymentStatus;

      // Brand Color Palette
      const COLOR_COCOA = '#3c1b11';       // Deep cocoa brown for headings & primary branding
      const COLOR_CARAMEL = '#ca651b';     // Warm caramel accent for highlights & borders
      const COLOR_TEXT_DARK = '#1e0f0b';   // High-contrast readable body text
      const COLOR_TEXT_MUTED = '#6b5b54';  // Muted secondary text
      const COLOR_LINE = '#e6d7cc';        // Clean subtle divider lines
      const COLOR_TABLE_HEADER = '#f5ede6';// Cream table header fill
      const COLOR_ROW_ALT = '#faf6f2';     // Alternating row background

      // Geometry & Dimensions (A4: 595.28 x 841.89 pt)
      const PAGE_LEFT = 40;
      const PAGE_RIGHT = 555.28;
      const PAGE_WIDTH = PAGE_RIGHT - PAGE_LEFT; // 515.28 pt printable width

      // Initialize PDFKit Document in buffered mode for dynamic total page count
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
        info: {
          Title: `ZORA SHOP Invoice - ${invoiceNumber}`,
          Author: 'ZORA SHOP',
          Subject: `Delivered Order Invoice ${invoiceNumber}`,
          Creator: 'ZORA SHOP Invoicing System',
          Producer: 'PDFKit'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', err => reject(err));

      // =========================================================================
      // 1. BRAND HEADER & INVOICE IDENTIFIERS
      // =========================================================================
      let y = 40;

      // Left Column: Brand Header
      doc.font('Helvetica-Bold').fontSize(22).fillColor(COLOR_COCOA)
        .text(shopName, PAGE_LEFT, y);

      let headerLeftY = y + 26;
      if (shopTagline) {
        doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(COLOR_CARAMEL)
          .text(`"${shopTagline}"`, PAGE_LEFT, headerLeftY);
        headerLeftY += 14;
      }

      if (shopAddress) {
        doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED)
          .text(shopAddress, PAGE_LEFT, headerLeftY, { width: 260 });
        headerLeftY += doc.heightOfString(shopAddress, { width: 260, font: 'Helvetica', size: 8 }) + 2;
      }

      const shopContactParts = [
        shopPhone ? `WhatsApp: ${shopPhone}` : null,
        shopEmail ? `Email: ${shopEmail}` : null
      ].filter(Boolean);

      if (shopContactParts.length > 0) {
        doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED)
          .text(shopContactParts.join('  •  '), PAGE_LEFT, headerLeftY, { width: 280 });
        headerLeftY += 12;
      }

      // Right Column: Invoice Metadata (Heading changed from TAX INVOICE to INVOICE)
      doc.font('Helvetica-Bold').fontSize(18).fillColor(COLOR_COCOA)
        .text('INVOICE', PAGE_LEFT, y, { align: 'right', width: PAGE_WIDTH });

      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_CARAMEL)
        .text(`Invoice No: ${invoiceNumber}`, PAGE_LEFT, y + 24, { align: 'right', width: PAGE_WIDTH });

      doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DARK)
        .text(`Date of Issue: ${formatDate(issuedAt)}`, PAGE_LEFT, y + 38, { align: 'right', width: PAGE_WIDTH })
        .text(`Order Reference: ${orderNumber}`, PAGE_LEFT, y + 50, { align: 'right', width: PAGE_WIDTH })
        .text(`Delivered Date: ${formatDate(deliveryDate)}`, PAGE_LEFT, y + 62, { align: 'right', width: PAGE_WIDTH });

      // Decorative separator rule placed dynamically below the header blocks
      y = Math.max(headerLeftY + 4, 114);
      doc.rect(PAGE_LEFT, y, PAGE_WIDTH, 1.5).fill(COLOR_CARAMEL);

      // =========================================================================
      // 2. BILLED TO & PAYMENT/ORDER METADATA BLOCK
      // =========================================================================
      y += 12;

      // Left Column: Customer details
      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_CARAMEL)
        .text('BILLED & DELIVERED TO:', PAGE_LEFT, y);

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor(COLOR_TEXT_DARK)
        .text(customerName, PAGE_LEFT, y + 13);

      const customerContactParts = [
        customerPhone ? `Contact: ${customerPhone}` : null,
        customerEmail || null
      ].filter(Boolean);

      let addressY = y + 26;
      if (customerContactParts.length > 0) {
        doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED)
          .text(customerContactParts.join('  •  '), PAGE_LEFT, addressY);
        addressY += 13;
      }

      if (address) {
        const line1 = [address.house, address.street].filter(Boolean).join(', ');
        const line2 = [address.landmark ? `Landmark: ${address.landmark}` : null].filter(Boolean).join('');
        const line3 = [address.city, address.state, address.pincode].filter(Boolean).join(', ');

        doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DARK);
        if (line1) {
          doc.text(line1, PAGE_LEFT, addressY, { width: 250 });
          addressY += doc.heightOfString(line1, { width: 250, font: 'Helvetica', size: 8 }) + 2;
        }
        if (line2) {
          doc.text(line2, PAGE_LEFT, addressY, { width: 250 });
          addressY += doc.heightOfString(line2, { width: 250, font: 'Helvetica', size: 8 }) + 2;
        }
        if (line3) {
          doc.text(line3, PAGE_LEFT, addressY, { width: 250 });
          addressY += doc.heightOfString(line3, { width: 250, font: 'Helvetica', size: 8 }) + 2;
        }
        if (address.instructions) {
          doc.font('Helvetica-Oblique').fontSize(7.5).fillColor(COLOR_TEXT_MUTED);
          const noteText = `Delivery Note: ${address.instructions}`;
          doc.text(noteText, PAGE_LEFT, addressY, { width: 250 });
          addressY += doc.heightOfString(noteText, { width: 250, font: 'Helvetica-Oblique', size: 7.5 }) + 2;
        }
      } else {
        doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLOR_TEXT_MUTED)
          .text('Delivery address not specified on record', PAGE_LEFT, addressY);
        addressY += 12;
      }

      // Right Column: Payment & Order Information
      const RIGHT_COL_X = 330;

      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_CARAMEL)
        .text('PAYMENT & ORDER STATUS:', RIGHT_COL_X, y);

      doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DARK)
        .text('Payment Method:', RIGHT_COL_X, y + 14)
        .font('Helvetica-Bold')
        .text(isCod ? 'Cash on Delivery (COD)' : paymentMethod, RIGHT_COL_X + 80, y + 14);

      // Payment Status Badge (Amber for Pending COD, Emerald for Paid)
      const isCodPending = paymentStatus.toLowerCase().includes('pending') || isCod;
      const badgeBg = isCodPending ? '#fffbeb' : '#ecfdf5';
      const badgeBorder = isCodPending ? '#f59e0b' : '#10b981';
      const badgeText = isCodPending ? '#92400e' : '#065f46';

      doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DARK)
        .text('Payment Status:', RIGHT_COL_X, y + 28);

      const statusBoxX = RIGHT_COL_X + 80;
      const statusBoxY = y + 26;
      doc.roundedRect(statusBoxX, statusBoxY, 130, 16, 3)
        .fillAndStroke(badgeBg, badgeBorder);

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(badgeText)
        .text(paymentStatus, statusBoxX, statusBoxY + 4, { width: 130, align: 'center', lineBreak: false });

      if (orderedAt) {
        doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_MUTED)
          .text(`Order Placed: ${formatDate(orderedAt)}`, RIGHT_COL_X, y + 48);
      }

      // =========================================================================
      // 3. ITEMIZED PRODUCTS TABLE (Column geometry verified for wide numbers/names)
      // =========================================================================
      // Defined non-overlapping column boundaries across printable 515.28 pt:
      // - Description: 48 to 263 pt (width 215 pt)
      // - Unit Price: 270 to 360 pt (width 90 pt, right-aligned)
      // - Quantity: 365 to 405 pt (width 40 pt, centered)
      // - Line Total: 410 to 548 pt (width 138 pt, right-aligned)
      const COL_DESC_X = PAGE_LEFT + 8; // 48
      const COL_DESC_W = 215;
      const COL_PRICE_X = 270;
      const COL_PRICE_W = 90;
      const COL_QTY_X = 365;
      const COL_QTY_W = 40;
      const COL_TOTAL_X = 410;
      const COL_TOTAL_W = 138;

      function drawTableHeader(curY) {
        doc.roundedRect(PAGE_LEFT, curY, PAGE_WIDTH, 20, 2)
          .fill(COLOR_TABLE_HEADER);

        doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_COCOA);
        doc.text('ITEM DESCRIPTION & PACKAGING', COL_DESC_X, curY + 6, { width: COL_DESC_W });
        doc.text('UNIT PRICE', COL_PRICE_X, curY + 6, { width: COL_PRICE_W, align: 'right' });
        doc.text('QTY', COL_QTY_X, curY + 6, { width: COL_QTY_W, align: 'center' });
        doc.text('TOTAL AMOUNT', COL_TOTAL_X, curY + 6, { width: COL_TOTAL_W, align: 'right' });
        return curY + 22;
      }

      // Ensure table starts cleanly below customer info and payment box
      y = Math.max(addressY + 14, 210);
      y = drawTableHeader(y);

      if (items.length === 0) {
        // Fallback row for snapshot without item rows
        doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(COLOR_TEXT_MUTED)
          .text('No individual items recorded in invoice snapshot.', COL_DESC_X, y + 6);
        y += 24;
      } else {
        items.forEach((item, index) => {
          const itemName = item.name || 'Artisanal Chocolate Item';
          const pkg = item.packageName || (item.packageType === 'pack250g' ? '250g Box' : (item.packageType || 'Per Piece'));
          const price = Number(item.price || item.unitPrice || 0);
          const qty = Number(item.quantity || 1);
          const total = Number(item.total || (price * qty));

          // Estimate row height dynamically for wrapped text in title & package description
          const titleHeight = doc.heightOfString(itemName, { width: COL_DESC_W, font: 'Helvetica-Bold', size: 8.5 });
          const pkgHeight = doc.heightOfString(pkg, { width: COL_DESC_W, font: 'Helvetica', size: 7.5 });
          const rowHeight = Math.max(26, titleHeight + pkgHeight + 8);

          // Page overflow check (leaves room above footer at y = 755)
          if (y + rowHeight > 730) {
            doc.addPage();
            y = drawTableHeader(40);
          }

          // Alternating row background
          if (index % 2 === 1) {
            doc.rect(PAGE_LEFT, y, PAGE_WIDTH, rowHeight).fill(COLOR_ROW_ALT);
          }

          // Item name & package description
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor(COLOR_TEXT_DARK)
            .text(itemName, COL_DESC_X, y + 4, { width: COL_DESC_W });

          doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_MUTED)
            .text(pkg, COL_DESC_X, y + 4 + titleHeight, { width: COL_DESC_W });

          // Price, quantity and item total (vertically centered)
          const textY = y + Math.max(4, Math.floor((rowHeight - 12) / 2));
          doc.font('Helvetica').fontSize(8.5).fillColor(COLOR_TEXT_DARK)
            .text(formatCurrency(price), COL_PRICE_X, textY, { width: COL_PRICE_W, align: 'right' })
            .text(String(qty), COL_QTY_X, textY, { width: COL_QTY_W, align: 'center' })
            .font('Helvetica-Bold')
            .text(formatCurrency(total), COL_TOTAL_X, textY, { width: COL_TOTAL_W, align: 'right' });

          // Row separator line
          doc.rect(PAGE_LEFT, y + rowHeight, PAGE_WIDTH, 0.5).fill(COLOR_LINE);
          y += rowHeight + 1;
        });
      }

      // =========================================================================
      // 4. FINANCIAL SUMMARY & INVOICE TOTALS
      // =========================================================================
      const SUMMARY_BOX_HEIGHT = 80;

      // Check if financial summary boxes fit cleanly above footer (footer at 755)
      if (y + SUMMARY_BOX_HEIGHT + 15 > 735) {
        doc.addPage();
        y = 40;
      } else {
        y += 10;
      }

      // Left Box: Delivery & Payment Notice
      const noteBoxWidth = 265;
      doc.roundedRect(PAGE_LEFT, y, noteBoxWidth, SUMMARY_BOX_HEIGHT, 3)
        .fillAndStroke('#fdfbf9', COLOR_LINE);

      doc.font('Helvetica-Bold').fontSize(8).fillColor(COLOR_CARAMEL)
        .text('DELIVERY & PAYMENT NOTICE:', PAGE_LEFT + 10, y + 10);

      const noteText = isCod
        ? `Cash on Delivery is applicable for this order. Please ensure the exact cash amount of ${formatCurrency(grandTotal)} is handed to our delivery partner upon receipt.`
        : `Electronic payment recorded. Your order has been fulfilled by ${shopName}.`;

      doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_TEXT_DARK)
        .text(noteText, PAGE_LEFT + 10, y + 23, { width: noteBoxWidth - 20, lineGap: 2 });

      // Clean dietary note (unverified storage temperature removed)
      doc.font('Helvetica-Oblique').fontSize(7).fillColor(COLOR_TEXT_MUTED)
        .text('• 100% Pure Vegetarian Handcrafted Homemade Chocolates', PAGE_LEFT + 10, y + 62);

      // Right Box: Financial Breakdown
      const summaryBoxX = 325;
      const summaryBoxWidth = PAGE_RIGHT - summaryBoxX;

      doc.roundedRect(summaryBoxX, y, summaryBoxWidth, SUMMARY_BOX_HEIGHT, 3)
        .fillAndStroke(COLOR_TABLE_HEADER, COLOR_LINE);

      const sumPadX = summaryBoxX + 10;
      const sumValWidth = summaryBoxWidth - 20;

      let sumY = y + 8;
      doc.font('Helvetica').fontSize(8).fillColor(COLOR_TEXT_DARK)
        .text('Subtotal:', sumPadX, sumY)
        .text(formatCurrency(subtotal), sumPadX, sumY, { width: sumValWidth, align: 'right' });

      sumY += 13;
      doc.text('Delivery Charges:', sumPadX, sumY)
        .text(deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee), sumPadX, sumY, { width: sumValWidth, align: 'right' });

      sumY += 13;
      doc.text('Discount / Promo:', sumPadX, sumY)
        .fillColor(discount > 0 ? '#15803d' : COLOR_TEXT_DARK)
        .text(discount > 0 ? `- ${formatCurrency(discount)}` : 'Rs. 0.00', sumPadX, sumY, { width: sumValWidth, align: 'right' });

      sumY += 15;
      doc.rect(sumPadX, sumY, sumValWidth, 1).fill(COLOR_CARAMEL);

      sumY += 5;
      doc.font('Helvetica-Bold').fontSize(10).fillColor(COLOR_COCOA)
        .text('Grand Total:', sumPadX, sumY)
        .text(formatCurrency(grandTotal), sumPadX, sumY, { width: sumValWidth, align: 'right' });

      // =========================================================================
      // 5. FOOTER & MULTI-PAGE NUMBERING (Fixed footer positioning at y = 755)
      // =========================================================================
      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (let i = range.start; i < range.start + totalPages; i++) {
        doc.switchToPage(i);

        const footerY = 755;
        doc.rect(PAGE_LEFT, footerY, PAGE_WIDTH, 0.75).fill(COLOR_LINE);

        doc.font('Helvetica-Oblique').fontSize(8).fillColor(COLOR_COCOA)
          .text('Thank you for choosing ZORA SHOP! Handcrafted with pure love & care.', PAGE_LEFT, footerY + 6, {
            width: PAGE_WIDTH,
            align: 'center',
            lineBreak: false
          });

        const footerContactParts = [
          shopPhone ? `WhatsApp: ${shopPhone}` : null,
          shopEmail ? `Email: ${shopEmail}` : null
        ].filter(Boolean);

        if (footerContactParts.length > 0) {
          doc.font('Helvetica').fontSize(7).fillColor(COLOR_TEXT_MUTED)
            .text(`Boutique Contact: ${footerContactParts.join('  •  ')}`, PAGE_LEFT, footerY + 18, {
              width: PAGE_WIDTH - 90,
              align: 'center',
              lineBreak: false
            });
        }

        doc.font('Helvetica').fontSize(7.5).fillColor(COLOR_CARAMEL)
          .text(`Page ${i + 1} of ${totalPages}`, PAGE_LEFT, footerY + 18, {
            width: PAGE_WIDTH,
            align: 'right',
            lineBreak: false
          });
      }

      // Finalize the PDF stream
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
