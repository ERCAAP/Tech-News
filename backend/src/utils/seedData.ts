import { DynamoDBService } from '../services/dynamoDBService';
import { v4 as uuidv4 } from 'uuid';

const categories = ['ai', 'app', 'technology'];

const sampleNews = categories.map(category => ({
  newsId: uuidv4(),
  title: `Sample ${category.toUpperCase()} News`,
  content: `This is a sample news article for ${category}`,
  category,
  authorId: 'system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  status: 'published',
  views: {
    total: 0,
    unique: 0,
    last24Hours: 0
  }
}));

export async function seedDatabase() {
  const dbService = new DynamoDBService();
  
  try {
    console.log('Starting database seeding...');
    
    for (const news of sampleNews) {
      await dbService.create(process.env.DYNAMODB_NEWS_TABLE!, news);
      console.log(`Created sample news: ${news.title}`);
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
} 