import { DynamoDBService } from '../services/dynamoDBService';
import { v4 as uuidv4 } from 'uuid';

export interface INews {
  newsId: string;
  title: string;
  content: string;
  category: string;
  authorId: string;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  tags: string[];
  readTime?: number;
  views: {
    total: number;
    unique: number;
    last24Hours: number;
  };
  shareCount: number;
  favorites: string[];
  favoriteCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

class NewsModel {
  private dbService: DynamoDBService;
  private tableName: string;

  constructor() {
    this.dbService = new DynamoDBService();
    this.tableName = process.env.DYNAMODB_NEWS_TABLE!;
  }

  async create(newsData: Partial<INews>): Promise<INews> {
    const now = new Date().toISOString();
    const news: INews = {
      newsId: uuidv4(),
      title: newsData.title!,
      content: newsData.content!,
      category: newsData.category!,
      authorId: newsData.authorId!,
      status: newsData.status || 'draft',
      imageUrl: newsData.imageUrl,
      tags: newsData.tags || [],
      readTime: this.calculateReadTime(newsData.content!),
      views: {
        total: 0,
        unique: 0,
        last24Hours: 0
      },
      shareCount: 0,
      favorites: [],
      favoriteCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: newsData.status === 'published' ? now : undefined
    };

    await this.dbService.create(this.tableName, news);
    return news;
  }

  async findById(newsId: string): Promise<INews | null> {
    const news = await this.dbService.get(this.tableName, { newsId });
    return news as INews | null;
  }

  async findByIdAndUpdate(newsId: string, updateData: Partial<INews>): Promise<INews | null> {
    const updates = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const news = await this.dbService.update(this.tableName, { newsId }, updates);
    return news as INews | null;
  }

  async findByIdAndDelete(newsId: string): Promise<boolean> {
    return this.dbService.delete(this.tableName, { newsId });
  }

  async findByCategory(category: string): Promise<INews[]> {
    const params = {
      TableName: this.tableName,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: {
        ':category': category
      }
    };

    const result = await this.dbService.query(params);
    return result.items as INews[];
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }
}

export const News = new NewsModel(); 