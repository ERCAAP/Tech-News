import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, QueryCommandInput } from '@aws-sdk/lib-dynamodb';

export class DynamoDBService {
  private docClient: DynamoDBDocument;

  constructor() {
    const dynamoDB = new DynamoDB({
      region: process.env.AWS_REGION
    });
    this.docClient = DynamoDBDocument.from(dynamoDB);
  }

  async create(tableName: string, item: Record<string, any>) {
    try {
      await this.docClient.put({
        TableName: tableName,
        Item: item
      });
      return item;
    } catch (error) {
      console.error(`Error creating item in ${tableName}:`, error);
      throw error;
    }
  }

  async get(tableName: string, key: Record<string, any>) {
    try {
      const result = await this.docClient.get({
        TableName: tableName,
        Key: key
      });
      return result.Item || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  async update(tableName: string, key: Record<string, any>, updates: Record<string, any>) {
    const updateExpression = 'set ' + Object.keys(updates).map(key => `#${key} = :${key}`).join(', ');
    const expressionAttributeNames = Object.keys(updates).reduce((acc, key) => {
      acc[`#${key}`] = key;
      return acc;
    }, {} as { [key: string]: string });
    const expressionAttributeValues = Object.entries(updates).reduce((acc, [key, value]) => {
      acc[`:${key}`] = value;
      return acc;
    }, {} as { [key: string]: any });

    try {
      const result = await this.docClient.update({
        TableName: tableName,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      });
      return result.Attributes || null;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName: string, key: Record<string, any>) {
    try {
      await this.docClient.delete({
        TableName: tableName,
        Key: key
      });
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  async query(params: QueryCommandInput) {
    try {
      const result = await this.docClient.query(params);
      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  }

  async scan(tableName: string) {
    try {
      const result = await this.docClient.scan({
        TableName: tableName
      });
      return result.Items || [];
    } catch (error) {
      console.error(`Error scanning table ${tableName}:`, error);
      throw error;
    }
  }
} 