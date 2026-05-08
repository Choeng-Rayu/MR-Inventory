# Design Document: Smart Inventory Backend

## 1. Introduction

The Smart Inventory Management System Backend is a NestJS-based REST API that provides comprehensive inventory tracking at the batch/lot level with FIFO management, automated expiry detection, and multi-channel notifications. This document outlines the technical design for implementing all 42 requirements specified in requirements.md.

## 2. System Architecture

### 2.1 Technology Stack

- **Backend Framework**: NestJS (Node.js/TypeScript)
- **Database**: MySQL 8.0
- **Object Storage**: MinIO
- **Authentication**: JWT + OAuth (Google, Telegram)
- **Scheduling**: NestJS Schedule (@nestjs/schedule with node-cron)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx

### 2.2 Architecture Pattern

The system follows a modular, service-oriented architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx Reverse Proxy                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      NestJS Backend API                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │Product Module│  │Supplier Module│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Batch Module │  │CheckIn Module│  │CheckOut Module│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Notification  │  │Transaction   │  │Dashboard      │     │
│  │   Module     │  │   Module     │  │   Module      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │Report Module │  │Expiry Monitor│                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
           ↓                              ↓
┌─────────────────────┐      ┌─────────────────────┐
│   MySQL Database    │      │   MinIO Storage     │
└─────────────────────┘      └─────────────────────┘
```

### 2.3 Module Structure

Each module contains:
- **Controller**: HTTP endpoint handlers
- **Service**: Business logic implementation
- **Repository**: Database access layer (TypeORM)
- **DTOs**: Request/response validation schemas
- **Entities**: Database models

### 2.4 Deployment Architecture

Docker Compose orchestrates four containers:
1. **backend**: NestJS application (port 3000)
2. **mysql**: MySQL database (port 3306)
3. **minio**: Object storage (port 9000, 9001)
4. **nginx**: Reverse proxy (port 80, 443)


## 3. Data Models

### 3.1 Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  oauth_provider ENUM('google', 'telegram', NULL),
  oauth_id VARCHAR(255),
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_oauth (oauth_provider, oauth_id)
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  barcode VARCHAR(255) UNIQUE,
  category_id INT,
  base_unit VARCHAR(50) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  low_stock_threshold DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_sku (sku),
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id)
);
```

#### Units Table
```sql
CREATE TABLE units (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  unit_name VARCHAR(50) NOT NULL,
  conversion_rate DECIMAL(10,4) NOT NULL,
  is_base_unit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_unit (product_id, unit_name)
);
```

#### Suppliers Table
```sql
CREATE TABLE suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) UNIQUE NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Batches Table
```sql
CREATE TABLE batches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  batch_code VARCHAR(50) UNIQUE NOT NULL,
  product_id INT NOT NULL,
  supplier_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL COMMENT 'Quantity in base unit',
  import_date DATE NOT NULL,
  expiry_date DATE,
  unit_cost DECIMAL(10,2) NOT NULL,
  is_depleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT,
  INDEX idx_product_import (product_id, import_date),
  INDEX idx_expiry (expiry_date),
  INDEX idx_supplier (supplier_id)
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('check_in', 'check_out', 'adjustment', 'damage', 'return') NOT NULL,
  product_id INT NOT NULL,
  batch_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL COMMENT 'Quantity in base unit',
  unit_id INT NOT NULL COMMENT 'Unit used for this transaction',
  user_id INT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_timestamp (timestamp),
  INDEX idx_product (product_id),
  INDEX idx_type (type)
);
```

#### Notifications Table
```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('near_expiry', 'expired', 'low_stock', 'check_in', 'check_out') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_product_id INT,
  related_batch_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (related_batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  INDEX idx_user_read (user_id, is_read),
  INDEX idx_created (created_at)
);
```

#### Settings Table
```sql
CREATE TABLE settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key_name VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2 Entity Relationships

- **User** → **Transactions** (1:N)
- **User** → **Notifications** (1:N)
- **Category** → **Products** (1:N)
- **Product** → **Units** (1:N)
- **Product** → **Batches** (1:N)
- **Product** → **Transactions** (1:N)
- **Product** → **Notifications** (1:N, optional)
- **Supplier** → **Batches** (1:N)
- **Batch** → **Transactions** (1:N)
- **Batch** → **Notifications** (1:N, optional)
- **Unit** → **Transactions** (1:N)

**Key Constraints:**
- Products cannot be deleted if they have batches (CASCADE on batches)
- Suppliers cannot be deleted if they have batches (RESTRICT)
- Units cannot be deleted if they have transactions (RESTRICT)
- Categories can be deleted (products set to NULL)


## 4. Authentication & Authorization

### 4.1 Authentication Flow

#### Local Authentication (Email/Password)
```
1. User submits email + password
2. AuthService.validateUser():
   - Query user by email
   - Compare password with bcrypt.compare()
   - Return user if valid
3. AuthService.login():
   - Generate JWT with payload: { sub: user.id, email: user.email }
   - Set expiration: 24 hours
   - Return { access_token, user }
```

