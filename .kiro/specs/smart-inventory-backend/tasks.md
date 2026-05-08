# Implementation Tasks: Smart Inventory Backend

## Phase 1: Foundation & Setup

### Task 1.1: Project Initialization
- [ ] Initialize NestJS project with TypeScript
- [ ] Configure project structure with modules folder
- [ ] Set up ESLint and Prettier
- [ ] Create .gitignore file
- [ ] Initialize Git repository

### Task 1.2: Database Configuration
- [ ] Install TypeORM and MySQL dependencies
- [ ] Create database configuration file
- [ ] Set up TypeORM module in AppModule
- [ ] Configure connection pooling (min: 5, max: 20)
- [ ] Create ormconfig.ts for migrations

### Task 1.3: Docker Setup
- [ ] Create Dockerfile with multi-stage build
- [ ] Create docker-compose.yml with 4 services (backend, mysql, minio, nginx)
- [ ] Configure environment variables in .env.example
- [ ] Set up volume mounts for MySQL and MinIO
- [ ] Configure health checks for all services

### Task 1.4: Environment Configuration
- [ ] Install @nestjs/config
- [ ] Create config module for environment variables
- [ ] Set up validation schema for required env vars
- [ ] Create separate configs for database, JWT, MinIO, OAuth

## Phase 2: Database Schema & Entities

### Task 2.1: Create User Entity
- [ ] Create User entity with fields: id, email, password_hash, name, oauth_provider, oauth_id, profile_picture
- [ ] Add timestamps (created_at, updated_at)
- [ ] Add index on oauth_provider and oauth_id
- [ ] Add unique constraint on email

### Task 2.2: Create Category Entity
- [ ] Create Category entity with fields: id, name, description
- [ ] Add timestamps
- [ ] Add unique constraint on name

### Task 2.3: Create Product Entity
- [ ] Create Product entity with fields: id, name, barcode, category_id, base_unit, image_url, low_stock_threshold
- [ ] Add timestamps
- [ ] Add foreign key to Category
- [ ] Add indexes on barcode and category_id
- [ ] Add unique constraint on barcode

### Task 2.4: Create Unit Entity
- [ ] Create Unit entity with fields: id, product_id, unit_name, conversion_rate, is_base_unit
- [ ] Add foreign key to Product with CASCADE delete
- [ ] Add unique constraint on (product_id, unit_name)

### Task 2.5: Create Supplier Entity
- [ ] Create Supplier entity with fields: id, name, contact_person, phone, email, address
- [ ] Add timestamps
- [ ] Add unique constraint on name

### Task 2.6: Create Batch Entity
- [ ] Create Batch entity with fields: id, batch_code, product_id, supplier_id, quantity, unit_id, import_date, expiry_date, unit_cost, is_depleted
- [ ] Add timestamps
- [ ] Add foreign keys to Product, Supplier, Unit
- [ ] Add indexes on product_id+import_date, expiry_date, supplier_id, is_depleted
- [ ] Add unique constraint on batch_code

### Task 2.7: Create Transaction Entity
- [ ] Create Transaction entity with fields: id, type, product_id, batch_id, quantity, unit_id, user_id, reason, timestamp
- [ ] Add foreign keys to Product, Batch, Unit, User
- [ ] Add indexes on timestamp, product_id, type, user_id
- [ ] Add enum for type: check_in, check_out, adjustment, damage, return

### Task 2.8: Create Notification Entity
- [ ] Create Notification entity with fields: id, user_id, type, title, message, is_read, related_product_id, related_batch_id
- [ ] Add timestamp (created_at)
- [ ] Add foreign keys to User, Product, Batch
- [ ] Add indexes on user_id+is_read, created_at
- [ ] Add enum for type: near_expiry, expired, low_stock, check_in, check_out

### Task 2.9: Create Settings Entity
- [ ] Create Settings entity with fields: id, key_name, value, is_encrypted
- [ ] Add timestamp (updated_at)
- [ ] Add unique constraint on key_name

### Task 2.10: Generate and Run Initial Migration
- [ ] Generate migration for all entities
- [ ] Review migration SQL
- [ ] Run migration on development database
- [ ] Create seed data for default admin user and settings

## Phase 3: Authentication Module

### Task 3.1: Set Up Auth Module Structure
- [ ] Generate auth module, controller, service
- [ ] Install dependencies: @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt
- [ ] Create DTOs folder in auth module

