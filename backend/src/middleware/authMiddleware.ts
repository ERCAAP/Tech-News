import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    logger.info('Auth Header:', authHeader); // Debug için

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      logger.error('No Bearer token found');
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    logger.info('Token:', token); // Debug için

    try {
      // Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      logger.info('Decoded token:', decoded); // Debug için

      // Kullanıcıyı bul
      const user = await User.findById(decoded.id);
      if (!user) {
        logger.error('User not found with id:', decoded.id);
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      // Kullanıcıyı request'e ekle
      req.user = user;
      logger.info('User authenticated:', user._id); // Debug için
      next();
    } catch (err) {
      logger.error('Token verification failed:', err);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
}; 