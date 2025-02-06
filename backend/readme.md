# Tech News Portal Backend API

Modern bir haber portalı için AWS tabanlı, ölçeklenebilir backend API'si.

## 🚀 Özellikler

- TypeScript ile güçlü tip kontrolü
- AWS Cognito ile kimlik doğrulama ve yetkilendirme
- DynamoDB ile veri yönetimi
- S3 ile dosya depolama
- CloudWatch ile loglama ve izleme
- CloudFront ile içerik dağıtımı
- API Gateway ile API yönetimi
- Lambda ile sunucusuz fonksiyonlar
- Elastic Beanstalk ile kolay deployment

## 🛠 AWS Servisleri

- **Authentication:** Amazon Cognito
- **Database:** Amazon DynamoDB
- **Storage:** Amazon S3
- **CDN:** Amazon CloudFront
- **Monitoring:** Amazon CloudWatch
- **API Management:** Amazon API Gateway
- **Compute:** AWS Lambda & Elastic Beanstalk

## 📦 Kurulum

1. AWS CLI'yi yükleyin ve yapılandırın:
   ```bash
   aws configure
   ```

2. Gereksinimleri yükleyin:
   ```bash
   npm install
   ```

3. `.env` dosyasını yapılandırın:
   - AWS kimlik bilgilerini ayarlayın
   - Cognito User Pool bilgilerini girin
   - DynamoDB tablo isimlerini belirleyin
   - S3 bucket ismini ayarlayın

4. DynamoDB tablolarını oluşturun:
   ```bash
   npm run create-tables
   ```

5. Örnek verileri yükleyin:
   ```bash
   npm run seed
   ```

6. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

## 🚀 Deployment

1. Production ortamı için build alın:
   ```bash
   npm run build
   ```

2. AWS altyapısını oluşturun:
   ```bash
   npm run deploy
   ```

3. Production ortamına deploy edin:
   ```bash
   npm run deploy:prod
   ```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # AWS service integrations
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── scripts/            # Deployment & setup scripts
└── infrastructure/     # AWS CloudFormation templates
```

## 🔒 Güvenlik

- AWS IAM ile rol tabanlı erişim kontrolü
- Cognito ile güvenli kimlik doğrulama
- API Gateway ile rate limiting
- CloudFront ile DDoS koruması
- SSL/TLS şifreleme

## 📊 İzleme ve Loglama

- CloudWatch Metrics ile performans izleme
- CloudWatch Logs ile merkezi loglama
- X-Ray ile distributed tracing
- CloudWatch Alarms ile otomatik bildirimler
