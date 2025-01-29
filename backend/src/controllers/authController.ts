import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { validateRegistration, validateLogin } from '../utils/validators';

export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = validateRegistration(req.body);

  // Check if user exists
  const existingUser = await User.findOne({ email: validatedData.email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    email: validatedData.email,
    password: validatedData.password,
    firstName: validatedData.firstName,
    lastName: validatedData.lastName
  });

  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Remove password from response
  user.password = undefined;

  res.status(201).json({
    status: 'success',
    token,
    data: { user }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate input
  const validatedData = validateLogin(req.body);

  // Find user
  const user = await User.findOne({ email: validatedData.email });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(validatedData.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Generate token
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    status: 'success',
    token
  });
}); 