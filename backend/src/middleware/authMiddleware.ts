import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { AppError } from '../utils/AppError';
import { User } from '../models/User';

interface CognitoPayload {
  sub: string;
  email: string;
  'cognito:groups'?: string[];
  [key: string]: any;
}

const cognitoVerifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  clientId: process.env.COGNITO_CLIENT_ID!,
  tokenUse: 'access'
});

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in', 401));
    }

    // Verify token
    const payload = (await cognitoVerifier.verify(token)) as unknown as CognitoPayload;
    if (!payload.email) {
      return next(new AppError('Invalid token', 401));
    }

    // Get user
    const user = await User.findByEmail(payload.email);
    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // Add user to request
    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
      groups: payload['cognito:groups']
    };

    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('You are not logged in', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission', 403));
    }

    next();
  };
}; 