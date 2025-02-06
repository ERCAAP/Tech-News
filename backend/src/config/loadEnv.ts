import dotenv from 'dotenv';
import path from 'path';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Gerekli environment değişkenlerini kontrol et
const requiredEnvVars = [
  'PORT',
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID',
  'S3_UPLOADS_BUCKET',
  'DYNAMODB_NEWS_TABLE',
  'DYNAMODB_USERS_TABLE'
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
});

export default {
  port: process.env.PORT || 3000,
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
  },
  s3: {
    uploadsBucket: process.env.S3_UPLOADS_BUCKET,
  },
  dynamodb: {
    newsTable: process.env.DYNAMODB_NEWS_TABLE,
    usersTable: process.env.DYNAMODB_USERS_TABLE,
  }
}; 