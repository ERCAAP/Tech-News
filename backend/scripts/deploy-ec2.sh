#!/bin/bash

# Update system
sudo yum update -y

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install 16
nvm use 16

# Install PM2
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/tech-news
cd /home/ec2-user/tech-news

# Install Git
sudo yum install git -y

# Clone repository (replace with your repo URL)
git clone https://github.com/your-username/tech-news.git .

# Install dependencies
npm install

# Build the application
npm run build

# Configure AWS credentials (these will be set via EC2 role)
aws configure set region ${AWS_REGION}

# Start the application with PM2
pm2 start dist/index.js --name "tech-news-api"
pm2 startup
pm2 save

# Install and configure Nginx
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx as reverse proxy
sudo tee /etc/nginx/conf.d/tech-news.conf << EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "no-referrer-when-downgrade";
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Large file uploads
    client_max_body_size 50M;
}
EOF

# Restart Nginx
sudo systemctl restart nginx

# Set up CloudWatch agent for logging
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c ssm:AmazonCloudWatch-Config 