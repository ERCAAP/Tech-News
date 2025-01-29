import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} from '../controllers/userController';

const router = Router();

// Protected routes
router.use(protect);

// Normal user routes
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);

// Admin only routes
router.use(restrictTo('admin'));
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 