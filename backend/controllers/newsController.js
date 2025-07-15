import News from '../models/newsModel.js';

// Get all news
export const getAllNews = async (req, res) => {
  try {
    const news = await News.getAll();
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve news', error });
  }
};

// Get news by ID
export const getNewsById = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve news', error });
  }
};

// Create new news
export const createNews = async (req, res) => {
  try {
    const { title, content, date, imageUrl } = req.body;
    const newNews = await News.create({ title, content, date, imageUrl });
    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create news', error });
  }
};

// Update news by ID
export const updateNews = async (req, res) => {
  try {
    const { title, content, date, imageUrl } = req.body;
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    await News.update(req.params.id, { title, content, date, imageUrl });
    res.json({ id: req.params.id, title, content, date, imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update news', error });
  }
};

// Delete news by ID
export const deleteNews = async (req, res) => {
  try {
    const news = await News.getById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    await News.delete(req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete news', error });
  }
};
