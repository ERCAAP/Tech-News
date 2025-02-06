import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { S3 } from '@aws-sdk/client-s3';
import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';

let dynamoDb: DynamoDBDocument;
let s3: S3;
let cloudWatch: CloudWatchLogs;

export function initializeAWS() {
  const config = {
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  };

  // Initialize DynamoDB
  const dynamoClient = new DynamoDB(config);
  dynamoDb = DynamoDBDocument.from(dynamoClient);

  // Initialize S3
  s3 = new S3(config);

  // Initialize CloudWatch
  cloudWatch = new CloudWatchLogs(config);
}

export { dynamoDb, s3, cloudWatch }; 