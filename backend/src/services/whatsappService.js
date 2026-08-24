const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');

let waClientReady = false;
let waQrCode = null;
let waQrDataUrl = null;
let waStatus = 'initializing'; // 'initializing' | 'qr_ready' | 'ready' | 'auth_failure' | 'disconnected'

const waClient = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    executablePath: (() => {
      try {
        const puppeteer = require('puppeteer');
        return puppeteer.executablePath();
      } catch {
        return 'C:\\Users\\Dell\\.cache\\puppeteer\\chrome\\win64-146.0.7680.31\\chrome-win64\\chrome.exe';
      }
    })(),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu'
    ]
  }
});

waClient.on('qr', async (qr) => {
  waQrCode = qr;
  try {
    waQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
  } catch (err) {
    console.error('QR data URL error:', err.message);
  }
  waStatus = 'qr_ready';
  console.log('\n==================================================');
  console.log('📱 WHATSAPP QR CODE — Scan with your phone!');
  console.log('   Open WhatsApp → Settings → Linked Devices → Link a Device');
  console.log('==================================================\n');
  qrcode.generate(qr, { small: true });
});

waClient.on('ready', () => {
  waClientReady = true;
  waQrCode = null;
  waQrDataUrl = null;
  waStatus = 'ready';
  console.log('\n✅ WhatsApp Personal Account CONNECTED & READY!');
  console.log('   Messages will now be sent from your WhatsApp.\n');
});

waClient.on('authenticated', () => {
  console.log('🔐 WhatsApp authenticated successfully.');
});

waClient.on('auth_failure', (msg) => {
  waClientReady = false;
  waStatus = 'auth_failure';
  console.error('❌ WhatsApp authentication failure:', msg);
});

waClient.on('disconnected', (reason) => {
  waClientReady = false;
  waStatus = 'disconnected';
  console.warn('⚠️ WhatsApp client disconnected:', reason);
});

async function initWhatsApp() {
  try {
    console.log('🔄 Initializing WhatsApp client...');
    await waClient.initialize();
  } catch (err) {
    console.error('❌ Failed to initialize WhatsApp Web client:', err.message);
    waStatus = 'disconnected';
  }
}

async function sendWhatsAppMessage(to, message) {
  const cleanNumber = (to || '').replace(/\D/g, '');
  if (!cleanNumber) {
    return { success: false, error: 'No phone number provided' };
  }

  const chatId = `${cleanNumber}@c.us`;

  if (waClientReady) {
    try {
      const isRegistered = await waClient.isRegisteredUser(chatId);
      if (!isRegistered) {
        console.warn(`⚠️ Phone number ${cleanNumber} is not registered on WhatsApp.`);
        return { success: false, error: `Phone number ${cleanNumber} is not on WhatsApp.` };
      }

      await waClient.sendMessage(chatId, message);
      console.log(`\n📱 [WHATSAPP DISPATCH] Message sent to ${cleanNumber}\n`);
      return { success: true, messageId: `msg-${Date.now()}` };
    } catch (err) {
      console.error(`❌ Failed to send WhatsApp message to ${cleanNumber}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n📱 [WHATSAPP CLIENT NOT CONNECTED] Message for ${cleanNumber}:`);
    console.log('---');
    console.log(message);
    console.log('---\n');
    return {
      success: true,
      mock: true,
      message: `WhatsApp client is ${waStatus}. Scan the QR code in your terminal or use click-to-chat.`
    };
  }
}

module.exports = {
  waClient,
  initWhatsApp,
  sendWhatsAppMessage,
  getStatus: () => waStatus,
  getQrCode: () => waQrCode,
  getQrDataUrl: () => waQrDataUrl,
  isReady: () => waClientReady
};