#### Google OAuth Flow
```
1. Frontend receives Google OAuth token
2. POST /auth/google with { token }
3. AuthService.googleLogin():
   - Verify token with Google API
   - Extract: email, name, picture, google_id
   - Check if user exists by email
   - If not exists: create user with oauth_provider='google'
   - If exists: verify oauth_provider matches
   - Generate JWT
   - Return { access_token, user }
```

#### Telegram OAuth Flow
```
1. Frontend receives Telegram auth data
2. POST /auth/telegram with { id, first_name, last_name, username, photo_url, auth_date, hash }
3. AuthService.telegramLogin():
   - Verify hash using HMAC-SHA256 with bot token
   - Validate auth_date within 24 hours
   - Check if user exists by telegram_id (oauth_id)
   - If not exists: create user with oauth_provider='telegram'
   - Generate JWT
   - Return { access_token, user }
```

### 4.2 JWT Strategy

**Token Structure:**
```json
{
  "sub": 123,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Implementation:**
- Use `@nestjs/jwt` and `@nestjs/passport`
- Secret key from environment variable `JWT_SECRET`
- Expiration: 24 hours
- Validation on every protected route via `JwtAuthGuard`

### 4.3 Password Security

- Hash algorithm: bcrypt
- Salt rounds: 10
- Never store plain text passwords
- Password validation: minimum 8 characters (enforced in DTO)

### 4.4 Protected Routes

All routes except `/auth/*` and `/health` require JWT authentication via `@UseGuards(JwtAuthGuard)` decorator.


## 5. API Design

### 5.1 Authentication Endpoints

#### POST /auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
**Response:** `{ access_token: string, user: UserDto }`

#### POST /auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:** `{ access_token: string, user: UserDto }`

#### POST /auth/google
**Request:** `{ token: string }`
**Response:** `{ access_token: string, user: UserDto }`

#### POST /auth/telegram
**Request:** `{ id, first_name, last_name, username, photo_url, auth_date, hash }`
**Response:** `{ access_token: string, user: UserDto }`

#### POST /auth/logout
**Response:** `{ message: "Logged out successfully" }`

#### GET /auth/profile
**Headers:** `Authorization: Bearer <token>`
**Response:** `UserDto` (current authenticated user)

### 5.2 Product Endpoints

#### GET /products
**Query Params:** `page, limit, search, category_id, stock_status`
**Note:** `search` parameter searches across name, SKU, and barcode
**Response:** `{ data: Product[], total, page, totalPages, hasNext }`

#### GET /products/:id
**Response:** `Product`

#### GET /products/barcode/:barcode
**Response:** `Product` (lookup product by barcode)
**Error:** 404 if barcode not found

#### POST /products
**Request:**
```json
{
  "name": "Product Name",
  "sku": "PROD-001",
  "barcode": "1234567890",
  "category_id": 1,
  "base_unit": "piece",
  "description": "Product description",
  "low_stock_threshold": 10
}
```
**Response:** `Product`

#### PUT /products/:id
**Request:** Same as POST
**Response:** `Product`

#### DELETE /products/:id
**Response:** `{ message: "Product deleted" }`

#### POST /products/:id/image
**Request:** `multipart/form-data` with `file` field
**Response:** `{ image_url: string }`

#### GET /products/:id/units
**Response:** `Unit[]`

#### POST /products/:id/units
**Request:**
```json
{
  "unit_name": "box",
  "conversion_rate": 12.0,
  "is_base_unit": false
}
```
**Response:** `Unit`

### 5.3 Category Endpoints

#### GET /categories
**Response:** `Category[]`

#### POST /categories
**Request:** `{ name: string, description?: string }`
**Response:** `Category`

#### PUT /categories/:id
**Request:** `{ name: string, description?: string }`
**Response:** `Category`

#### DELETE /categories/:id
**Response:** `{ message: "Category deleted" }`

### 5.4 Supplier Endpoints

#### GET /suppliers
**Query Params:** `page, limit`
**Response:** `{ data: Supplier[], total, page, totalPages, hasNext }`

#### GET /suppliers/:id
**Response:** `Supplier`

#### POST /suppliers
**Request:**
```json
{
  "name": "Supplier Name",
  "contact_person": "John Doe",
  "phone": "+1234567890",
  "email": "supplier@example.com",
  "address": "123 Street"
}
```
**Response:** `Supplier`

#### PUT /suppliers/:id
**Request:** Same as POST
**Response:** `Supplier`

#### DELETE /suppliers/:id
**Response:** `{ message: "Supplier deleted" }`

#### GET /suppliers/:id/inventory
**Query Params:** `start_date, end_date, product_id`
**Response:** `Batch[]` with product details and total value calculation

### 5.5 Batch Endpoints

#### GET /batches
**Query Params:** `page, limit, product_id, supplier_id, expiry_from, expiry_to`
**Response:** `{ data: Batch[], total, page, totalPages, hasNext }`

#### GET /batches/:id
**Response:** `Batch`

#### POST /batches
**Request:**
```json
{
  "product_id": 1,
  "supplier_id": 1,
  "quantity": 100,
  "import_date": "2024-01-01",
  "expiry_date": "2024-12-31",
  "unit_cost": 10.50
}
```
**Note:** Quantity must be in base unit
**Response:** `Batch`

### 5.6 Inventory Operations

#### POST /inventory/check-in
**Request:**
```json
{
  "product_id": 1,
  "supplier_id": 1,
  "quantity": 100,
  "unit_id": 1,
  "import_date": "2024-01-01",
  "expiry_date": "2024-12-31",
  "unit_cost": 10.50
}
```
**Note:** Backend converts quantity to base unit using unit_id before creating batch
**Response:**
```json
{
  "batch": Batch,
  "transaction": Transaction
}
```

#### POST /inventory/check-out
**Request:**
```json
{
  "product_id": 1,
  "quantity": 50,
  "unit_id": 1
}
```
**Response:**
```json
{
  "deductions": [
    { "batch_id": 1, "batch_code": "BATCH-20240101-0001", "quantity_deducted": 30 },
    { "batch_id": 2, "batch_code": "BATCH-20240102-0001", "quantity_deducted": 20 }
  ],
  "transactions": Transaction[]
}
```

#### POST /inventory/adjust
**Request:**
```json
{
  "batch_id": 1,
  "adjustment_quantity": -5,
  "unit_id": 1,
  "reason": "Damaged items"
}
```
**Note:** Backend converts adjustment_quantity to base unit using unit_id
**Response:** `{ batch: Batch, transaction: Transaction }`

### 5.7 Transaction Endpoints

#### GET /transactions
**Query Params:** `page, limit, type, product_id, start_date, end_date, user_id`
**Response:** `{ data: Transaction[], total, page, totalPages, hasNext }`

#### GET /transactions/:id
**Response:** `Transaction`

### 5.8 Dashboard Endpoints

#### GET /dashboard/metrics
**Response:**
```json
{
  "total_inventory_value": 125000.50,
  "total_products": 150,
  "low_stock_count": 12,
  "near_expiry_count": 8,
  "expired_count": 3,
  "recent_transactions": Transaction[]
}
```

#### GET /dashboard/low-stock
**Response:** `{ product_id, product_name, current_quantity, threshold }[]`

### 5.9 Report Endpoints

#### GET /reports/inventory
**Query Params:** `category_id, supplier_id, start_date, end_date, format`
**Response:** JSON or CSV file

#### GET /reports/expiry
**Query Params:** `status, start_date, end_date, format`
**Response:** JSON or CSV file

#### GET /reports/supplier-performance
**Query Params:** `supplier_id, start_date, end_date, format`
**Response:** JSON or CSV file

### 5.10 Notification Endpoints

#### GET /notifications
**Query Params:** `page, limit, type, is_read`
**Response:** `{ data: Notification[], total, page, totalPages, hasNext }`

#### GET /notifications/unread-count
**Response:** `{ count: number }`

#### PUT /notifications/:id/read
**Response:** `Notification`

#### PUT /notifications/mark-all-read
**Response:** `{ updated_count: number }`

### 5.11 Settings Endpoints

#### GET /settings
**Response:** `{ near_expiry_threshold, low_stock_threshold, telegram_enabled, ... }`

#### PUT /settings
**Request:**
```json
{
  "near_expiry_threshold": 30,
  "low_stock_threshold": 10,
  "telegram_enabled": true,
  "telegram_bot_token": "...",
  "telegram_chat_id": "..."
}
```
**Response:** `Settings`

### 5.12 Health Check

#### GET /health
**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "storage": "connected",
  "timestamp": "2024-01-01T00:00:00Z"
}
```


## 6. Core Business Logic

### 6.1 FIFO Check-Out Algorithm

**Implementation in CheckOutService:**

```typescript
async checkOut(productId: number, quantity: number, unitId: number, userId: number) {
  // Start database transaction
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    // 1. Convert quantity to base unit
    const unit = await this.unitRepository.findOne({ where: { id: unitId } });
    const baseQuantity = quantity * unit.conversion_rate;
    
    // 2. Get all non-depleted batches ordered by import_date ASC (FIFO)
    const batches = await queryRunner.manager.find(Batch, {
      where: { product_id: productId, is_depleted: false },
      order: { import_date: 'ASC' }
    });
    
    // 3. Calculate total available quantity
    const totalAvailable = batches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalAvailable < baseQuantity) {
      throw new InsufficientStockException();
    }
    
    // 4. Deduct from batches using FIFO
    let remainingToDeduct = baseQuantity;
    const deductions = [];
    const transactions = [];
    
    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;
      
      const deductAmount = Math.min(batch.quantity, remainingToDeduct);
      
      // Update batch quantity
      batch.quantity -= deductAmount;
      if (batch.quantity === 0) {
        batch.is_depleted = true;
      }
      await queryRunner.manager.save(batch);
      
      // Record transaction
      const transaction = await queryRunner.manager.save(Transaction, {
        type: 'check_out',
        product_id: productId,
        batch_id: batch.id,
        quantity: deductAmount,
        unit_id: unitId,
        user_id: userId
      });
      
      deductions.push({
        batch_id: batch.id,
        batch_code: batch.batch_code,
        quantity_deducted: deductAmount
      });
      transactions.push(transaction);
      
      remainingToDeduct -= deductAmount;
    }
    
    // 5. Commit transaction
    await queryRunner.commitTransaction();
    
    return { deductions, transactions };
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
```

### 6.2 Unit Conversion Logic

**Implementation in UnitConverterService:**

```typescript
// Convert from any unit to base unit
toBaseUnit(quantity: number, conversionRate: number): number {
  return Math.round(quantity * conversionRate * 100) / 100;
}

// Convert from base unit to target unit
fromBaseUnit(baseQuantity: number, conversionRate: number): number {
  return Math.round((baseQuantity / conversionRate) * 100) / 100;
}

// Get conversion rate for a unit
async getConversionRate(unitId: number): Promise<number> {
  const unit = await this.unitRepository.findOne({ where: { id: unitId } });
  if (!unit) throw new NotFoundException('Unit not found');
  return unit.conversion_rate;
}
```

### 6.3 Batch Code Generation

**Implementation in BatchService:**

```typescript
async generateBatchCode(importDate: Date): Promise<string> {
  const dateStr = format(importDate, 'yyyyMMdd');
  
  // Get count of batches created on this date
  const count = await this.batchRepository.count({
    where: { batch_code: Like(`BATCH-${dateStr}-%`) }
  });
  
  const sequence = (count + 1).toString().padStart(4, '0');
  return `BATCH-${dateStr}-${sequence}`;
}
```

### 6.4 Expiry Detection Scheduler

**Implementation in ExpiryMonitorService:**

```typescript
@Cron('0 0 * * *') // Run daily at midnight UTC
async detectExpiry() {
  try {
    // 1. Get near expiry threshold from settings
    const threshold = await this.settingsService.get('near_expiry_threshold') || 30;
    const thresholdDate = addDays(new Date(), threshold);
    
    // 2. Find near-expiry batches
    const nearExpiryBatches = await this.batchRepository.find({
      where: {
        expiry_date: Between(new Date(), thresholdDate),
        is_depleted: false
      },
      relations: ['product', 'supplier']
    });
    
    // 3. Create notifications for near-expiry
    for (const batch of nearExpiryBatches) {
      await this.notificationService.create({
        type: 'near_expiry',
        title: `Product Near Expiry: ${batch.product.name}`,
        message: `Batch ${batch.batch_code} expires on ${batch.expiry_date}`,
        related_product_id: batch.product_id,
        related_batch_id: batch.id
      });
    }
    
    // 4. Find expired batches
    const expiredBatches = await this.batchRepository.find({
      where: {
        expiry_date: LessThan(new Date()),
        is_depleted: false
      },
      relations: ['product', 'supplier']
    });
    
    // 5. Create notifications for expired
    for (const batch of expiredBatches) {
      await this.notificationService.create({
        type: 'expired',
        title: `Product Expired: ${batch.product.name}`,
        message: `Batch ${batch.batch_code} expired on ${batch.expiry_date}`,
        related_product_id: batch.product_id,
        related_batch_id: batch.id
      });
    }
    
    // 6. Send external notifications
    await this.notificationService.sendExternalNotifications(
      [...nearExpiryBatches, ...expiredBatches]
    );
    
    this.logger.log(`Expiry detection completed: ${nearExpiryBatches.length} near expiry, ${expiredBatches.length} expired`);
    
  } catch (error) {
    this.logger.error('Expiry detection failed', error);
  }
}
```

### 6.5 Low Stock Detection

**Implementation in DashboardService:**

```typescript
async getLowStockProducts(): Promise<LowStockDto[]> {
  // Get all products with their total quantities
  const products = await this.productRepository
    .createQueryBuilder('product')
    .leftJoin('product.batches', 'batch')
    .select('product.id', 'product_id')
    .addSelect('product.name', 'product_name')
    .addSelect('product.low_stock_threshold', 'threshold')
    .addSelect('COALESCE(SUM(batch.quantity), 0)', 'current_quantity')
    .where('batch.is_depleted = false OR batch.is_depleted IS NULL')
    .groupBy('product.id')
    .having('current_quantity < product.low_stock_threshold')
    .orderBy('current_quantity', 'ASC')
    .getRawMany();
  
  return products;
}
```


## 7. External Integrations

### 7.1 MinIO Object Storage

**Configuration:**
```typescript
// minio.config.ts
export const minioConfig = {
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
};
```

**Image Upload Implementation:**
```typescript
// ImageStorageService
async uploadProductImage(file: Express.Multer.File, productId: number): Promise<string> {
  // 1. Validate file
  const allowedFormats = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedFormats.includes(file.mimetype)) {
    throw new BadRequestException('Invalid image format');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    throw new BadRequestException('File size exceeds 5MB');
  }
  
  // 2. Generate unique filename
  const ext = file.originalname.split('.').pop();
  const filename = `products/${productId}/${uuidv4()}.${ext}`;
  
  // 3. Upload to MinIO
  await this.minioClient.putObject(
    'inventory-images',
    filename,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );
  
  // 4. Return public URL
  return `${process.env.MINIO_PUBLIC_URL}/inventory-images/${filename}`;
}

async deleteProductImage(imageUrl: string): Promise<void> {
  const filename = imageUrl.split('/inventory-images/')[1];
  await this.minioClient.removeObject('inventory-images', filename);
}
```

**Bucket Initialization:**
```typescript
async onModuleInit() {
  const bucketName = 'inventory-images';
  const exists = await this.minioClient.bucketExists(bucketName);
  
  if (!exists) {
    await this.minioClient.makeBucket(bucketName, 'us-east-1');
    
    // Set public read policy
    const policy = {
      Version: '2012-10-17',
      Statement: [{
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`]
      }]
    };
    await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
}
```

### 7.2 Telegram Bot Integration

**Configuration:**
```typescript
// telegram.config.ts
export const telegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID
};
```

**Notification Sending:**
```typescript
// TelegramBotService
async sendNotification(notification: NotificationDto): Promise<void> {
  if (!this.isEnabled()) return;
  
  try {
    const message = this.formatMessage(notification);
    
    await axios.post(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown'
      }
    );
    
    this.logger.log(`Telegram notification sent: ${notification.type}`);
  } catch (error) {
    this.logger.error('Failed to send Telegram notification', error);
    // Don't throw - notification failure shouldn't block main operation
  }
}

private formatMessage(notification: NotificationDto): string {
  const emoji = {
    near_expiry: '⚠️',
    expired: '❌',
    low_stock: '📉',
    check_in: '📥',
    check_out: '📤'
  };
  
  return `${emoji[notification.type]} *${notification.title}*\n\n${notification.message}`;
}

private isEnabled(): boolean {
  return !!(this.botToken && this.chatId);
}
```

**Telegram OAuth Verification:**
```typescript
// AuthService
async verifyTelegramAuth(authData: TelegramAuthDto): Promise<boolean> {
  const { hash, ...data } = authData;
  
  // 1. Create data check string
  const dataCheckString = Object.keys(data)
    .sort()
    .map(key => `${key}=${data[key]}`)
    .join('\n');
  
  // 2. Create secret key from bot token
  const secretKey = crypto
    .createHash('sha256')
    .update(this.telegramConfig.botToken)
    .digest();
  
  // 3. Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  // 4. Verify hash matches
  if (calculatedHash !== hash) {
    return false;
  }
  
  // 5. Verify timestamp (within 24 hours)
  const authDate = parseInt(authData.auth_date);
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 86400) {
    return false;
  }
  
  return true;
}
```

### 7.3 Google OAuth Integration

**Configuration:**
```typescript
// google-oauth.config.ts
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET
};
```

**Token Verification:**
```typescript
// AuthService
async verifyGoogleToken(token: string): Promise<GoogleUserDto> {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    
    const { email, name, picture, sub: googleId } = response.data;
    
    // Verify audience matches our client ID
    if (response.data.aud !== this.googleOAuthConfig.clientId) {
      throw new UnauthorizedException('Invalid token audience');
    }
    
    return { email, name, picture, googleId };
  } catch (error) {
    throw new UnauthorizedException('Invalid Google token');
  }
}
```


## 8. Error Handling & Validation

### 8.1 Error Response Format

**Standard Error Response:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/products",
  "details": [
    {
      "field": "name",
      "message": "name should not be empty"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation errors
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource (e.g., unique constraint violation)
- `422 Unprocessable Entity` - Business logic error (e.g., insufficient stock)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - Health check failed

### 8.2 Global Exception Filter

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status = 500;
    let message = 'Internal server error';
    let details = null;
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : exceptionResponse['message'];
      details = exceptionResponse['details'];
    } else if (exception.code === 'ER_DUP_ENTRY') {
      status = 409;
      message = 'Duplicate entry';
    }
    
    // Log error with stack trace
    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'GlobalExceptionFilter'
    );
    
    response.status(status).json({
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details })
    });
  }
}
```

### 8.3 Custom Business Exceptions

```typescript
export class InsufficientStockException extends HttpException {
  constructor(available: number, requested: number) {
    super(
      {
        message: 'Insufficient stock',
        details: { available, requested }
      },
      422
    );
  }
}

export class BatchDepletedException extends HttpException {
  constructor(batchCode: string) {
    super(`Batch ${batchCode} is already depleted`, 422);
  }
}

export class InvalidUnitException extends HttpException {
  constructor(unitId: number, productId: number) {
    super(`Unit ${unitId} does not belong to product ${productId}`, 400);
  }
}
```

### 8.4 DTO Validation

**Using class-validator decorators:**

```typescript
// CreateProductDto
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;
  
  @IsString()
  @IsOptional()
  @MaxLength(255)
  barcode?: string;
  
  @IsInt()
  @IsOptional()
  category_id?: number;
  
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  base_unit: string;
  
  @IsNumber()
  @Min(0)
  @IsOptional()
  low_stock_threshold?: number;
}

// CheckOutDto
export class CheckOutDto {
  @IsInt()
  @IsPositive()
  product_id: number;
  
  @IsNumber()
  @IsPositive()
  quantity: number;
  
  @IsInt()
  @IsPositive()
  unit_id: number;
}
```

**Validation Pipe Configuration:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true
  }
}));
```

### 8.5 Input Sanitization

```typescript
// Sanitize string inputs to prevent SQL injection
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim();
}

// Applied in DTOs via custom decorator
export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    return value;
  });
}
```

## 9. Security Measures

### 9.1 Authentication Security

- **Password Hashing**: bcrypt with salt rounds = 10
- **JWT Secret**: Strong random string stored in environment variable
- **Token Expiration**: 24 hours
- **Token Validation**: On every protected route
- **OAuth Token Verification**: Server-side verification with provider APIs

### 9.2 Rate Limiting

```typescript
// Rate limit configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 100, // Max requests per ttl
    }),
  ],
})
export class AppModule {}

// Apply stricter limits to auth endpoints
@Controller('auth')
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per minute
export class AuthController {}
```

### 9.3 CORS Configuration

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
```

### 9.4 Request Size Limits

```typescript
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));
```

### 9.5 Helmet Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", process.env.MINIO_PUBLIC_URL]
    }
  }
}));
```

### 9.6 SQL Injection Prevention

- Use TypeORM parameterized queries (never string concatenation)
- Validate and sanitize all user inputs
- Use DTO validation with class-validator

### 9.7 Sensitive Data Protection

```typescript
// Encrypt sensitive settings before storage
export class SettingsService {
  private encryptValue(value: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    return cipher.update(value, 'utf8', 'hex') + cipher.final('hex');
  }
  
  private decryptValue(encrypted: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}

// Exclude sensitive fields from responses
export class UserEntity {
  @Exclude()
  password_hash: string;
  
  @Exclude()
  oauth_id: string;
}
```


## 10. Performance Optimization

### 10.1 Database Indexing Strategy

**Indexes Created:**
```sql
-- Products
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);

-- Batches (critical for FIFO and expiry queries)
CREATE INDEX idx_batches_product_import ON batches(product_id, import_date);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);
CREATE INDEX idx_batches_supplier ON batches(supplier_id);
CREATE INDEX idx_batches_depleted ON batches(is_depleted);

-- Transactions (for history queries)
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_product ON transactions(product_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_user ON transactions(user_id);

-- Notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Users
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

### 10.2 Database Connection Pooling

```typescript
// TypeORM configuration
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
  extra: {
    connectionLimit: 20,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000
  }
};
```

### 10.3 Query Optimization

**Eager Loading Relations:**
```typescript
// Load related data in single query
const batches = await this.batchRepository.find({
  where: { product_id: productId },
  relations: ['product', 'supplier', 'unit'],
  order: { import_date: 'ASC' }
});
```

**Pagination with Efficient Counting:**
```typescript
async findPaginated(page: number, limit: number, filters: any) {
  const [data, total] = await this.repository.findAndCount({
    where: filters,
    skip: (page - 1) * limit,
    take: limit,
    order: { created_at: 'DESC' }
  });
  
  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total
  };
}
```

### 10.4 Caching Strategy

**Cache Dashboard Metrics (5 minutes):**
```typescript
@Injectable()
export class DashboardService {
  private metricsCache: { data: any; timestamp: number } = null;
  private CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  async getMetrics(): Promise<DashboardMetricsDto> {
    const now = Date.now();
    
    if (this.metricsCache && now - this.metricsCache.timestamp < this.CACHE_TTL) {
      return this.metricsCache.data;
    }
    
    const metrics = await this.calculateMetrics();
    this.metricsCache = { data: metrics, timestamp: now };
    
    return metrics;
  }
}
```

### 10.5 Batch Operations

**Bulk Insert for Transactions:**
```typescript
// Instead of multiple inserts
await this.transactionRepository.save(transactions); // Single query
```

## 11. Logging & Monitoring

### 11.1 Logging Configuration

```typescript
// Winston logger configuration
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context}] ${level}: ${message}${trace ? '\n' + trace : ''}`;
        })
      )
    })
  ]
});
```

### 11.2 Request Logging Middleware

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const userId = req['user']?.id || 'anonymous';
    
    const start = Date.now();
    
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${duration}ms - ${userId} - ${ip} - ${userAgent}`
      );
    });
    
    next();
  }
}
```

### 11.3 Structured Logging

```typescript
// Log inventory operations
this.logger.log({
  action: 'check_out',
  user_id: userId,
  product_id: productId,
  quantity: quantity,
  batches_affected: deductions.length,
  timestamp: new Date().toISOString()
});

// Log errors with context
this.logger.error({
  action: 'check_out_failed',
  error: error.message,
  stack: error.stack,
  user_id: userId,
  product_id: productId,
  timestamp: new Date().toISOString()
});
```

### 11.4 Health Check Implementation

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private minioService: MinioService
  ) {}
  
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.minioService.healthCheck('storage')
    ]);
  }
}
```

## 12. Deployment Configuration

### 12.1 Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 12.2 Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USERNAME=inventory
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_DATABASE=smart_inventory
      - JWT_SECRET=${JWT_SECRET}
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
    depends_on:
      - mysql
      - minio
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=smart_inventory
      - MYSQL_USER=inventory
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  mysql_data:
  minio_data:
```

### 12.3 Environment Variables

```bash
# .env.example
NODE_ENV=production

# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=inventory
DB_PASSWORD=your_secure_password
DB_DATABASE=smart_inventory
MYSQL_ROOT_PASSWORD=your_root_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_PUBLIC_URL=http://localhost:9000

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Frontend
FRONTEND_URL=http://localhost:3001

# Encryption
ENCRYPTION_KEY=your_encryption_key_32_chars
```

### 12.4 Database Migrations

```typescript
// Using TypeORM migrations
// Generate migration
npm run migration:generate -- -n CreateInitialSchema

// Run migrations
npm run migration:run

// Revert migration
npm run migration:revert
```

### 12.5 Nginx Configuration

```nginx
upstream backend {
    server backend:3000;
}

server {
    listen 80;
    server_name api.inventory.example.com;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```


## 13. API Documentation

### 13.1 Swagger Configuration

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('Smart Inventory Management API')
  .setDescription('REST API for batch-level inventory tracking with FIFO management')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'JWT-auth'
  )
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
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### 13.2 DTO Documentation Examples

```typescript
export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Coca Cola 330ml',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @ApiProperty({
    description: 'Product barcode (EAN-13, UPC-A, Code-128, or QR)',
    example: '1234567890123',
    required: false
  })
  @IsString()
  @IsOptional()
  barcode?: string;
  
  @ApiProperty({
    description: 'Category ID',
    example: 1,
    required: false
  })
  @IsInt()
  @IsOptional()
  category_id?: number;
}
```

### 13.3 Controller Documentation

```typescript
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: PaginatedProductsDto
  })
  async findAll(@Query() query: FindProductsDto) {
    return this.productsService.findAll(query);
  }
  
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductDto
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Duplicate barcode' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

## 14. Testing Strategy

### 14.1 Unit Tests

**Service Testing Example:**
```typescript
describe('CheckOutService', () => {
  let service: CheckOutService;
  let batchRepository: Repository<Batch>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CheckOutService,
        {
          provide: getRepositoryToken(Batch),
          useValue: {
            find: jest.fn(),
            save: jest.fn()
          }
        }
      ]
    }).compile();
    
    service = module.get<CheckOutService>(CheckOutService);
    batchRepository = module.get(getRepositoryToken(Batch));
  });
  
  it('should deduct from oldest batch first (FIFO)', async () => {
    const batches = [
      { id: 1, quantity: 50, import_date: '2024-01-01' },
      { id: 2, quantity: 100, import_date: '2024-01-02' }
    ];
    
    jest.spyOn(batchRepository, 'find').mockResolvedValue(batches);
    
    const result = await service.checkOut(1, 30, 1, 1);
    
    expect(result.deductions).toHaveLength(1);
    expect(result.deductions[0].batch_id).toBe(1);
    expect(result.deductions[0].quantity_deducted).toBe(30);
  });
  
  it('should throw error when insufficient stock', async () => {
    jest.spyOn(batchRepository, 'find').mockResolvedValue([
      { id: 1, quantity: 10, import_date: '2024-01-01' }
    ]);
    
    await expect(service.checkOut(1, 50, 1, 1))
      .rejects
      .toThrow(InsufficientStockException);
  });
});
```

### 14.2 Integration Tests

**API Endpoint Testing:**
```typescript
describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    
    app = moduleFixture.createNestApplication();
    await app.init();
    
    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = response.body.access_token;
  });
  
  it('/products (POST)', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        barcode: '1234567890',
        base_unit: 'piece'
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.name).toBe('Test Product');
      });
  });
});
```

### 14.3 Test Coverage Goals

- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: All critical paths (auth, check-in, check-out, FIFO)
- **E2E Tests**: Main user workflows

## 15. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. **Project Setup**
   - Initialize NestJS project
   - Configure TypeORM with MySQL
   - Set up Docker Compose
   - Configure environment variables

2. **Database Schema**
   - Create all entity models
   - Generate and run migrations
   - Seed initial data

3. **Authentication Module**
   - Implement JWT strategy
   - Local authentication (email/password)
   - Google OAuth integration
   - Telegram OAuth integration

### Phase 2: Core Inventory (Week 3-4)
4. **Product Management**
   - Product CRUD operations
   - Category management
   - Unit configuration
   - Barcode support

5. **Supplier Management**
   - Supplier CRUD operations
   - Supplier-batch relationships

6. **Batch Management**
   - Batch creation
   - Batch code generation
   - Batch tracking

### Phase 3: Operations (Week 5-6)
7. **Check-In Service**
   - Inventory check-in
   - Batch creation on check-in
   - Transaction logging

8. **Check-Out Service**
   - FIFO algorithm implementation
   - Multi-batch deduction
   - Insufficient stock handling
   - Transaction logging

9. **Inventory Adjustments**
   - Manual adjustments
   - Damage tracking
   - Return processing

### Phase 4: Automation (Week 7)
10. **Expiry Detection**
    - Scheduled job setup
    - Near-expiry detection
    - Expired batch detection
    - Notification creation

11. **Low Stock Detection**
    - Real-time stock monitoring
    - Threshold-based alerts

### Phase 5: Notifications (Week 8)
12. **Notification System**
    - In-app notifications
    - Notification CRUD
    - Read/unread status

13. **External Integrations**
    - Telegram bot setup
    - External notification sending
    - MinIO image storage

### Phase 6: Analytics & Reports (Week 9)
14. **Dashboard Service**
    - Metrics calculation
    - Real-time analytics
    - Performance optimization

15. **Report Generation**
    - Inventory reports
    - Expiry reports
    - Supplier performance reports
    - CSV export

### Phase 7: Polish & Deploy (Week 10)
16. **Security Hardening**
    - Rate limiting
    - Input sanitization
    - CORS configuration
    - Helmet integration

17. **Documentation**
    - Swagger/OpenAPI setup
    - API documentation
    - Deployment guide

18. **Testing & Deployment**
    - Unit tests
    - Integration tests
    - Docker deployment
    - Production configuration

## 16. Requirements Traceability

### Authentication & Authorization
- ✅ Req 1: User Authentication → Auth Module with JWT
- ✅ Req 2: Google OAuth → AuthService.googleLogin()
- ✅ Req 3: Telegram OAuth → AuthService.telegramLogin()
- ✅ Req 4: API Validation → Global ValidationPipe + DTOs

### Product Management
- ✅ Req 5: Product Catalog → ProductService CRUD
- ✅ Req 6: Categories → CategoryService
- ✅ Req 7: Image Storage → MinIO integration
- ✅ Req 8: Unit Configuration → UnitService
- ✅ Req 9: Unit Conversion → UnitConverterService
- ✅ Req 38: Barcode Support → Product.barcode field + lookup

### Supplier Management
- ✅ Req 10: Supplier Management → SupplierService CRUD
- ✅ Req 11: Supplier History → SupplierService.getBatches()

### Batch & Inventory
- ✅ Req 12: Batch Creation → BatchService.create()
- ✅ Req 13: Quantity Tracking → Batch entity + updates
- ✅ Req 14: Check-In → CheckInService with transaction
- ✅ Req 15: Check-Out FIFO → CheckOutService with FIFO algorithm
- ✅ Req 20: Adjustments → AdjustmentService
- ✅ Req 42: Batch Code → generateBatchCode()

### Expiry & Notifications
- ✅ Req 16: Expiry Scheduling → @Cron decorator
- ✅ Req 17: In-App Notifications → NotificationService
- ✅ Req 18: Telegram Integration → TelegramBotService

### Transactions & History
- ✅ Req 19: Transaction Recording → TransactionLogger
- ✅ Req 20: Adjustment Tracking → Transaction type='adjustment'

### Dashboard & Reports
- ✅ Req 21: Dashboard Metrics → DashboardService.getMetrics()
- ✅ Req 22: Low Stock → DashboardService.getLowStock()
- ✅ Req 23: Inventory Report → ReportGenerator.inventory()
- ✅ Req 24: Expiry Report → ReportGenerator.expiry()
- ✅ Req 25: Supplier Report → ReportGenerator.supplierPerformance()
- ✅ Req 41: Data Export → CSV export functionality

### Settings & Configuration
- ✅ Req 26: User Settings → SettingsService
- ✅ Req 27: System Config → SettingsService with encryption

### Infrastructure
- ✅ Req 28: Transactions → TypeORM QueryRunner
- ✅ Req 29: Performance → Indexes + connection pooling
- ✅ Req 30: Error Handling → GlobalExceptionFilter
- ✅ Req 31: API Docs → Swagger/OpenAPI
- ✅ Req 32: CORS → app.enableCors()
- ✅ Req 33: Rate Limiting → ThrottlerModule
- ✅ Req 34: Health Check → HealthController
- ✅ Req 35: Logging → Winston logger
- ✅ Req 36: Docker → Dockerfile + docker-compose.yml
- ✅ Req 37: Schema Init → TypeORM migrations
- ✅ Req 39: Pagination → findAndCount with skip/take
- ✅ Req 40: Search/Filter → Query builders with WHERE

## 17. Conclusion

This design document provides a comprehensive blueprint for implementing the Smart Inventory Management System Backend. The architecture follows NestJS best practices with clear separation of concerns, robust error handling, and security measures. The FIFO algorithm ensures proper inventory rotation, while automated expiry detection and multi-channel notifications keep users informed of critical events.

Key design decisions:
- **Modular architecture** for maintainability and scalability
- **TypeORM** for type-safe database operations
- **JWT + OAuth** for flexible authentication
- **Transaction management** for data consistency
- **Scheduled jobs** for automated monitoring
- **Docker deployment** for consistent environments
- **Comprehensive validation** for data integrity
- **Performance optimization** through indexing and caching

The implementation roadmap provides a structured 10-week plan to deliver all 42 requirements systematically.

