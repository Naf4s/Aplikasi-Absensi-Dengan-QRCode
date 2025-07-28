// backend/models/settingsModel.js
import { getDb } from '../utils/database.js';

/**
 * Mengambil semua pengaturan dari database.
 * @returns {Promise<Array>} Array berisi objek pengaturan.
 */
export const getAllSettings = async () => {
  const db = getDb();
  return db.all('SELECT key, value FROM settings');
};

/**
 * Memperbarui beberapa pengaturan sekaligus.
 * @param {Array<{key: string, value: string}>} settings - Array objek pengaturan.
 * @returns {Promise<void>}
 */
export const updateSettings = async (settings) => {
  const db = getDb();

  // Gunakan transaksi untuk memastikan semua pembaruan berhasil atau tidak sama sekali
  await db.run('BEGIN TRANSACTION');
  try {
    for (const setting of settings) {
      // Query ini akan meng-INSERT baris baru, atau meng-UPDATE 'value' jika 'key' sudah ada.
      // klausa `updated_at = CURRENT_TIMESTAMP` dihapus karena kolom itu tidak ada di tabel `settings`.
      // `excluded.value` digunakan untuk merujuk pada nilai yang coba di-insert, sehingga lebih efisien.
      await db.run(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        setting.key, setting.value
      );
    }
    await db.run('COMMIT');
  } catch (error) {
    await db.run('ROLLBACK');
    throw error; // Lemparkan error agar bisa ditangkap oleh controller
  }
};