import { DynamoDBService } from '../services/dynamoDBService';

export interface IUser {
  userId: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
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

  async findById(userId: string): Promise<IUser | null> {
    return this.dbService.get(this.tableName, { userId });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const params = {
      TableName: this.tableName,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };

    const result = await this.dbService.query(params);
    return result.items[0] || null;
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const now = new Date().toISOString();
    const user: IUser = {
      userId: userData.userId!,
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

  async findByIdAndUpdate(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return this.dbService.update(this.tableName, { userId }, updates);
  }

  async findByIdAndDelete(userId: string): Promise<boolean> {
    return this.dbService.delete(this.tableName, { userId });
  }
}

export const User = new UserModel(); 