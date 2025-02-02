import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { generateToken } from '../utils/auth';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
      role: user.role
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

export const socialLogin = async (req: Request, res: Response) => {
  try {
    const { provider, token } = req.body;

    let userData;

    switch (provider) {
      case 'google':
        userData = await verifyGoogleToken(token);
        break;
      case 'apple':
        userData = await verifyAppleToken(token);
        break;
      default:
        return res.status(400).json({
          status: 'error',
          message: 'Invalid provider'
        });
    }

    if (!userData) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      user = await User.create({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        provider: provider,
        providerId: userData.id,
        isEmailVerified: true
      });
    }

    // JWT token oluştur
    const authToken = generateToken(user);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      },
      token: authToken
    });

  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Social login failed'
    });
  }
};

async function verifyGoogleToken(token: string) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name
    };
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

async function verifyAppleToken(token: string) {
  try {
    const appleData = await appleSignin.verifyIdToken(token, {
      audience: process.env.APPLE_CLIENT_ID,
    });

    return {
      id: appleData.sub,
      email: appleData.email,
      firstName: appleData.firstName || '',
      lastName: appleData.lastName || ''
    };
  } catch (error) {
    console.error('Apple token verification error:', error);
    return null;
  }
} 