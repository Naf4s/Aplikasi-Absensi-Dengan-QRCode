import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController.js';

const router = express.Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes
router.use(authMiddleware);

router.post('/', createNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router;
