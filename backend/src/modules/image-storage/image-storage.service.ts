import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client as MinioClient } from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageStorageService implements OnModuleInit {
  private minioClient: MinioClient;
  private bucketName: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new MinioClient({
      endPoint: configService.get<string>('minio.endPoint') || 'localhost',
      port: configService.get<number>('minio.port') || 9000,
      useSSL: configService.get<boolean>('minio.useSSL') || false,
      accessKey: configService.get<string>('minio.accessKey') || 'minioadmin',
      secretKey: configService.get<string>('minio.secretKey') || 'minioadmin',
    });
    this.bucketName = configService.get<string>('minio.bucketName') || 'inventory-images';
    this.publicUrl = configService.get<string>('minio.publicUrl') || 'http://localhost:9000';
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');

      const policy = {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucketName}/*`],
        }],
      };
      await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
    }
  }

  async uploadProductImage(file: Express.Multer.File, productId: number): Promise<string> {
    const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedFormats.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format. Allowed: JPEG, PNG, WebP');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    const ext = file.originalname.split('.').pop();
    const filename = `products/${productId}/${uuidv4()}.${ext}`;

    await this.minioClient.putObject(
      this.bucketName,
      filename,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return `${this.publicUrl}/${this.bucketName}/${filename}`;
  }

  async deleteProductImage(imageUrl: string): Promise<void> {
    const parts = imageUrl.split(`/${this.bucketName}/`);
    if (parts.length !== 2) return;
    const filename = parts[1];
    await this.minioClient.removeObject(this.bucketName, filename);
  }
}
