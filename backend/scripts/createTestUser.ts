import { AuthService } from '../services/authService';
import { DynamoDBService } from '../services/dynamoDBService';
import dotenv from 'dotenv';

dotenv.config();

async function createTestUser() {
  try {
    const authService = new AuthService();
    const dbService = new DynamoDBService();

    const testUser = {
      email: 'admin@example.com',
      password: 'Admin123!',
      name: 'Admin User'
    };

    // Create user in Cognito
    await authService.signUp(testUser.email, testUser.password, {
      'custom:name': testUser.name,
      email: testUser.email
    });

    // Add user to admin group in Cognito
    await authService.addUserToGroup(testUser.email, 'admin');

    // Store additional user data in DynamoDB
    await dbService.create(process.env.DYNAMODB_USERS_TABLE!, {
      userId: testUser.email,
      email: testUser.email,
      name: testUser.name,
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

    console.log('Test admin user created successfully:', {
      email: testUser.email,
      name: testUser.name
    });

  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

// Run the script
createTestUser(); 