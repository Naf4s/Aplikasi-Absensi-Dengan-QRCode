import * as News from '../models/newsModel.js';

// Get all news (Publik, bisa diakses siapa saja)
export const getAllNews = async (req, res) => {
  try {
    const news = await News.getAll();
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Gagal mengambil data berita.' });
  }
};

// Get news by ID (Publik, bisa diakses siapa saja)
export const getNewsById = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    }
    res.json(news);
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    res.status(500).json({ message: 'Gagal mengambil data berita.' });
  }
};

// Create new news (Hanya Admin)
export const createNews = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menambah berita.' });
  }

  const { title, content, date, imageUrl } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Judul, konten, dan tanggal wajib diisi.' });
  }

  try {
    const newNews = await News.create({ title, content, date, imageUrl });
    res.status(201).json({ message: 'Berita berhasil ditambahkan.', news: newNews });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Gagal membuat berita.' });
  }
};

// Update news by ID (Hanya Admin)
export const updateNews = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa mengedit berita.' });
  }

  const { title, content, date, imageUrl } = req.body;
  if (!title || !content || !date) {
    return res.status(400).json({ message: 'Judul, konten, dan tanggal wajib diisi.' });
  }

  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Berita tidak ditemukan.' });
    }
    const updatedNews = await News.update(req.params.id, { title, content, date, imageUrl });
    res.status(200).json({ message: 'Berita berhasil diperbarui.', news: updatedNews });
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: 'Gagal memperbarui berita.' });
  }
};

// Delete news by ID (Hanya Admin)
export const deleteNews = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang bisa menghapus berita.' });
  }

  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    await News.delete(req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Gagal menghapus berita.' });
  }
};
