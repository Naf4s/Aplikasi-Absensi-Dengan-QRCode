import * as programModel from '../models/programModel.js';

export const getPrograms = async (req, res) => {
  try {
    const programs = await programModel.getAllPrograms();
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data program.' });
  }
};

export const getProgramById = async (req, res) => {
  try {
    const program = await programModel.getProgramById(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program tidak ditemukan.' });
    res.status(200).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data program.' });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Judul dan konten wajib diisi.' });
    const program = await programModel.createProgram({ title, content, imageUrl });
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat program.' });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Judul dan konten wajib diisi.' });
    const program = await programModel.updateProgram(req.params.id, { title, content, imageUrl });
    res.status(200).json(program);
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui program.' });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    await programModel.deleteProgram(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus program.' });
  }
}; 