import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login Request Body:', req.body);
    
    const { email, password } = req.body;
    
    // Email ve password kontrolü
    if (!email || !password) {
      console.log('Missing credentials:', { email, password });
      return res.status(400).json({
        status: 'error',
        message: 'Email ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul ve şifreyi de getir
    const user = await User.findOne({ email }).select('+password');
    console.log('Found user:', { 
      found: !!user,
      email: user?.email, 
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length 
    });

    if (!user || !user.password) {
      return res.status(401).json({
        status: 'error',
        message: 'Geçersiz email veya şifre'
      });
    }

    // Şifre karşılaştırma
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation:', { isValid: isPasswordValid });

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

    // Password hariç kullanıcı bilgilerini döndür
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

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // JWT'den gelen kullanıcı ID'si
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
    const updateData: any = {};
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