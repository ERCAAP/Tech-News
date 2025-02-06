import { DynamoDB } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

async function createTables() {
  try {
    // Create Users table
    await dynamodb.createTable({
      TableName: process.env.DYNAMODB_USERS_TABLE!,
      AttributeDefinitions: [
        { AttributeName: 'userId', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'userId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    console.log('Users table created successfully');

    // Create News table
    await dynamodb.createTable({
      TableName: process.env.DYNAMODB_NEWS_TABLE!,
      AttributeDefinitions: [
        { AttributeName: 'newsId', AttributeType: 'S' },
        { AttributeName: 'category', AttributeType: 'S' },
        { AttributeName: 'authorId', AttributeType: 'S' }
      ],
      KeySchema: [
        { AttributeName: 'newsId', KeyType: 'HASH' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'CategoryIndex',
          KeySchema: [
            { AttributeName: 'category', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        },
        {
          IndexName: 'AuthorIndex',
          KeySchema: [
            { AttributeName: 'authorId', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    });

    console.log('News table created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

createTables(); 