### Task 3.2: Implement Local Authentication
- [ ] Create RegisterDto with validation
- [ ] Create LoginDto with validation
- [ ] Implement register method with bcrypt hashing (salt rounds: 10)
- [ ] Implement login method with password verification
- [ ] Generate JWT token with 24-hour expiration

### Task 3.3: Implement JWT Strategy
- [ ] Create JwtStrategy extending PassportStrategy
- [ ] Configure JWT secret from environment
- [ ] Implement validate method to extract user from token
- [ ] Create JwtAuthGuard
- [ ] Test JWT authentication on protected route

### Task 3.4: Implement Google OAuth
- [ ] Install axios for Google token verification
- [ ] Create GoogleAuthDto
- [ ] Implement verifyGoogleToken method
- [ ] Implement googleLogin method (create or find user)
- [ ] Add POST /auth/google endpoint

### Task 3.5: Implement Telegram OAuth
- [ ] Create TelegramAuthDto
- [ ] Implement verifyTelegramAuth with HMAC-SHA256
- [ ] Validate auth_date within 24 hours
- [ ] Implement telegramLogin method (create or find user)
- [ ] Add POST /auth/telegram endpoint

### Task 3.6: Create Auth Endpoints
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] POST /auth/google
- [ ] POST /auth/telegram
- [ ] POST /auth/logout
- [ ] Add Swagger documentation for all endpoints

## Phase 4: Product Management Module

### Task 4.1: Set Up Product Module
- [ ] Generate product module, controller, service
- [ ] Create DTOs: CreateProductDto, UpdateProductDto, FindProductsDto
- [ ] Set up ProductRepository

### Task 4.2: Implement Product CRUD
- [ ] Implement create product with validation
- [ ] Implement update product
- [ ] Implement delete product (cascade to batches)
- [ ] Implement get product by ID
- [ ] Implement get all products with pagination

### Task 4.3: Implement Product Search & Filtering
- [ ] Add search by name (partial match, case-insensitive)
- [ ] Add search by barcode
- [ ] Add filter by category_id
- [ ] Add filter by stock_status
- [ ] Implement pagination with page, limit, total, hasNext

### Task 4.4: Implement Barcode Lookup
- [ ] Create endpoint GET /products/barcode/:barcode
- [ ] Implement barcode lookup with <100ms response time
- [ ] Add support for EAN-13, UPC-A, Code-128, QR formats

### Task 4.5: Set Up Category Module
- [ ] Generate category module, controller, service
- [ ] Create DTOs: CreateCategoryDto, UpdateCategoryDto
- [ ] Implement category CRUD operations
- [ ] Prevent deletion if products are assigned
- [ ] Return categories ordered alphabetically

### Task 4.6: Set Up Unit Module
- [ ] Generate unit module, controller, service
- [ ] Create DTOs: CreateUnitDto, UpdateUnitDto
- [ ] Implement GET /products/:id/units
- [ ] Implement POST /products/:id/units
- [ ] Enforce one base unit per product (conversion_rate = 1.0)
- [ ] Prevent unit deletion if batches exist

### Task 4.7: Implement Unit Converter Service
- [ ] Create UnitConverterService
- [ ] Implement toBaseUnit(quantity, conversionRate)
- [ ] Implement fromBaseUnit(baseQuantity, conversionRate)
- [ ] Implement getConversionRate(unitId)
- [ ] Round results to 2 decimal places

### Task 4.8: Add Swagger Documentation
- [ ] Document all product endpoints
- [ ] Document all category endpoints
- [ ] Document all unit endpoints
- [ ] Add example requests and responses

## Phase 5: Image Storage Integration

### Task 5.1: Set Up MinIO Module
- [ ] Install minio package
- [ ] Create MinIO configuration
- [ ] Create ImageStorageService
- [ ] Initialize MinIO client in onModuleInit

### Task 5.2: Implement Bucket Initialization
- [ ] Check if 'inventory-images' bucket exists
- [ ] Create bucket if not exists
- [ ] Set public read policy for bucket

### Task 5.3: Implement Image Upload
- [ ] Install multer for file upload
- [ ] Validate file format (JPEG, PNG, WebP)
- [ ] Validate file size (max 5MB)
- [ ] Generate unique filename with UUID
- [ ] Upload to MinIO
- [ ] Return public URL

### Task 5.4: Implement Image Deletion
- [ ] Extract filename from URL
- [ ] Delete object from MinIO
- [ ] Handle errors gracefully

