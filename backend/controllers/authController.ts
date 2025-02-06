import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import { AuthService } from '../services/authService';
import { DynamoDBService } from '../services/dynamoDBService';
import { AuthRequest } from '../types/express';

function createToken(userId: string): string {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );
}

export class AuthController {
  private authService: AuthService;
  private dbService: DynamoDBService;

  constructor() {
    this.authService = new AuthService();
    this.dbService = new DynamoDBService();
  }

  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, name } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const userId = `user_${Date.now()}`;
    const user = await User.create({
      userId,
      email,
      name,
      role: 'user',
      preferences: {
        categories: [],
        notificationSettings: {
          newArticles: true,
          newsletter: true
        },
        theme: 'system'
      }
    });

    const token = createToken(user.userId);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      token
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email ve şifre gereklidir', 400);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      throw new AppError('Geçersiz email veya şifre', 401);
    }

    const token = createToken(user.userId);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      token
    });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByEmail(req.user?.email || '');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          preferences: user.preferences
        }
      }
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const allowedUpdates = ['name', 'preferences'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {} as Partial<IUser>);

    if (Object.keys(updates).length === 0) {
      throw new AppError('No valid updates provided', 400);
    }

    const user = await User.findByEmail(req.user?.email || '');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          preferences: user.preferences
        }
      }
    });
  });

  verifyToken = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const isValid = await this.authService.verifyToken(token);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Token verification failed' });
    }
  };
} 