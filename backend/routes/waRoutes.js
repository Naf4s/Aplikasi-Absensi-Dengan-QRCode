import express from 'express';
import { getQRStatus } from '../service/waService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const status = getQRStatus();
  res.json(status);
});

export default router;
