import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seedProducts } from './products.seed';

// Load environment variables
dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME || 'inventory',
  password: process.env.DB_PASSWORD || 'inventory_password',
  database: process.env.DB_DATABASE || 'smart_inventory',
  entities: [__dirname + '/../../common/entities/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function main() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    await seedProducts(dataSource);

    await dataSource.destroy();
    console.log('Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
