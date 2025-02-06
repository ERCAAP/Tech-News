import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import { AuthService } from '../services/authService';
import { DynamoDBService } from '../services/dynamoDBService';
import { AuthRequest } from '../types/express';

// JWT yapılandırması
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES_IN = '30d'; // 30 gün

// JWT token oluşturma
const createToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

interface VerificationCode {
  code: string;
  email: string;
  expiresAt: Date;
}

// Geçici olarak verification kodlarını tutmak için
const verificationCodes = new Map<string, VerificationCode>();

// Email gönderme yapılandırması
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL/TLS için
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false // Geliştirme ortamında SSL sertifika hatalarını önler
    }
  });
};

export class AuthController {
  private authService: AuthService;
  private dbService: DynamoDBService;

  constructor() {
    this.authService = new AuthService();
    this.dbService = new DynamoDBService();
  }

  login = async (req: AuthRequest, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email ve şifre gereklidir'
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Geçersiz email veya şifre'
        });
      }

      const token = createToken(user.userId);

      res.status(200).json({
        status: 'success',
        data: { user },
        token
      });
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Giriş işlemi sırasında bir hata oluştu'
      });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const { email, name } = req.body;

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email is already registered'
        });
      }

      const user = await User.create({
        email,
        name,
        role: 'user'
      });

      const token = createToken(user.userId);

      res.status(201).json({
        status: 'success',
        data: { user },
        token
      });
    } catch (error) {
      console.error('Register Error:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.user!;
      const user = await this.dbService.get(process.env.DYNAMODB_USERS_TABLE!, {
        userId
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An error occurred while getting profile'
      });
    }
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const { userId } = req.user!;
      const { name, preferences } = req.body;

      const updates = {
        name,
        preferences,
        updatedAt: new Date().toISOString()
      };

      const updatedUser = await this.dbService.update(
        process.env.DYNAMODB_USERS_TABLE!,
        { userId },
        updates
      );

      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An error occurred while updating profile'
      });
    }
  };
} 