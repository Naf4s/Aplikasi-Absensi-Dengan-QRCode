import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../utils/database.js';

export async function getAllPrograms() {
  const db = await getDb();
  return db.all('SELECT * FROM programs ORDER BY rowid DESC');
}

export async function getProgramById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM programs WHERE id = ?', id);
}

export async function createProgram({ title, content, imageUrl }) {
  const db = await getDb();
  const id = uuidv4();
  await db.run(
    'INSERT INTO programs (id, title, content, imageUrl) VALUES (?, ?, ?, ?)',
    id, title, content, imageUrl || null
  );
  return getProgramById(id);
}

export async function updateProgram(id, { title, content, imageUrl }) {
  const db = await getDb();
  await db.run(
    'UPDATE programs SET title = ?, content = ?, imageUrl = ? WHERE id = ?',
    title, content, imageUrl || null, id
  );
  return getProgramById(id);
}

export async function deleteProgram(id) {
  const db = await getDb();
  await db.run('DELETE FROM programs WHERE id = ?', id);
  return true;
} 