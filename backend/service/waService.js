// waService.js
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

let qrCode = null;
let isReady = false;

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  console.log('📲 QR received');
  qrCode = qr;
  isReady = false;
});

client.on('ready', () => {
  console.log('✅ WhatsApp is ready');
  qrCode = null;
  isReady = true;
});

client.initialize();

export function getQRStatus() {
  return { qr: qrCode, isReady };
}

export async function sendWA(number, message) {
  const formatted = number.includes('@c.us') ? number : `${number}@c.us`;
  await client.sendMessage(formatted, message);
}
