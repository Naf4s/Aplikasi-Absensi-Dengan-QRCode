// backend/controllers/settingsController.js
import * as settingsModel from '../models/settingsModel.js';
import { getQRStatus } from '../service/waService.js';

/**
 * Mengambil status koneksi WhatsApp, termasuk QR code jika belum terhubung.
 */
export const getWaStatus = async (req, res) => {
  try {
    const qr = getQRStatus();

    // getQRStatus() dari waService mengembalikan objek: { qr, isReady }
    const status = getQRStatus();
    // Kirim objek status tersebut sebagai respons JSON ke frontend
    res.status(200).json(status);
  } catch (error) {
    console.error("Error getting WA status:", error);
    res.status(500).json({ message: "Gagal mengambil status WhatsApp." });
  }
};
/**
 * Mengambil semua pengaturan.
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await settingsModel.getAllSettings();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Gagal mengambil pengaturan.' });
  }
};

/**
 * Memperbarui pengaturan.
 */
export const updateSettings = async (req, res) => {
  try {
    const settingsToUpdate = req.body;

    if (!Array.isArray(settingsToUpdate) || settingsToUpdate.length === 0) {
      return res.status(400).json({ message: 'Format data tidak valid. Harap sediakan array pengaturan.' });
    }

    // Hanya admin yang boleh mengubah pengaturan
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengubah pengaturan.' });
    }

    await settingsModel.updateSettings(settingsToUpdate);
    res.status(200).json({ message: 'Pengaturan berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Gagal memperbarui pengaturan.' });
  }
};