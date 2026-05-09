import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret_key_min_32_chars__',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  encryptionKey: process.env.ENCRYPTION_KEY || 'default_encryption_key_32_chars__',
}));
