import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  name: 'minio',
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  publicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000',
  bucketName: process.env.MINIO_BUCKET_NAME || 'inventory-images',
}));