### Task 5.5: Add Image Upload Endpoint
- [ ] Create POST /products/:id/image endpoint
- [ ] Use multer interceptor
- [ ] Update product image_url in database
- [ ] Delete old image if exists
- [ ] Return new image URL

## Phase 6: Supplier Management Module

### Task 6.1: Set Up Supplier Module
- [ ] Generate supplier module, controller, service
- [ ] Create DTOs: CreateSupplierDto, UpdateSupplierDto
- [ ] Set up SupplierRepository

### Task 6.2: Implement Supplier CRUD
- [ ] Implement create supplier with validation
- [ ] Validate email format
- [ ] Implement update supplier
- [ ] Implement delete supplier (prevent if batches exist)
- [ ] Implement get supplier by ID
- [ ] Implement get all suppliers with pagination

### Task 6.3: Implement Supplier Inventory History
- [ ] Create GET /suppliers/:id/batches endpoint
- [ ] Include product details in response
- [ ] Add filter by date range
- [ ] Add filter by product_id
- [ ] Calculate total value of inventory from supplier

## Phase 7: Batch Management Module

### Task 7.1: Set Up Batch Module
- [ ] Generate batch module, controller, service
- [ ] Create DTOs: CreateBatchDto, UpdateBatchDto, FindBatchesDto
- [ ] Set up BatchRepository

### Task 7.2: Implement Batch Code Generation
- [ ] Create generateBatchCode method
- [ ] Use format: BATCH-{YYYYMMDD}-{SEQUENCE}
- [ ] Query count of batches on same date
- [ ] Pad sequence to 4 digits
- [ ] Ensure uniqueness

### Task 7.3: Implement Batch Creation
- [ ] Validate expiry_date > import_date
- [ ] Validate unit_cost is positive
- [ ] Convert quantity to base unit
- [ ] Generate batch code
- [ ] Create batch record
- [ ] Return batch with generated code

### Task 7.4: Implement Batch Query
- [ ] Implement get batch by ID
- [ ] Implement get all batches with pagination
- [ ] Add filter by product_id
- [ ] Add filter by supplier_id
- [ ] Add filter by expiry date range
- [ ] Add filter by import date range

### Task 7.5: Implement Batch Quantity Tracking
- [ ] Validate quantity updates are non-negative
- [ ] Store quantities in base unit
- [ ] Mark batch as depleted when quantity = 0
- [ ] Retain depleted batches for history

## Phase 8: Inventory Operations Module

### Task 8.1: Set Up Inventory Module
- [ ] Generate inventory module, controller, service
- [ ] Create CheckInService
- [ ] Create CheckOutService
- [ ] Create DTOs: CheckInDto, CheckOutDto, AdjustmentDto

### Task 8.2: Implement Check-In Service
- [ ] Validate all required fields
- [ ] Convert quantity to base unit
- [ ] Create new batch via BatchService
- [ ] Record check-in transaction
- [ ] Use database transaction for atomicity
- [ ] Rollback on error
- [ ] Return batch and transaction details

### Task 8.3: Implement FIFO Check-Out Algorithm
- [ ] Start database transaction
- [ ] Convert requested quantity to base unit
- [ ] Query non-depleted batches ordered by import_date ASC
- [ ] Calculate total available quantity
- [ ] Throw InsufficientStockException if not enough
- [ ] Deduct from batches sequentially (FIFO)
- [ ] Update batch quantities
- [ ] Mark batches as depleted when quantity = 0
- [ ] Record transactions for each affected batch
- [ ] Commit transaction
- [ ] Return deductions and transactions

### Task 8.4: Implement Inventory Adjustment
- [ ] Validate batch_id, adjustment_quantity, reason
- [ ] Update batch quantity
- [ ] Prevent negative quantities
- [ ] Record adjustment transaction with reason
- [ ] Support both positive and negative adjustments

### Task 8.5: Create Inventory Endpoints
- [ ] POST /inventory/check-in
- [ ] POST /inventory/check-out
- [ ] POST /inventory/adjust
- [ ] Add Swagger documentation

### Task 8.6: Create Custom Exceptions
- [ ] InsufficientStockException with available/requested details
- [ ] BatchDepletedException
- [ ] InvalidUnitException

## Phase 9: Transaction History Module

### Task 9.1: Set Up Transaction Module
- [ ] Generate transaction module, controller, service
- [ ] Create DTOs: FindTransactionsDto
- [ ] Set up TransactionRepository

