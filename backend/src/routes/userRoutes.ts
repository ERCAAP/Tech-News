import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMe,
  updateUserStatus
} from '../controllers/userController';
import { protect, restrictTo } from '../middleware/authMiddleware';

const router = express.Router();

// Protected routes
router.use(protect);

// Current user routes
router.get('/me', getMe);
router.patch('/updateMe', updateUser);
router.patch('/updateMyStatus', updateUserStatus);

// Admin only routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUserById)
  .delete(deleteUser);

export default router; 