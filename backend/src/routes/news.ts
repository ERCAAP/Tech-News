import express, { Request, Response, NextFunction } from 'express';
import { createNews, getAllNews, getNewsById, updateNews } from '../controllers/newsController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/upload';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

const router = express.Router();

router.post('/', 
  auth, 
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]), 
  (req: AuthRequest, res: Response, next: NextFunction) => createNews(req, res, next)
);

router.patch('/:id',
  auth,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImages', maxCount: 10 }
  ]),
  (req: AuthRequest, res: Response, next: NextFunction) => updateNews(req, res, next)
);

// Diğer route'lar...

export default router; 