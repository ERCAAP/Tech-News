import { 
  DynamoDB,
  QueryCommandInput,
  ScanCommandInput,
  BatchGetItemCommandInput,
  BatchWriteItemCommandInput,
  TransactGetItemsCommandInput,
  TransactWriteItemsCommandInput
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

export class DynamoDBService {
  private client: DynamoDBDocument;

  constructor() {
    const dynamoClient = new DynamoDB({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
      }
    });
    this.client = DynamoDBDocument.from(dynamoClient);
  }

  async create(tableName: string, item: Record<string, any>): Promise<Record<string, any>> {
    await this.client.put({
      TableName: tableName,
      Item: item
    });
    return item;
  }

  async get(tableName: string, key: Record<string, any>): Promise<Record<string, any> | null> {
    const result = await this.client.get({
      TableName: tableName,
      Key: key
    });
    return result.Item || null;
  }

  async update(tableName: string, key: Record<string, any>, updates: Record<string, any>): Promise<Record<string, any> | null> {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    });

    const result = await this.client.update({
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    return result.Attributes || null;
  }

  async delete(tableName: string, key: Record<string, any>): Promise<boolean> {
    await this.client.delete({
      TableName: tableName,
      Key: key
    });
    return true;
  }

  async query(params: QueryCommandInput): Promise<{ items: Record<string, any>[]; lastEvaluatedKey?: Record<string, any> }> {
    const result = await this.client.query(params);
    return {
      items: (result.Items || []) as Record<string, any>[],
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, any> | undefined
    };
  }

  async scan(params: ScanCommandInput): Promise<{ items: Record<string, any>[]; lastEvaluatedKey?: Record<string, any> }> {
    const result = await this.client.scan(params);
    return {
      items: (result.Items || []) as Record<string, any>[],
      lastEvaluatedKey: result.LastEvaluatedKey as Record<string, any> | undefined
    };
  }

  async batchGet(params: BatchGetItemCommandInput): Promise<Record<string, any>[]> {
    const result = await this.client.batchGet(params);
    return Object.values(result.Responses || {}).flat() as Record<string, any>[];
  }

  async batchWrite(params: BatchWriteItemCommandInput): Promise<void> {
    await this.client.batchWrite(params);
  }

  async transactWrite(params: TransactWriteItemsCommandInput): Promise<void> {
    await this.client.transactWrite(params);
  }

  async transactGet(params: TransactGetItemsCommandInput): Promise<Record<string, any>[]> {
    const result = await this.client.transactGet(params);
    return (result.Responses?.map(response => response.Item) || []) as Record<string, any>[];
  }
} 