const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');

router.get('/status', (req, res) => {
  res.json({
    status: whatsappService.getStatus(),
    ready: whatsappService.isReady(),
    hasQr: Boolean(whatsappService.getQrDataUrl()),
    qrDataUrl: whatsappService.getQrDataUrl()
  });
});

router.get('/qr', (req, res) => {
  const qrDataUrl = whatsappService.getQrDataUrl();
  if (qrDataUrl) {
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
    const img = Buffer.from(base64Data, 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    res.end(img);
  } else {
    res.status(404).json({
      error: 'QR code not available yet or already authenticated',
      status: whatsappService.getStatus()
    });
  }
});

module.exports = router;
