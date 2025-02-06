import { S3 } from 'aws-sdk';

export class S3Service {
  private s3: S3;
  private bucket: string;

  constructor() {
    this.s3 = new S3();
    this.bucket = process.env.S3_UPLOADS_BUCKET!;
  }

  async uploadFile(file: Buffer, key: string, contentType: string): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read'
    };

    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    const params = {
      Bucket: this.bucket,
      Key: key
    };

    try {
      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn
    };

    try {
      return await this.s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }
} 