### Task 9.2: Implement Transaction Recording
- [ ] Create method to record check-in transaction
- [ ] Create method to record check-out transaction
- [ ] Create method to record adjustment transaction
- [ ] Store quantities in base unit
- [ ] Store user_id who performed action

### Task 9.3: Implement Transaction Query
- [ ] Implement get transaction by ID
- [ ] Implement get all transactions with pagination
- [ ] Add filter by date range
- [ ] Add filter by product_id
- [ ] Add filter by type
- [ ] Add filter by user_id
- [ ] Order by timestamp DESC

## Phase 10: Expiry Detection & Scheduling

### Task 10.1: Set Up Scheduler
- [ ] Install @nestjs/schedule
- [ ] Import ScheduleModule in AppModule
- [ ] Create ExpiryMonitorService

### Task 10.2: Implement Expiry Detection Job
- [ ] Add @Cron('0 0 * * *') decorator for daily execution
- [ ] Get near_expiry_threshold from settings
- [ ] Query batches expiring within threshold
- [ ] Query expired batches
- [ ] Create notifications for near-expiry batches
- [ ] Create notifications for expired batches
- [ ] Log execution results
- [ ] Handle errors without crashing

### Task 10.3: Implement Low Stock Detection
- [ ] Create method in DashboardService
- [ ] Calculate total quantity per product
- [ ] Compare against low_stock_threshold
- [ ] Return products below threshold
- [ ] Order by quantity ASC

## Phase 11: Notification Module

### Task 11.1: Set Up Notification Module
- [ ] Generate notification module, controller, service
- [ ] Create DTOs: CreateNotificationDto, FindNotificationsDto
- [ ] Set up NotificationRepository

### Task 11.2: Implement In-App Notifications
- [ ] Implement create notification
- [ ] Implement get notifications with pagination
- [ ] Add filter by type
- [ ] Add filter by is_read
- [ ] Implement mark notification as read
- [ ] Implement mark all as read
- [ ] Implement get unread count

### Task 11.3: Create Notification Endpoints
- [ ] GET /notifications
- [ ] GET /notifications/unread-count
- [ ] PUT /notifications/:id/read
- [ ] PUT /notifications/mark-all-read
- [ ] Add Swagger documentation

## Phase 12: Telegram Bot Integration

### Task 12.1: Set Up Telegram Module
- [ ] Install axios
- [ ] Create TelegramBotService
- [ ] Load bot token and chat ID from config
- [ ] Implement isEnabled check

### Task 12.2: Implement Notification Sending
- [ ] Create sendNotification method
- [ ] Format message with emoji and Markdown
- [ ] Send via Telegram Bot API
- [ ] Log success/failure
- [ ] Don't throw errors (fail gracefully)

### Task 12.3: Integrate with Notification Service
- [ ] Call TelegramBotService from ExpiryMonitor
- [ ] Send notifications for critical events
- [ ] Support enable/disable via settings

## Phase 13: Dashboard Module

### Task 13.1: Set Up Dashboard Module
- [ ] Generate dashboard module, controller, service
- [ ] Create DTOs: DashboardMetricsDto, LowStockDto

### Task 13.2: Implement Metrics Calculation
- [ ] Calculate total_inventory_value (sum of batch quantities × unit costs)
- [ ] Count total_products
- [ ] Count low_stock_count
- [ ] Count near_expiry_count
- [ ] Count expired_count
- [ ] Get 10 most recent transactions
- [ ] Return all metrics in single response
- [ ] Optimize to complete within 500ms

### Task 13.3: Implement Caching
- [ ] Add in-memory cache for metrics
- [ ] Set TTL to 5 minutes
- [ ] Return cached data if valid
- [ ] Recalculate and update cache on expiry

### Task 13.4: Create Dashboard Endpoints
- [ ] GET /dashboard/metrics
- [ ] GET /dashboard/low-stock
- [ ] Add Swagger documentation

## Phase 14: Report Generation Module

### Task 14.1: Set Up Report Module
- [ ] Generate report module, controller, service
- [ ] Install csv-writer or similar package
- [ ] Create DTOs for report filters

### Task 14.2: Implement Inventory Report
- [ ] Query all products with quantities and values
- [ ] Group by category
- [ ] Calculate category totals
- [ ] Include batch-level details
- [ ] Calculate total inventory value
- [ ] Support filter by category, supplier, date range
- [ ] Return JSON format

### Task 14.3: Implement Expiry Report
- [ ] Query batches within date range
- [ ] Group by expiry status (expired, <7 days, <30 days, <90 days)
- [ ] Include product, batch, supplier details
- [ ] Calculate total value by status group
- [ ] Order by expiry_date ASC

