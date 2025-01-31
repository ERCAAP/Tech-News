import express from 'express';
import { createNews, getAllNews, getNewsById, updateNews } from '../controllers/newsController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/', 
  auth, 
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]), 
  createNews
);

router.patch('/:id',
  auth,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]),
  updateNews
);

// Diğer route'lar...

export default router; 