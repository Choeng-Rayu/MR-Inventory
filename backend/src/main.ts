import { NestFactory } from '@nestjs/core';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import helmet from 'helmet';
import { json, urlencoded, Request, Response } from 'express';
import axios from 'axios';
import { AppModule } from './app.module';
import { runInitialSeeds } from './database/seeds/initial.seed';
import { DataSource } from 'typeorm';
import { User } from './common/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context}] ${level}: ${message}${trace ? '\n' + trace : ''}`;
            }),
          ),
        }),
      ],
    }),
  });

  // REQ-4.4: Request size limits
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // REQ-9.5: Helmet security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", process.env.MINIO_PUBLIC_URL || '*'],
      },
    },
  }));

  // REQ-9.3: CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // REQ-4.1: Global API prefix
  app.setGlobalPrefix('api');

  // REQ-4.2: Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // REQ-9.7: Global serializer interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get('Reflector')));

  // REQ-31: Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Smart Inventory Management API')
    .setDescription('REST API for batch-level inventory tracking with FIFO management')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    }, 'JWT-auth')
    .addTag('Authentication', 'User authentication and OAuth endpoints')
    .addTag('Products', 'Product catalog management')
    .addTag('Categories', 'Product category management')
    .addTag('Suppliers', 'Supplier management')
    .addTag('Batches', 'Inventory batch tracking')
    .addTag('Inventory', 'Check-in, check-out, and adjustment operations')
    .addTag('Transactions', 'Transaction history')
    .addTag('Dashboard', 'Dashboard metrics and analytics')
    .addTag('Reports', 'Inventory and expiry reports')
    .addTag('Notifications', 'In-app notifications')
    .addTag('Settings', 'System and user settings')
    .addTag('Health', 'Health checks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // REQ-2.1: Google OAuth callback handler (mounted outside /api prefix)
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/auth/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const error = req.query.error as string;

    if (error || !code) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    try {
      // Exchange authorization code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleCallbackUrl,
        grant_type: 'authorization_code',
      });

      const { id_token } = tokenResponse.data;

      // Verify ID token
      const tokenInfoResponse = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`
      );

      const { email, name, picture, sub: googleId, aud } = tokenInfoResponse.data;

      if (googleClientId && aud !== googleClientId) {
        return res.redirect(`${frontendUrl}/login?error=invalid_token_audience`);
      }

      // Find or create user
      const dataSource = app.get(DataSource);
      const userRepository = dataSource.getRepository(User);

      let user = await userRepository.findOne({ where: { email } });

      if (!user) {
        user = userRepository.create({
          email,
          name,
          oauthProvider: 'google',
          oauthId: googleId,
          profilePicture: picture,
        });
      } else {
        user.oauthId = googleId;
        user.profilePicture = picture;
      }
      await userRepository.save(user);

      // Generate JWT
      const jwtService = app.get(JwtService);
      const token = jwtService.sign({ sub: user.id, email: user.email });

      // Redirect to frontend with token
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    } catch (err) {
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  });

  await app.listen(process.env.PORT ?? 3000);

  // Run seeds in development
  if (process.env.NODE_ENV === 'development') {
    const dataSource = app.get(DataSource);
    await runInitialSeeds(dataSource);
  }

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
