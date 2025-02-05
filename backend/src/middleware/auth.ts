import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

interface AuthRequest extends Request {
  user?: any;
}

interface JwtPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        [key: string]: any;
        _id: string;
        role: string;
      };
    }
  }
}

export const protect = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token bulunamadı'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token); // Debug için

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      console.log('Decoded:', decoded); // Debug için

      const user = await User.findById(decoded.id).select('+role');
      console.log('Found user:', user); // Debug için

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Kullanıcı bulunamadı'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Sunucu hatası'
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Debug için
    console.log('User in restrictTo:', req.user);
    console.log('Required roles:', roles);

    if (!req.user || !roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided or invalid format'
      });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded Token:', decoded);

    const user = await User.findById((decoded as any).id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    
    if (!user || user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Authorization failed' });
  }
}; 