import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import minioConfig from './config/minio.config';
import telegramConfig from './config/telegram.config';
import googleOAuthConfig from './config/google-oauth.config';
import { validateEnv } from './config/env.validation';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UnitsModule } from './modules/units/units.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { BatchesModule } from './modules/batches/batches.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { HealthModule } from './modules/health/health.module';
import { ExpiryMonitorModule } from './modules/expiry-monitor/expiry-monitor.module';
import { ImageStorageModule } from './modules/image-storage/image-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, minioConfig, telegramConfig, googleOAuthConfig],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        username: process.env.DB_USERNAME || 'inventory',
        password: process.env.DB_PASSWORD || 'inventory_password',
        database: process.env.DB_DATABASE || 'smart_inventory',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        extra: {
          connectionLimit: 20,
          waitForConnections: true,
          queueLimit: 0,
          connectTimeout: 10000,
        },
      }),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 1000,
    }]),
    AuthModule,
    ProductsModule,
    CategoriesModule,
    UnitsModule,
    SuppliersModule,
    BatchesModule,
    InventoryModule,
    TransactionsModule,
    DashboardModule,
    ReportsModule,
    NotificationsModule,
    SettingsModule,
    TelegramModule,
    HealthModule,
    ExpiryMonitorModule,
    ImageStorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
