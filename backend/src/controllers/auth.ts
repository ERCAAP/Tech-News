import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      console.log('👉 Login attempt:', { email: req.body.email });
      const { email, password } = req.body;

      // Email ve şifre kontrolü
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email ve şifre gerekli'
        });
      }

      // Kullanıcıyı bul ve şifreyi seç
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        console.log('❌ Login failed: User not found:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Geçersiz kimlik bilgileri'
        });
      }

      // Debug için
      console.log('Found user:', {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password
      });

      // Şifre kontrolü
      if (!user.password) {
        console.log('❌ Login failed: No password set for user:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Geçersiz kimlik bilgileri'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        console.log('❌ Login failed: Invalid password for user:', email);
        return res.status(401).json({
          status: 'error',
          message: 'Geçersiz kimlik bilgileri'
        });
      }

      console.log('✅ Login successful:', { userId: user._id, email: user.email });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      console.log('👉 Register attempt:', {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName
      });

      const { email, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !password || !firstName || !lastName) {
        console.log('❌ Register validation failed: Missing fields', {
          hasEmail: !!email,
          hasPassword: !!password,
          hasFirstName: !!firstName,
          hasLastName: !!lastName
        });
        return res.status(400).json({
          status: 'error',
          message: 'All fields are required'
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('❌ Register validation failed: Invalid email format', email);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email format'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('❌ Register failed: Email already exists:', email);
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      console.log('👉 Hashing password...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      console.log('👉 Creating new user...');
      const newUser = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user'
      });

      console.log('✅ User created successfully:', {
        userId: newUser._id,
        email: newUser.email
      });

      // Generate JWT token
      console.log('👉 Generating JWT token...');
      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      console.log('✅ Registration complete:', {
        userId: newUser._id,
        email: newUser.email
      });

      // Return response
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            _id: newUser._id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          },
          token
        }
      });
    } catch (error: any) {
      console.error('❌ Register error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // MongoDB duplicate key error
      if (error.code === 11000) {
        console.log('❌ Register failed: Duplicate key error', error.keyValue);
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      res.status(500).json({
        status: 'error',
        message: error.message || 'Registration failed'
      });
    }
  },

  getMe: async (req: Request, res: Response) => {
    try {
      // Check if req.user exists
      if (!req.user) {
        console.log('❌ GetMe failed: No user in request');
        return res.status(401).json({
          status: 'error', 
          message: 'Not authenticated'
        });
      }

      console.log('👉 GetMe request for user:', req.user._id);
      const user = await User.findById(req.user._id).select('-password');

      if (!user) {
        console.log('❌ GetMe failed: User not found');
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      console.log('✅ GetMe successful:', { userId: user._id });
      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error: any) {
      console.error('❌ GetMe error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      // Check if req.user exists
      if (!req.user) {
        console.log('❌ UpdateProfile failed: No user in request');
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      console.log('👉 UpdateProfile request:', {
        userId: req.user._id,
        updates: req.body
      });

      const { firstName, lastName, email } = req.body;
      const userId = req.user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            firstName,
            lastName,
            email,
            updatedAt: Date.now()
          }
        },
        { new: true }
      ).select('-password');

      if (!updatedUser) {
        console.log('❌ UpdateProfile failed: User not found:', userId);
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      console.log('✅ Profile updated successfully:', {
        userId: updatedUser._id,
        email: updatedUser.email
      });

      res.json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error: any) {
      console.error('❌ UpdateProfile error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update profile'
      });
    }
  },

  getFavoriteNews: async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({
          status: 'error', 
          message: 'Unauthorized - User not found'
        });
      }

      const user = await User.findById(userId)
        .populate('favoriteNews')
        .select('favoriteNews');

      res.json({
        status: 'success',
        data: {
          favoriteNews: user?.favoriteNews || []
        }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  }
}; 