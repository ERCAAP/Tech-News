import { User } from '../src/models/User';
import { News, INews } from '../src/models/News';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  try {
    // Create admin user
    const admin = await User.create({
      email: 'admin@technews.com',
      name: 'Admin User',
      role: 'admin',
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
    });

    console.log('Admin user created:', admin);

    // Create regular user
    const user = await User.create({
      email: 'user@technews.com',
      name: 'Regular User',
      role: 'user',
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
    });

    console.log('Regular user created:', user);

    // Create sample news articles
    const newsArticles: INews[] = [
      {
        newsId: uuidv4(),
        title: 'The Future of AI',
        content: 'Artificial Intelligence is transforming the way we live and work...',
        category: 'technology',
        authorId: admin.userId,
        status: 'published' as const,
        tags: ['AI', 'technology', 'future'],
        views: {
          total: 0,
          unique: 0,
          history: [],
          last24Hours: 0
        },
        shareCount: 0,
        likes: [],
        favorites: [],
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        newsId: uuidv4(),
        title: 'Web Development Trends 2024',
        content: 'The web development landscape is constantly evolving...',
        category: 'development',
        authorId: admin.userId,
        status: 'published' as const,
        tags: ['web', 'development', 'trends'],
        views: {
          total: 0,
          unique: 0,
          history: [],
          last24Hours: 0
        },
        shareCount: 0,
        likes: [],
        favorites: [],
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        newsId: uuidv4(),
        title: 'Cybersecurity Best Practices',
        content: 'In an increasingly connected world, cybersecurity is more important than ever...',
        category: 'security',
        authorId: user.userId,
        status: 'published' as const,
        tags: ['security', 'cybersecurity', 'privacy'],
        views: {
          total: 0,
          unique: 0,
          history: [],
          last24Hours: 0
        },
        shareCount: 0,
        likes: [],
        favorites: [],
        favoriteCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    for (const article of newsArticles) {
      const news = await News.create(article);
      console.log('News article created:', news.title);
    }

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 