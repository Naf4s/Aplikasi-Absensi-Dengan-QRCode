import express from 'express';
import { login, register } from '../controllers/authController.js';

const router = express.Router();

// Route untuk login
router.post('/login', login);

// Route untuk register (opsional, bisa digunakan oleh admin untuk menambah user baru)
router.post('/register', register);

export default router;