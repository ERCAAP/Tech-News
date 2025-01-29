import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRegistration, validateLogin } from '../utils/validators';

// JWT token oluşturma yardımcı fonksiyonu
const createToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: Number(process.env.JWT_EXPIRES_IN) || 24 * 60 * 60 // 24 saat (saniye cinsinden)
  };
  
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'your-secret-key',
    options
  );
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = validateRegistration(req.body);

  // Check if user exists
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    email: validatedData.email,
    password: validatedData.password,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName
  });

  // Generate token
  const token = createToken(user._id.toString());

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: { user }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = validateLogin(req.body);

  // Find user
  const user = await User.findOne({ email: validatedData.email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(validatedData.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = createToken(user._id.toString());

  res.status(200).json({
    status: 'success',
    token
  });
});

// Kullanıcı bilgilerini getir
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select('-password');
  
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Şifre güncelleme
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully'
  });
}); 