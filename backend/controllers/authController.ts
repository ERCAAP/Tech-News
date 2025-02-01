import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login Request Body:', req.body);
    
    const { email, password } = req.body;
    
    // Email ve password kontrolü
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz email veya şifre'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz email veya şifre'
      });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Kullanıcı bilgilerini döndür (password hariç)
    const userResponse = {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      favoriteNews: user.favoriteNews,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userResponse
      },
      token
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Giriş işlemi sırasında bir hata oluştu'
    });
  }
}; 