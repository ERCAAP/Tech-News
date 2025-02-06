import { DynamoDBService } from '../services/dynamoDBService';
import { v4 as uuidv4 } from 'uuid';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

export interface IUser {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    categories: string[];
    notificationSettings: {
      newArticles: boolean;
      newsletter: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  subscription?: {
    isSubscribed: boolean;
    plan: 'free' | 'basic' | 'premium';
    updatedAt: string;
  };
}

class UserModel {
  private dbService: DynamoDBService;
  private tableName: string;

  constructor() {
    this.dbService = new DynamoDBService();
    this.tableName = process.env.DYNAMODB_USERS_TABLE!;
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const now = new Date().toISOString();
    const user: IUser = {
      userId: uuidv4(),
      email: userData.email!,
      name: userData.name!,
      role: userData.role || 'user',
      isActive: true,
      createdAt: now,
      updatedAt: now,
      preferences: {
        categories: [],
        notificationSettings: {
          newArticles: true,
          newsletter: true
        },
        theme: 'system'
      }
    };

    await this.dbService.create(this.tableName, user);
    return user;
  }

  async findById(userId: string): Promise<IUser | null> {
    const user = await this.dbService.get(this.tableName, { userId });
    return user as IUser | null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': { S: email } as AttributeValue
      }
    };

    const result = await this.dbService.query(params);
    return result.items[0] as IUser | null;
  }

  async findByIdAndUpdate(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const user = await this.dbService.update(this.tableName, { userId }, updates);
    return user as IUser | null;
  }

  async findByIdAndDelete(userId: string): Promise<boolean> {
    return this.dbService.delete(this.tableName, { userId });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.dbService.update(this.tableName, { userId }, {
      lastLogin: new Date().toISOString()
    });
  }

  async findAll(): Promise<IUser[]> {
    const params = {
      TableName: this.tableName
    };

    const result = await this.dbService.scan(params);
    return result.items as IUser[];
  }
}

export const User = new UserModel(); 