import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

// Tüm kullanıcıları getir (Admin)
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

// Tek kullanıcı getir (Admin)
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Kullanıcı güncelle (Admin)
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Kullanıcı sil (Admin)
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Kendi profilini güncelle
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  // Şifre güncellemeye izin verme
  if (req.body.password) {
    throw new AppError('This route is not for password updates. Please use /update-password', 400);
  }
  if (!req.user?.id) {
    throw new AppError('User not found', 404);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    req.body,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Kendi hesabını sil
export const deleteMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('User not found', 404);
  }

  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Abonelik durumunu güncelle
export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('User not found', 404);
  }

  const { isSubscription, subscriptionPlan } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      isSubscription,
      subscriptionPlan,
      subscriptionUpdatedAt: new Date()
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user },
    success: true
  });
}); 