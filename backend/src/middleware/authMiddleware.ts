import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

// Request tipini genişlet
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Token'ı al
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in', 401);
    }

    // Token'ı doğrula
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: string };

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Kullanıcıyı request'e ekle
    req.user = {
      id: user._id.toString(),
      role: user.role
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission', 403);
    }
    next();
  };
}; 