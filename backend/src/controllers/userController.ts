import { Request, Response } from 'express';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthRequest } from '../types/express';

// Get all users
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.findAll();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

// Get user by ID
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Update user
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const userId = req.user.userId;
  const updatedUser = await User.findByIdAndUpdate(userId, req.body);

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

// Delete user
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const deleted = await User.findByIdAndDelete(req.user.userId);

  if (!deleted) {
    throw new AppError('User not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get current user
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Update user active status
export const updateUserStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('Unauthorized', 401);
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.userId, {
    isActive: req.body.isActive
  });

  if (!updatedUser) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser }
  });
});

// Update user profile
export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.body.password) {
    throw new AppError('This route is not for password updates. Please use /update-password', 400);
  }
  if (!req.user?.userId) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findByIdAndUpdate(req.user.userId, req.body);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Delete own account
export const deleteMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('User not found', 404);
  }

  await User.findByIdAndUpdate(req.user.userId, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Update subscription
export const updateSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    throw new AppError('User not found', 404);
  }

  const { isSubscribed, plan } = req.body;

  const user = await User.findByIdAndUpdate(req.user.userId, { 
    subscription: {
      isSubscribed,
      plan,
      updatedAt: new Date().toISOString()
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
    success: true
  });
}); 