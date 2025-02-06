import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = new DynamoDB({
  region: process.env.AWS_REGION
});

const docClient = DynamoDBDocument.from(dynamoDB);

export interface INews {
  newsId: string;
  title: string;
  content: string;
  authorId: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  tags: string[];
  views: {
    total: number;
    unique: number;
    history: Array<{
      userId: string;
      timestamp: string;
    }>;
    last24Hours: number;
  };
  shareCount: number;
  likes: string[];
  favorites: string[];
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ViewHistory {
  userId: string;
  timestamp: string;
}

export interface Views {
  total: number;
  unique: number;
  history: ViewHistory[];
  last24Hours: number;
}

export class NewsModel {
  private tableName = 'News';

  async create(news: INews): Promise<INews> {
    await docClient.put({
      TableName: this.tableName,
      Item: news
    });
    return news;
  }

  async findById(newsId: string): Promise<INews | null> {
    const result = await docClient.get({
      TableName: this.tableName,
      Key: { newsId }
    });
    return result.Item as INews || null;
  }

  async update(newsId: string, updateData: Partial<INews>): Promise<INews> {
    const updateExpression = 'set ' + Object.keys(updateData).map(key => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(updateData).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {} as { [key: string]: string });
    const expressionAttributeValues = Object.entries(updateData).reduce((acc, [key, value]) => {
      acc[`:${key}`] = value;
      return acc;
    }, {} as { [key: string]: any });

    const result = await docClient.update({
      TableName: this.tableName,
      Key: { newsId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    return result.Attributes as INews;
  }

  async scan(): Promise<INews[]> {
    const result = await docClient.scan({
      TableName: this.tableName
    });
    return result.Items as INews[] || [];
  }

  async query(indexName: string, value: string): Promise<INews[]> {
    const result = await docClient.query({
      TableName: this.tableName,
      IndexName: `${indexName}-index`,
      KeyConditionExpression: '#key = :value',
      ExpressionAttributeNames: {
        '#key': indexName
      },
      ExpressionAttributeValues: {
        ':value': value
      }
    });
    return result.Items as INews[] || [];
  }

  async delete(newsId: string): Promise<void> {
    await docClient.delete({
      TableName: this.tableName,
      Key: { newsId }
    });
  }
}

export const News = new NewsModel(); 