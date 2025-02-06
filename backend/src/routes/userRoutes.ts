import express from 'express';
import { protect, restrictTo } from '../middleware/authMiddleware';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  updateSubscription
} from '../controllers/userController';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// User routes
router.patch('/update-me', updateMe);
router.delete('/delete-me', deleteMe);
router.post('/update-subscription', updateSubscription);

// Admin routes
router.use(restrictTo('admin'));
router.route('/')
  .get(getAllUsers);

router.route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

export default router; 