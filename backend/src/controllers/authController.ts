import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
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

// Request tipini genişlet
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login Request Body:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ve şifre gereklidir'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !user.password) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz email veya şifre'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz email veya şifre'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Kullanıcı objesini kopyala ve şifreyi çıkar
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      favoriteNews: user.favoriteNews
    };

    res.status(200).json({
      status: 'success',
      data: { user: userResponse },
      token
    });

  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Bu email adresi zaten kullanılıyor'
      });
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
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Şifre hariç kullanıcı bilgilerini döndür
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      favoriteNews: user.favoriteNews
    };

    res.status(201).json({
      status: 'success',
      data: {
        user: userResponse
      },
      token
    });

  } catch (error: any) {
    console.error('Register Error:', error);
    
    // MongoDB duplicate key hatası
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Bu email adresi zaten kullanılıyor'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Kayıt işlemi sırasında bir hata oluştu'
    });
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
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

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
export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  const token = createToken(user._id.toString());

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully'
  });
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;

    // Mevcut kullanıcıyı bul
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Email değişiyorsa, duplicate kontrolü yap
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor'
        });
      }
    }

    // Güncelleme objesini oluştur
    const updateData: Record<string, string> = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;

    // Kullanıcıyı güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (error: any) {
    console.error('Update Profile Error:', error);
    
    // Duplicate key hatası için özel mesaj
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor'
      });
    }

    res.status(500).json({
      status: 'error',
      message: error.message || 'Profil güncellenirken bir hata oluştu'
    });
  }
}; 