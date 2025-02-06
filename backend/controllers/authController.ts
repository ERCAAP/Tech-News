import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { DynamoDBService } from '../services/dynamoDBService';

export class AuthController {
  private authService: AuthService;
  private dbService: DynamoDBService;

  constructor() {
    this.authService = new AuthService();
    this.dbService = new DynamoDBService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Create user in Cognito
      await this.authService.signUp(email, password, {
        'custom:name': name,
        email
      });

      // Store additional user data in DynamoDB
      await this.dbService.create(process.env.DYNAMODB_USERS_TABLE!, {
        userId: email,
        email,
        name,
        createdAt: new Date().toISOString(),
        preferences: {
          categories: [],
          notificationSettings: {
            newArticles: true,
            newsletter: true
          },
          theme: 'system'
        }
      });

      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const authResult = await this.authService.signIn(email, password);
      
      res.json({
        token: authResult.AuthenticationResult?.AccessToken,
        refreshToken: authResult.AuthenticationResult?.RefreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  };

  getProfile = async (req: Request, res: Response) => {
    try {
      const { email } = req.user!;
      const user = await this.dbService.get(process.env.DYNAMODB_USERS_TABLE!, {
        userId: email
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response) => {
    try {
      const { email } = req.user!;
      const { name, preferences } = req.body;

      const updates = {
        name,
        preferences,
        updatedAt: new Date().toISOString()
      };

      const updatedUser = await this.dbService.update(
        process.env.DYNAMODB_USERS_TABLE!,
        { userId: email },
        updates
      );

      res.json(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: error.message });
    }
  };

  verifyToken = async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const isValid = await this.authService.verifyToken(token);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ error: 'Token verification failed' });
    }
  };
} 