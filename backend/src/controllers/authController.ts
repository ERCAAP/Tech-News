import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

// JWT yapılandırması
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES_IN = '30d'; // 30 gün

// JWT token oluşturma
const createToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Kullanıcıyı bul ve şifreyi seç
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Şifre kontrolü
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Token oluştur
    const token = createToken(user._id.toString());

    // Şifreyi response'dan çıkar
    const userObject = user.toObject();
    delete userObject.password;

    logger.info(`User logged in successfully: ${user._id}`);

    // Cookie'ye token'ı kaydet
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 gün
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(200).json({
      status: 'success',
      token,
      data: { user: userObject }
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
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
      role: 'user'
    });

    // Token oluştur
    const token = createToken(user._id.toString());

    // Şifreyi response'dan çıkar
    const userObject = user.toObject();
    delete userObject.password;

    logger.info(`New user registered: ${user._id}`);

    // Cookie'ye token'ı kaydet
    res.cookie('jwt', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.status(201).json({
      status: 'success',
      token,
      data: { user: userObject }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
});

// Token kontrolü
export const verifyToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    throw new AppError('Invalid token', 401);
  }
});

// Çıkış yap
export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ status: 'success' });
});

// Kullanıcı bilgilerini getir
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user.id).select('-password');
  
  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

// Şifre güncelleme
export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = createToken(user._id.toString());

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully'
  });
}); 