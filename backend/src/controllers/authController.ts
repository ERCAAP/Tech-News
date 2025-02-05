import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import nodemailer from 'nodemailer';
import { VerificationCode } from '../models/VerificationCode';

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

    // Email'in doğrulanmış olup olmadığını kontrol et
    const verificationCode = await VerificationCode.findOne({
      email,
      isUsed: true,
      expiresAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) } // Son 15 dakika içinde
    });

    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Email not verified'
      });
    }

    // Email kontrolü
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered'
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

    // Kullanıcı bilgilerini döndür
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
    res.status(500).json({
      status: 'error',
      message: error.message || 'Registration failed'
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

export const sendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    // E-posta formatını kontrol et
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Kullanıcının zaten kayıtlı olup olmadığını kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered'
      });
    }

    // 6 haneli rastgele kod oluştur
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Varolan aktif kodu bul ve sil
    await VerificationCode.deleteMany({
      email,
      expiresAt: { $gt: new Date() }
    });

    // Yeni kod oluştur
    await VerificationCode.create({
      email,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      isUsed: false
    });

    const transporter = createTransporter();

    // Test bağlantısı
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log("SMTP Server Error:", error);
          reject(error);
        } else {
          console.log("SMTP Server is ready to take our messages");
          resolve(success);
        }
      });
    });

    // E-posta şablonu
    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Email Verification</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center;">
          <p style="font-size: 16px; color: #666;">Your verification code is:</p>
          <h2 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 20px 0;">${code}</h2>
          <p style="color: #999; font-size: 14px;">This code will expire in 15 minutes.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #666;">
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Do not share this code with anyone.</p>
        </div>
      </div>
    `;

    // E-posta gönderme ayarları
    const mailOptions = {
      from: {
        name: 'Tech News App',
        address: process.env.EMAIL_USER as string
      },
      to: email,
      subject: 'Email Verification Code',
      html: emailTemplate
    };

    // E-postayı gönder
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send verification code. Please try again.'
    });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    
    // En son gönderilen ve kullanılmamış kodu bul
    const verificationCode = await VerificationCode.findOne({
      email,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification code'
      });
    }

    // Kodu kullanıldı olarak işaretle
    verificationCode.isUsed = true;
    await verificationCode.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify code'
    });
  }
}; 