// backend/models/userModel.js
import { getDb } from '../utils/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Ini Wajib Kamu Ingat! (Prinsip #3: Keamanan Password)
// Jangan pernah menyimpan password mentah. Gunakan bcrypt untuk hashing.

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const createUser = async (name, email, password, role = 'teacher') => {
  const db = getDb();
  const id = uuidv4();
  const hashedPassword = await hashPassword(password);
  const createdAt = new Date().toISOString();

  await db.run(
    'INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    id, name, email, hashedPassword, role, createdAt
  );

  return { id, name, email, role }; // Jangan kembalikan password!
};

export const findByEmail = async (email) => {
  const db = getDb();
  return db.get('SELECT * FROM users WHERE email = ?', email);
};

export const findById = async (id) => {
  const db = getDb();
  return db.get('SELECT id, name, email, role FROM users WHERE id = ?', id); // Hanya ambil info yang perlu
};

export const getUsers = async () => {
  const db = getDb();
  return db.all('SELECT id, name, email, role FROM users'); // Hanya ambil info yang perlu
};

export const updateUser = async (id, name, email, password, role) => {
  const db = getDb();
  let query = 'UPDATE users SET name = ?, email = ?, role = ?';
  const params = [name, email, role];

  if (password) {
    const hashedPassword = await hashPassword(password);
    query += ', password = ?';
    params.push(hashedPassword);
  }

  query += ' WHERE id = ?';
  params.push(id);

  await db.run(query, ...params);
  return { id, name, email, role };
};

export const deleteUser = async (id) => {
  const db = getDb();
  await db.run('DELETE FROM users WHERE id = ?', id);
};
