import dotenv from 'dotenv';
import path from 'path';

// .env dosyasını yükle
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Gerekli environment değişkenlerini kontrol et
const requiredEnvVars = ['PORT', 'MONGODB_URI', 'JWT_SECRET', 'JWT_EXPIRES_IN'];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
});

export default {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN
}; 