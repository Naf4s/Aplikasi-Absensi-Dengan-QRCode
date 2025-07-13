import pkg from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
const { Client, LocalAuth } = pkg;

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  console.log('📲 Scan QR berikut ini dengan WhatsApp:');
  qrcode.generate(qr, { small: true }); // ✅ Menampilkan QR ke terminal
});

client.on('ready', () => {
  console.log('✅ Bot WhatsApp siap!');
});

client.initialize();

export async function sendWA(number, message) {
  const formatted = number.includes('@c.us') ? number : `${number}@c.us`;
  await client.sendMessage(formatted, message);
}
