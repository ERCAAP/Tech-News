import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = new DynamoDB({
  region: process.env.AWS_REGION
});

const docClient = DynamoDBDocument.from(dynamoDB);

export interface IUser {
  userId: string;
  email: string;
  name: string;
  password?: string;
  role: 'user' | 'admin';
  preferences?: {
    categories: string[];
    notificationSettings: {
      newArticles: boolean;
      newsletter: boolean;
    };
    theme: 'light' | 'dark' | 'system';
  };
  readingHistory: Array<{
    newsId: string;
    readAt: string;
    completedReading: boolean;
  }>;
  isSubscription: boolean;
  subscriptionPlan?: 'monthly' | 'yearly' | null;
  subscriptionEndDate?: string;
  favoriteNews: string[];
  createdAt: string;
  updatedAt: string;
}

export class UserModel {
  private tableName = 'Users';

  async create(userData: Omit<IUser, 'userId' | 'createdAt' | 'updatedAt'>): Promise<IUser> {
    const timestamp = new Date().toISOString();
    const user: IUser = {
      ...userData,
      userId: uuidv4(),
      createdAt: timestamp,
      updatedAt: timestamp,
      role: userData.role || 'user',
      readingHistory: [],
      isSubscription: false,
      favoriteNews: [],
      preferences: {
        categories: [],
        notificationSettings: {
          newArticles: true,
          newsletter: true
        },
        theme: 'system'
      }
    };

    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    await docClient.put({
      TableName: this.tableName,
      Item: user
    });

    return user;
  }

  async findById(userId: string): Promise<IUser | null> {
    const result = await docClient.get({
      TableName: this.tableName,
      Key: { userId }
    });
    return result.Item as IUser || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const result = await docClient.query({
      TableName: this.tableName,
      IndexName: 'email-index',
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeNames: {
        '#email': 'email'
      },
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    });
    return result.Items?.[0] as IUser || null;
  }

  async update(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const timestamp = new Date().toISOString();
    const updates = { ...updateData, updatedAt: timestamp };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updateExpression = 'set ' + Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {} as { [key: string]: string });
    const expressionAttributeValues = Object.entries(updates).reduce((acc, [key, value]) => {
      acc[`:${key}`] = value;
      return acc;
    }, {} as { [key: string]: any });

    const result = await docClient.update({
      TableName: this.tableName,
      Key: { userId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    return result.Attributes as IUser;
  }

  async delete(userId: string): Promise<void> {
    await docClient.delete({
      TableName: this.tableName,
      Key: { userId }
    });
  }

  async comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
    try {
      if (!user.password) return false;
      return await bcrypt.compare(candidatePassword, user.password);
    } catch (error) {
      console.error('Password compare error:', error);
      return false;
    }
  }
}

export const User = new UserModel(); 