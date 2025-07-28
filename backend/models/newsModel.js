import { getDb } from '../utils/database.js';

export const getAll = async () => {
  const db = getDb();
  return db.all('SELECT * FROM news ORDER BY date DESC');
};

export const getById = async (id) => {
  const db = getDb();
  return db.get('SELECT * FROM news WHERE id = ?', id);
};

export const create = async (news) => {
  const db = getDb();
  const { title, content, date, imageUrl } = news;
  const result = await db.run(
    'INSERT INTO news (title, content, date, imageUrl) VALUES (?, ?, ?, ?)',
    title, content, date, imageUrl
  );
  return { id: result.lastID, ...news };
};

export const update = async (id, news) => {
  const db = getDb();
  const { title, content, date, imageUrl } = news;
  await db.run(
    'UPDATE news SET title = ?, content = ?, date = ?, imageUrl = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    title, content, date, imageUrl, id
  );
  return { id, ...news };
};

export const deleteById = async (id) => {
  const db = getDb();
  await db.run('DELETE FROM news WHERE id = ?', id);
};