### Task 14.4: Implement Supplier Performance Report
- [ ] Query batches grouped by supplier
- [ ] Calculate total quantity received
- [ ] Calculate total value received
- [ ] Calculate average time to depletion
- [ ] Count expired batches per supplier
- [ ] Support filter by date range

### Task 14.5: Implement CSV Export
- [ ] Add format query parameter
- [ ] Convert report data to CSV
- [ ] Include column headers
- [ ] Escape special characters
- [ ] Return as downloadable file with proper content-type

### Task 14.6: Create Report Endpoints
- [ ] GET /reports/inventory
- [ ] GET /reports/expiry
- [ ] GET /reports/supplier-performance
- [ ] Add Swagger documentation

## Phase 15: Settings Module

### Task 15.1: Set Up Settings Module
- [ ] Generate settings module, controller, service
- [ ] Create DTOs: UpdateSettingsDto

### Task 15.2: Implement Settings Management
- [ ] Implement get settings
- [ ] Implement update settings
- [ ] Validate near_expiry_threshold (1-365 days)
- [ ] Validate low_stock_threshold (non-negative)
- [ ] Encrypt sensitive values (telegram_bot_token)
- [ ] Mask sensitive values in responses

### Task 15.3: Implement Encryption
- [ ] Create encryptValue method using AES-256-CBC
- [ ] Create decryptValue method
- [ ] Use ENCRYPTION_KEY from environment

### Task 15.4: Create Settings Endpoints
- [ ] GET /settings
- [ ] PUT /settings
- [ ] Add Swagger documentation

## Phase 16: Error Handling & Validation

### Task 16.1: Set Up Global Exception Filter
- [ ] Create GlobalExceptionFilter
- [ ] Handle HttpException
- [ ] Handle database errors (ER_DUP_ENTRY)
- [ ] Log errors with stack trace
- [ ] Return consistent error format
- [ ] Apply filter globally

### Task 16.2: Configure Validation Pipe
- [ ] Set up global ValidationPipe
- [ ] Enable whitelist
- [ ] Enable forbidNonWhitelisted
- [ ] Enable transform
- [ ] Enable implicit conversion

### Task 16.3: Implement Input Sanitization
- [ ] Create sanitizeString function
- [ ] Create @Sanitize decorator
- [ ] Apply to string DTOs

### Task 16.4: Add DTO Validation
- [ ] Review all DTOs for proper validation decorators
- [ ] Add @IsString, @IsInt, @IsEmail, etc.
- [ ] Add @Min, @Max, @MaxLength constraints
- [ ] Add custom validation messages

## Phase 17: Security Implementation

### Task 17.1: Set Up Rate Limiting
- [ ] Install @nestjs/throttler
- [ ] Configure ThrottlerModule (100 req/min)
- [ ] Apply stricter limits to auth endpoints (10 req/min)
- [ ] Exclude /health from rate limiting

### Task 17.2: Configure CORS
- [ ] Enable CORS with frontend URL
- [ ] Set allowed methods
- [ ] Set allowed headers
- [ ] Enable credentials

### Task 17.3: Set Up Helmet
- [ ] Install helmet
- [ ] Configure Content Security Policy
- [ ] Allow MinIO URL for images

### Task 17.4: Configure Request Limits
- [ ] Set JSON body limit to 10MB
- [ ] Set URL-encoded body limit to 10MB

### Task 17.5: Implement Sensitive Data Protection
- [ ] Add @Exclude decorator to password_hash
- [ ] Add @Exclude decorator to oauth_id
- [ ] Use ClassSerializerInterceptor globally

## Phase 18: Logging & Monitoring

### Task 18.1: Set Up Winston Logger
- [ ] Install nest-winston and winston
- [ ] Configure Winston logger
- [ ] Set up console transport with formatting
- [ ] Configure log levels (ERROR, WARN, INFO, DEBUG)

### Task 18.2: Implement Request Logging
- [ ] Create LoggerMiddleware
- [ ] Log method, URL, status, duration, user, IP
- [ ] Apply middleware globally

### Task 18.3: Add Structured Logging
- [ ] Log inventory operations with context
- [ ] Log authentication attempts
- [ ] Log errors with stack traces
- [ ] Use consistent log format

