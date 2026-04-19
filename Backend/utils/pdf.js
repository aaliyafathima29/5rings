const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const resolveLogoPath = () => {
  const candidates = [
    path.resolve(__dirname, '../../frontend/public/5rings.jpg'),
    path.resolve(__dirname, '../uploads/company-logo.jpg'),
    path.resolve(__dirname, '../uploads/company-logo.png'),
  ];

  return candidates.find((p) => fs.existsSync(p)) || null;
};

const dataUrlToBuffer = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:image\/\w+;base64,(.*)$/);
  if (!match || !match[1]) return null;
  return Buffer.from(match[1], 'base64');
};

const buildTicketPdf = ({ ticket, event, user }) => {
  const doc = new PDFDocument({ size: 'A4', margin: 42 });

  const left = doc.page.margins.left;
  const top = doc.page.margins.top;
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - doc.page.margins.left - doc.page.margins.right;

  const colors = {
    midnight: '#0b1120',
    charcoal: '#111827',
    slate: '#1f2937',
    silver: '#e5e7eb',
    smoke: '#94a3b8',
    gold: '#d4af37',
    goldDark: '#b38b1a',
    white: '#ffffff',
  };

  const formatDate = (value) => {
    if (!value) return 'TBA';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'TBA';
    return parsed.toLocaleString();
  };

  const drawShadowCard = (x, y, width, height) => {
    doc.save();
    doc.roundedRect(x + 2, y + 3, width, height, 14).fill('#0f172a');
    doc.roundedRect(x, y, width, height, 14).fill(colors.charcoal);
    doc.restore();
  };

  // Background tone
  doc.save();
  doc.rect(0, 0, pageWidth, pageHeight).fill('#0a0f1f');
  doc.restore();

  // Header band
  doc.save();
  doc.roundedRect(left, top, contentWidth, 120, 18).fill(colors.midnight);
  doc.restore();

  doc.save();
  doc.rect(left, top + 100, contentWidth, 4).fill(colors.gold);
  doc.restore();

  const logoPath = resolveLogoPath();
  if (logoPath) {
    doc.image(logoPath, left + 20, top + 18, { width: 70, height: 70 });
  } else {
    doc.roundedRect(left + 20, top + 18, 70, 70, 10).stroke(colors.gold);
  }

  doc
    .font('Helvetica-Bold')
    .fontSize(22)
    .fillColor(colors.white)
    .text('5Rings Event Ticket', left + 110, top + 22, { width: contentWidth - 130 });

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(colors.silver)
    .text('Luxury Entry Pass', left + 110, top + 52, { width: contentWidth - 130 });

  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(colors.gold)
    .text('ADMIT ONE', left + 110, top + 76, { width: contentWidth - 130 });

  // Event banner
  const bannerY = top + 140;
  drawShadowCard(left, bannerY, contentWidth, 70);

  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor(colors.white)
    .text(event?.title || 'Event', left + 22, bannerY + 18, { width: contentWidth - 44 });

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(colors.silver)
    .text(`${event?.sport || 'Sport'} • ${event?.venue?.name || event?.venueName || 'Venue TBA'} • ${formatDate(event?.startDate)}`, left + 22, bannerY + 42, { width: contentWidth - 44 });

  // Detail cards
  const cardY = bannerY + 90;
  const cardGap = 18;
  const cardWidth = (contentWidth - cardGap) / 2;
  const cardHeight = 190;

  drawShadowCard(left, cardY, cardWidth, cardHeight);
  drawShadowCard(left + cardWidth + cardGap, cardY, cardWidth, cardHeight);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(colors.gold)
    .text('Event Details', left + 18, cardY + 16, { width: cardWidth - 36 });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.silver)
    .text(`Event: ${event?.title || 'N/A'}`, left + 18, cardY + 42, { width: cardWidth - 36 })
    .text(`Sport: ${event?.sport || 'N/A'}`, left + 18, cardY + 62, { width: cardWidth - 36 })
    .text(`Venue: ${event?.venue?.name || event?.venueName || 'TBA'}`, left + 18, cardY + 82, { width: cardWidth - 36 })
    .text(`Date: ${formatDate(event?.startDate)}`, left + 18, cardY + 102, { width: cardWidth - 36 });

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(colors.gold)
    .text('Ticket Details', left + cardWidth + cardGap + 18, cardY + 16, { width: cardWidth - 36 });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.silver)
    .text(`Name: ${user?.name || 'Guest'}`, left + cardWidth + cardGap + 18, cardY + 42, { width: cardWidth - 36 })
    .text(`Category: ${ticket?.category || 'N/A'}`, left + cardWidth + cardGap + 18, cardY + 62, { width: cardWidth - 36 })
    .text(`Seat(s): ${ticket?.seatNumber || 'N/A'}`, left + cardWidth + cardGap + 18, cardY + 82, { width: cardWidth - 36 })
    .text(`Price: INR ${Number(ticket?.price || 0).toLocaleString()}`, left + cardWidth + cardGap + 18, cardY + 102, { width: cardWidth - 36 })
    .text(`Booking ID: ${ticket?._id || 'N/A'}`, left + cardWidth + cardGap + 18, cardY + 122, { width: cardWidth - 36 });

  // QR section
  const qrY = cardY + cardHeight + 26;
  drawShadowCard(left, qrY, contentWidth, 170);

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(colors.gold)
    .text('Entry QR Code', left + 18, qrY + 16);

  const qrBuffer = dataUrlToBuffer(ticket?.qrCode);
  if (qrBuffer) {
    doc.image(qrBuffer, left + 22, qrY + 50, { width: 110, height: 110 });
  }

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.silver)
    .text('Present this QR at the entry gate with a valid ID.', left + 150, qrY + 60, { width: contentWidth - 170 })
    .text('Gates open 30 minutes before start time.', left + 150, qrY + 84, { width: contentWidth - 170 });

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(colors.smoke)
    .text('Luxury access powered by 5Rings Sports Arena', left, pageHeight - 50, { width: contentWidth, align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#6b7280')
    .text('Template v2', left, pageHeight - 36, { width: contentWidth, align: 'center' });

  doc.end();
  return doc;
};

module.exports = {
  buildTicketPdf,
};
