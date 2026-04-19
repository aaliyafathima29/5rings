const QRCode = require('qrcode');
const crypto = require('crypto');

const buildPayload = ({ eventId, userId, seatNumber, category, price }) => ({
  eventId,
  userId,
  seatNumber: seatNumber || null,
  category: category || null,
  price: Number(price || 0),
  issuedAt: new Date().toISOString(),
  nonce: crypto.randomBytes(8).toString('hex'),
});

const generateTicketQr = async (data) => {
  const payload = buildPayload(data);
  return QRCode.toDataURL(JSON.stringify(payload), { errorCorrectionLevel: 'M' });
};

module.exports = {
  generateTicketQr,
};
