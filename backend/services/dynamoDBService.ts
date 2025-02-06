import { DynamoDB } from 'aws-sdk';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export class DynamoDBService {
  private db: DynamoDB.DocumentClient;

  constructor() {
    this.db = new DynamoDB.DocumentClient();
  }

  async create(tableName: string, item: Record<string, any>) {
    const params = {
      TableName: tableName,
      Item: marshall(item)
    };

    try {
      await this.db.put(params).promise();
      return item;
    } catch (error) {
      console.error(`Error creating item in ${tableName}:`, error);
      throw error;
    }
  }

  async get(tableName: string, key: Record<string, any>) {
    const params = {
      TableName: tableName,
      Key: marshall(key)
    };

    try {
      const result = await this.db.get(params).promise();
      return result.Item ? unmarshall(result.Item) : null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  async update(tableName: string, key: Record<string, any>, updates: Record<string, any>) {
    const updateExpression = Object.keys(updates)
      .map(key => `#${key} = :${key}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});

    const expressionAttributeValues = Object.entries(updates)
      .reduce((acc, [key, value]) => ({ ...acc, [`:${key}`]: value }), {});

    const params = {
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await this.db.update(params).promise();
      return result.Attributes ? unmarshall(result.Attributes) : null;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName: string, key: Record<string, any>) {
    const params = {
      TableName: tableName,
      Key: marshall(key)
    };

    try {
      await this.db.delete(params).promise();
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  async query(params: DynamoDB.DocumentClient.QueryInput) {
    try {
      const result = await this.db.query(params).promise();
      return {
        items: result.Items?.map(item => unmarshall(item)) || [],
        lastEvaluatedKey: result.LastEvaluatedKey
      };
    } catch (error) {
      console.error('Error querying items:', error);
      throw error;
    }
  }
} 