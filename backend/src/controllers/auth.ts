import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

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
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already exists'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '30d' }
      );

      res.status(201).json({
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
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  getMe: async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json({
        status: 'success',
        data: { user }
      });
    } catch (error: any) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  },

  updateProfile: async (req: Request, res: Response) => {
    try {
      const { firstName, lastName, email } = req.body;
      const userId = req.user._id;

      console.log('UpdateProfile - Request:', {
        userId,
        body: req.body,
        headers: req.headers,
        user: req.user
      });

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
        console.log('User not found:', userId);
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }

      console.log('User Updated:', updatedUser);

      res.json({
        status: 'success',
        data: { user: updatedUser }
      });
    } catch (error: any) {
      console.error('UpdateProfile Error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message || 'Failed to update profile'
      });
    }
  },

  getFavoriteNews: async (req: Request, res: Response) => {
    try {
      const userId = req.user._id;
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