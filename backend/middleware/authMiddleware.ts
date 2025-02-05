import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Request tipini genişletelim
interface AuthRequest extends Request {
  user?: any;
}

// Yetkilendirme middleware'i
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Token'ı kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        status: 'error',
        message: 'Token bulunamadı'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      // 2. Token'ı decode et
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      
      // 3. Kullanıcıyı bul
      const currentUser = await User.findById(decoded.id)
        .select('+role')
        .select('+email')
        .lean(); // Performans için lean() kullanıyoruz
      
      if (!currentUser) {
        return res.status(401).json({
          status: 'error',
          message: 'Kullanıcı bulunamadı'
        });
      }

      // Debug için role bilgisini kontrol et
      console.log('User role:', currentUser.role);

      // Kullanıcı bilgilerini request'e ekle
      req.user = currentUser;
      
      // 5. İşleme devam et
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

// Rol kontrolü için middleware
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log('User in request:', req.user); // Debug için
    console.log('Required roles:', roles); // Debug için
    
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Bu işlem için yetkiniz yok. Gerekli roller: ${roles.join(', ')}`
      });
    }
    next();
  };
}; 