import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRegistration, validateLogin } from '../utils/validators';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// JWT token oluşturma yardımcı fonksiyonu
const createToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  };

  return jwt.sign({ id }, JWT_SECRET, options);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  // Email kontrolü
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already exists', 400);
  }

  // Yeni kullanıcı oluştur
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: 'user',
    favoriteNews: []
  });

  // Token oluştur
  const token = createToken(user._id.toString());

  // Şifreyi response'dan çıkar
  const userObject = user.toObject();
  userObject.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: { user: userObject }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and select password
  const user = await User.findOne({ email }).select('+password') as IUser;
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = createToken(user._id.toString());

  // Remove password from response
  const userObject = user.toObject();
  userObject.password = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: { user: userObject }
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