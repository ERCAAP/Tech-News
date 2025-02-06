import { User } from '../models/User';
import { News } from '../models/News';
import dotenv from 'dotenv';

dotenv.config();

async function seedData() {
  try {
    // Create admin user
    const admin = await User.create({
      email: 'admin@technews.com',
      name: 'Admin User',
      role: 'admin'
    });

    console.log('Admin user created:', admin);

    // Create regular user
    const user = await User.create({
      email: 'user@technews.com',
      name: 'Regular User',
      role: 'user'
    });

    console.log('Regular user created:', user);

    // Create sample news articles
    const newsArticles = [
      {
        title: 'The Future of AI',
        content: 'Artificial Intelligence is transforming the way we live and work...',
        category: 'technology',
        authorId: admin.userId,
        status: 'published',
        tags: ['AI', 'technology', 'future']
      },
      {
        title: 'Web Development Trends 2024',
        content: 'The web development landscape is constantly evolving...',
        category: 'development',
        authorId: admin.userId,
        status: 'published',
        tags: ['web', 'development', 'trends']
      },
      {
        title: 'Cybersecurity Best Practices',
        content: 'In an increasingly connected world, cybersecurity is more important than ever...',
        category: 'security',
        authorId: user.userId,
        status: 'published',
        tags: ['security', 'cybersecurity', 'privacy']
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