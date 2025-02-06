import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

// Request tipini genişletelim
interface AuthRequest extends Request {
  user?: {
    email: string;
    sub: string;
  };
}

// Ana auth middleware'i
export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const authService = new AuthService();
    const userInfo = await authService.verifyToken(token);
    
    if (!userInfo || !userInfo.email || !userInfo.sub) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Token geçerliyse kullanıcı bilgilerini request'e ekle
    req.user = {
      email: userInfo.email,
      sub: userInfo.sub
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin kontrolü için middleware
export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authService = new AuthService();
    const userGroups = await authService.getUserGroups(req.user?.sub);
    
    if (!userGroups.includes('admin')) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Authorization failed' });
  }
}; 