### Task 18.4: Implement Health Check
- [ ] Install @nestjs/terminus
- [ ] Create HealthController
- [ ] Add database health check
- [ ] Add MinIO health check
- [ ] Return status within 1 second
- [ ] Create GET /health endpoint

## Phase 19: API Documentation

### Task 19.1: Configure Swagger
- [ ] Install @nestjs/swagger
- [ ] Configure DocumentBuilder
- [ ] Add Bearer auth configuration
- [ ] Add API tags for each module
- [ ] Set up /api/docs endpoint

### Task 19.2: Document DTOs
- [ ] Add @ApiProperty to all DTO fields
- [ ] Add descriptions and examples
- [ ] Mark optional fields

### Task 19.3: Document Controllers
- [ ] Add @ApiTags to all controllers
- [ ] Add @ApiOperation to all endpoints
- [ ] Add @ApiResponse for success cases
- [ ] Add @ApiResponse for error cases
- [ ] Add @ApiQuery for query parameters
- [ ] Add @ApiBearerAuth to protected routes

## Phase 20: Testing

### Task 20.1: Set Up Testing Framework
- [ ] Configure Jest
- [ ] Set up test database
- [ ] Create test utilities and helpers

### Task 20.2: Write Unit Tests
- [ ] Test AuthService (login, register, OAuth)
- [ ] Test CheckOutService (FIFO algorithm)
- [ ] Test UnitConverterService
- [ ] Test BatchService (code generation)
- [ ] Test ExpiryMonitorService
- [ ] Aim for 80% coverage

### Task 20.3: Write Integration Tests
- [ ] Test auth endpoints (register, login, OAuth)
- [ ] Test product CRUD
- [ ] Test check-in operation
- [ ] Test check-out operation with FIFO
- [ ] Test expiry detection
- [ ] Test notification creation

### Task 20.4: Write E2E Tests
- [ ] Test complete check-in workflow
- [ ] Test complete check-out workflow
- [ ] Test insufficient stock scenario
- [ ] Test expiry notification workflow

## Phase 21: Deployment Preparation

### Task 21.1: Finalize Docker Configuration
- [ ] Review and optimize Dockerfile
- [ ] Review docker-compose.yml
- [ ] Test full stack deployment locally
- [ ] Verify health checks work

### Task 21.2: Create Nginx Configuration
- [ ] Create nginx.conf
- [ ] Configure reverse proxy to backend
- [ ] Set client_max_body_size to 10M
- [ ] Add proxy headers

### Task 21.3: Environment Configuration
- [ ] Create .env.example with all variables
- [ ] Document required environment variables
- [ ] Create .env.production template

### Task 21.4: Database Migration Strategy
- [ ] Test migration generation
- [ ] Test migration rollback
- [ ] Document migration commands
- [ ] Create seed data script

### Task 21.5: Create Deployment Documentation
- [ ] Write deployment guide
- [ ] Document environment setup
- [ ] Document database initialization
- [ ] Document backup strategy
- [ ] Document monitoring setup

## Phase 22: Final Testing & Launch

### Task 22.1: Performance Testing
- [ ] Test dashboard metrics response time (<500ms)
- [ ] Test barcode lookup response time (<100ms)
- [ ] Test check-out with multiple batches
- [ ] Test concurrent requests

### Task 22.2: Security Audit
- [ ] Review all authentication flows
- [ ] Test rate limiting
- [ ] Test input validation
- [ ] Test SQL injection prevention
- [ ] Review sensitive data handling

### Task 22.3: Integration Testing
- [ ] Test Google OAuth flow end-to-end
- [ ] Test Telegram OAuth flow end-to-end
- [ ] Test MinIO image upload/delete
- [ ] Test Telegram notification sending
- [ ] Test scheduled expiry detection

### Task 22.4: User Acceptance Testing
- [ ] Test all CRUD operations
- [ ] Test check-in/check-out workflows
- [ ] Test report generation
- [ ] Test notification system
- [ ] Verify all 42 requirements are met

### Task 22.5: Production Deployment
- [ ] Deploy to production environment
- [ ] Run database migrations
- [ ] Seed initial data
- [ ] Verify all services are healthy
- [ ] Monitor logs for errors
- [ ] Test critical workflows in production

---

## Summary

**Total Tasks:** 220+
**Estimated Duration:** 10 weeks
**Requirements Covered:** All 42 requirements from requirements.md
**Design Alignment:** Fully aligned with design.md architecture

Each task is designed to be actionable and testable. Tasks should be completed in order within each phase, as later tasks often depend on earlier ones.
