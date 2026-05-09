import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', () => ({
  name: 'default',
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'inventory',
  password: process.env.DB_PASSWORD || 'inventory_password',
  database: process.env.DB_DATABASE || 'smart_inventory',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
  },
} as TypeOrmModuleOptions));
