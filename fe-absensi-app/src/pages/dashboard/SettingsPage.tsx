import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const SettingsPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState('');

  const [qr, setQr] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const fetchQRStatus = async () => {
    try {
      const response = await fetch("/api/wa-status");
      const data = await response.json();
      setQr(data.qr);
      setIsReady(data.isReady);
    } catch (error) {
      console.error("❌ Gagal fetch QR status:", error);
    }
  };

  useEffect(() => {
    fetchQRStatus(); // ambil data awal
    const interval = setInterval(fetchQRStatus, 3000); // polling setiap 3 detik

    return () => clearInterval(interval); // bersihkan timer saat unmount
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      setMessage('Name is required.');
      return;
    }
    if (!email.trim()) {
      setMessage('Email is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    // Simulate saving changes (e.g., API call)
    // For now, just show success message
    setMessage('Settings saved successfully.');

    // Here you could add API call to save settings
    // e.g., saveSettings({ name, email, emailNotifications, darkMode });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
          {message && (
            <p className="mt-4 text-sm text-green-600">{message}</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-3">
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
          {!isReady && qr ? (
            <div className="flex flex-col items-center justify-center">
              <p className="text-gray-700 mb-3">Scan QR code ini dengan WhatsApp:</p>
              <div className="p-2 border border-gray-300 bg-white rounded shadow-sm">
                <QRCodeSVG value={qr} size={200} level="M" fgColor="#000000" bgColor="#FFFFFF" includeMargin />
              </div>
              <p className="mt-3 text-sm text-gray-600">Pastikan ponsel Anda terhubung ke internet.</p>
            </div>
          ) : isReady ? (
            <div className="text-center text-green-600 font-medium">
              <p>✅ WhatsApp sudah terhubung dan siap!</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Menunggu QR Code dari server...</p>
              <p className="text-sm">Pastikan server Anda berjalan.</p>
            </div>
          )}
        </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                className="mr-2"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
              />
              <label htmlFor="emailNotifications">Email Notifications</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                className="mr-2"
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
              <label htmlFor="darkMode">Dark Mode</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
