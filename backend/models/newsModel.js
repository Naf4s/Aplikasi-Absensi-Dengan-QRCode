import { getDb } from '../utils/database.js';

const NewsModel = {
  async getAll() {
    const db = getDb();
    return db.all('SELECT * FROM news ORDER BY date DESC');
  },

  async getById(id) {
    const db = getDb();
    return db.get('SELECT * FROM news WHERE id = ?', id);
  },

  async create(news) {
    const db = getDb();
    const { title, content, date, imageUrl } = news;
    const result = await db.run(
      'INSERT INTO news (title, content, date, imageUrl) VALUES (?, ?, ?, ?)',
      title, content, date, imageUrl
    );
    return { id: result.lastID, ...news };
  },

  async update(id, news) {
    const db = getDb();
    const { title, content, date, imageUrl } = news;
    await db.run(
      'UPDATE news SET title = ?, content = ?, date = ?, imageUrl = ? WHERE id = ?',
      title, content, date, imageUrl, id
    );
    return { id, ...news };
  },

  async delete(id) {
    const db = getDb();
    await db.run('DELETE FROM news WHERE id = ?', id);
  }
};

export default NewsModel;
