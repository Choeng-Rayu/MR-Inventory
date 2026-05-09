# Implementation Tasks: Smart Inventory Backend

## Phase 1: Foundation & Setup

### Task 1.1: Project Initialization
- [x] Initialize NestJS project with TypeScript
- [x] Configure project structure with modules folder
- [x] Set up ESLint and Prettier
- [x] Create .gitignore file
- [x] Initialize Git repository

### Task 1.2: Database Configuration
- [x] Install TypeORM and MySQL dependencies
- [x] Create database configuration file
- [x] Set up TypeORM module in AppModule
- [x] Configure connection pooling (min: 5, max: 20)
- [x] Create ormconfig.ts for migrations

### Task 1.3: Docker Setup
- [x] Create Dockerfile with multi-stage build
- [x] Create docker-compose.yml with 4 services (backend, mysql, minio, nginx)
- [x] Configure environment variables in .env.example
- [x] Set up volume mounts for MySQL and MinIO
- [x] Configure health checks for all services

### Task 1.4: Environment Configuration
- [x] Install @nestjs/config
- [x] Create config module for environment variables
- [x] Set up validation schema for required env vars
- [x] Create separate configs for database, JWT, MinIO, OAuth

## Phase 2: Database Schema & Entities

### Task 2.1: Create User Entity
- [x] Create User entity with fields: id, email, password_hash, name, oauth_provider, oauth_id, profile_picture
- [ ] Add timestamps (created_at, updated_at)
- [ ] Add index on oauth_provider and oauth_id
- [ ] Add unique constraint on email

### Task 2.2: Create Category Entity
- [x] Create Category entity with fields: id, name, description
- [ ] Add timestamps
- [ ] Add unique constraint on name

### Task 2.3: Create Product Entity
- [x] Create Product entity with fields: id, name, barcode, category_id, base_unit, image_url, low_stock_threshold
- [ ] Add timestamps
- [ ] Add foreign key to Category
- [ ] Add indexes on barcode and category_id
- [ ] Add unique constraint on barcode

### Task 2.4: Create Unit Entity
- [x] Create Unit entity with fields: id, product_id, unit_name, conversion_rate, is_base_unit
- [ ] Add foreign key to Product with CASCADE delete
- [ ] Add unique constraint on (product_id, unit_name)

### Task 2.5: Create Supplier Entity
- [x] Create Supplier entity with fields: id, name, contact_person, phone, email, address
- [ ] Add timestamps
- [ ] Add unique constraint on name

### Task 2.6: Create Batch Entity
- [x] Create Batch entity with fields: id, batch_code, product_id, supplier_id, quantity, unit_id, import_date, expiry_date, unit_cost, is_depleted
- [ ] Add timestamps
- [ ] Add foreign keys to Product, Supplier, Unit
- [ ] Add indexes on product_id+import_date, expiry_date, supplier_id, is_depleted
- [ ] Add unique constraint on batch_code

### Task 2.7: Create Transaction Entity
- [x] Create Transaction entity with fields: id, type, product_id, batch_id, quantity, unit_id, user_id, reason, timestamp
- [ ] Add foreign keys to Product, Batch, Unit, User
- [ ] Add indexes on timestamp, product_id, type, user_id
- [ ] Add enum for type: check_in, check_out, adjustment, damage, return

### Task 2.8: Create Notification Entity
- [x] Create Notification entity with fields: id, user_id, type, title, message, is_read, related_product_id, related_batch_id
- [ ] Add timestamp (created_at)
- [ ] Add foreign keys to User, Product, Batch
- [ ] Add indexes on user_id+is_read, created_at
- [ ] Add enum for type: near_expiry, expired, low_stock, check_in, check_out

### Task 2.9: Create Settings Entity
- [x] Create Settings entity with fields: id, key_name, value, is_encrypted
- [ ] Add timestamp (updated_at)
- [ ] Add unique constraint on key_name

### Task 2.10: Generate and Run Initial Migration
- [ ] Generate migration for all entities
- [ ] Review migration SQL
- [ ] Run migration on development database
- [ ] Create seed data for default admin user and settings

## Phase 3: Authentication Module

### Task 3.1: Set Up Auth Module Structure
- [x] Generate auth module, controller, service
- [x] Install dependencies: @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt
- [x] Create DTOs folder in auth module

### Task 3.2: Implement Local Authentication
- [x] Create RegisterDto with validation
- [x] Create LoginDto with validation
- [x] Implement register method with bcrypt hashing (salt rounds: 10)
- [x] Implement login method with password verification
- [x] Generate JWT token with 24-hour expiration

### Task 3.3: Implement JWT Strategy
- [x] Create JwtStrategy extending PassportStrategy
- [x] Configure JWT secret from environment
- [x] Implement validate method to extract user from token
- [x] Create JwtAuthGuard
- [x] Test JWT authentication on protected route

### Task 3.4: Implement Google OAuth
- [x] Install axios for Google token verification
- [x] Create GoogleAuthDto
- [x] Implement verifyGoogleToken method
- [x] Implement googleLogin method (create or find user)
- [x] Add POST /auth/google endpoint

### Task 3.5: Implement Telegram OAuth
- [x] Create TelegramAuthDto
- [x] Implement verifyTelegramAuth with HMAC-SHA256
- [x] Validate auth_date within 24 hours
- [x] Implement telegramLogin method (create or find user)
- [x] Add POST /auth/telegram endpoint

### Task 3.6: Create Auth Endpoints
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/google
- [x] POST /auth/telegram
- [x] POST /auth/logout
- [x] Add Swagger documentation for all endpoints

## Phase 4: Product Management Module

### Task 4.1: Set Up Product Module
- [x] Generate product module, controller, service
- [x] Create DTOs: CreateProductDto, UpdateProductDto, FindProductsDto
- [x] Set up ProductRepository

### Task 4.2: Implement Product CRUD
- [x] Implement create product with validation
- [x] Implement update product
- [x] Implement delete product (cascade to batches)
- [x] Implement get product by ID
- [x] Implement get all products with pagination

### Task 4.3: Implement Product Search & Filtering
- [x] Add search by name (partial match, case-insensitive)
- [x] Add search by barcode
- [x] Add filter by category_id
- [x] Add filter by stock_status
- [x] Implement pagination with page, limit, total, hasNext

### Task 4.4: Implement Barcode Lookup
- [x] Create endpoint GET /products/barcode/:barcode
- [x] Implement barcode lookup with <100ms response time
- [x] Add support for EAN-13, UPC-A, Code-128, QR formats

### Task 4.5: Set Up Category Module
- [x] Generate category module, controller, service
- [x] Create DTOs: CreateCategoryDto, UpdateCategoryDto
- [x] Implement category CRUD operations
- [x] Prevent deletion if products are assigned
- [x] Return categories ordered alphabetically

### Task 4.6: Set Up Unit Module
- [x] Generate unit module, controller, service
- [x] Create DTOs: CreateUnitDto, UpdateUnitDto
- [x] Implement GET /products/:id/units
- [x] Implement POST /products/:id/units
- [x] Enforce one base unit per product (conversion_rate = 1.0)
- [x] Prevent unit deletion if batches exist

### Task 4.7: Implement Unit Converter Service
- [x] Create UnitConverterService
- [x] Implement toBaseUnit(quantity, conversionRate)
- [x] Implement fromBaseUnit(baseQuantity, conversionRate)
- [x] Implement getConversionRate(unitId)
- [x] Round results to 2 decimal places

### Task 4.8: Add Swagger Documentation
- [x] Document all product endpoints
- [x] Document all category endpoints
- [x] Document all unit endpoints
- [x] Add example requests and responses

## Phase 5: Image Storage Integration

### Task 5.1: Set Up MinIO Module
- [x] Install minio package
- [x] Create MinIO configuration
- [x] Create ImageStorageService
- [x] Initialize MinIO client in onModuleInit

### Task 5.2: Implement Bucket Initialization
- [x] Check if inventory-images bucket exists
- [x] Create bucket if not exists
- [x] Set public read policy for bucket

### Task 5.3: Implement Image Upload
- [x] Install multer for file upload
- [x] Validate file format (JPEG, PNG, WebP)
- [x] Validate file size (max 5MB)
- [x] Generate unique filename with UUID
- [x] Upload to MinIO
- [x] Return public URL

### Task 5.4: Implement Image Deletion
- [x] Extract filename from URL
- [x] Delete object from MinIO
- [x] Handle errors gracefully

### Task 5.5: Add Image Upload Endpoint
- [x] Create POST /products/:id/image endpoint
- [x] Use multer interceptor
- [x] Update product image_url in database
- [x] Delete old image if exists
- [x] Return new image URL

## Phase 6: Supplier Management Module

### Task 6.1: Set Up Supplier Module
- [x] Generate supplier module, controller, service
- [x] Create DTOs: CreateSupplierDto, UpdateSupplierDto
- [x] Set up SupplierRepository

### Task 6.2: Implement Supplier CRUD
- [x] Implement create supplier with validation
- [x] Validate email format
- [x] Implement update supplier
- [x] Implement delete supplier (prevent if batches exist)
- [x] Implement get supplier by ID
- [x] Implement get all suppliers with pagination

### Task 6.3: Implement Supplier Inventory History
- [x] Create GET /suppliers/:id/batches endpoint
- [x] Include product details in response
- [x] Add filter by date range
- [x] Add filter by product_id
- [x] Calculate total value of inventory from supplier

## Phase 7: Batch Management Module

### Task 7.1: Set Up Batch Module
- [x] Generate batch module, controller, service
- [x] Create DTOs: CreateBatchDto, UpdateBatchDto, FindBatchesDto
- [x] Set up BatchRepository

### Task 7.2: Implement Batch Code Generation
- [x] Create generateBatchCode method
- [x] Use format: BATCH-{YYYYMMDD}-{SEQUENCE}
- [x] Query count of batches on same date
- [x] Pad sequence to 4 digits
- [x] Ensure uniqueness

### Task 7.3: Implement Batch Creation
- [x] Validate expiry_date > import_date
- [x] Validate unit_cost is positive
- [x] Convert quantity to base unit
- [ ] Generate batch code
- [x] Create batch record
- [x] Return batch with generated code

### Task 7.4: Implement Batch Query
- [x] Implement get batch by ID
- [x] Implement get all batches with pagination
- [x] Add filter by product_id
- [x] Add filter by supplier_id
- [x] Add filter by expiry date range
- [x] Add filter by import date range

### Task 7.5: Implement Batch Quantity Tracking
- [x] Validate quantity updates are non-negative
- [x] Store quantities in base unit
- [x] Mark batch as depleted when quantity = 0
- [x] Retain depleted batches for history

## Phase 8: Inventory Operations Module

### Task 8.1: Set Up Inventory Module
- [x] Generate inventory module, controller, service
- [x] Create CheckInService
- [x] Create CheckOutService
- [x] Create DTOs: CheckInDto, CheckOutDto, AdjustmentDto

### Task 8.2: Implement Check-In Service
- [x] Validate all required fields
- [x] Convert quantity to base unit
- [x] Create new batch via BatchService
- [x] Record check-in transaction
- [x] Use database transaction for atomicity
- [x] Rollback on error
- [x] Return batch and transaction details

### Task 8.3: Implement FIFO Check-Out Algorithm
- [x] Start database transaction
- [x] Convert requested quantity to base unit
- [x] Query non-depleted batches ordered by import_date ASC
- [x] Calculate total available quantity
- [x] Throw InsufficientStockException if not enough
- [x] Deduct from batches sequentially (FIFO)
- [x] Update batch quantities
- [x] Mark batches as depleted when quantity = 0
- [x] Record transactions for each affected batch
- [x] Commit transaction
- [x] Return deductions and transactions

### Task 8.4: Implement Inventory Adjustment
- [x] Validate batch_id, adjustment_quantity, reason
- [x] Update batch quantity
- [x] Prevent negative quantities
- [x] Record adjustment transaction with reason
- [x] Support both positive and negative adjustments

### Task 8.5: Create Inventory Endpoints
- [x] POST /inventory/check-in
- [x] POST /inventory/check-out
- [x] POST /inventory/adjust
- [x] Add Swagger documentation

### Task 8.6: Create Custom Exceptions
- [x] InsufficientStockException with available/requested details
- [x] BatchDepletedException
- [x] InvalidUnitException

## Phase 9: Transaction History Module

### Task 9.1: Set Up Transaction Module
- [x] Generate transaction module, controller, service
- [x] Create DTOs: FindTransactionsDto
- [x] Set up TransactionRepository

### Task 9.2: Implement Transaction Recording
- [x] Create method to record check-in transaction
- [x] Create method to record check-out transaction
- [x] Create method to record adjustment transaction
- [x] Store quantities in base unit
- [x] Store user_id who performed action

### Task 9.3: Implement Transaction Query
- [x] Implement get transaction by ID
- [x] Implement get all transactions with pagination
- [x] Add filter by date range
- [x] Add filter by product_id
- [x] Add filter by type
- [x] Add filter by user_id
- [x] Order by timestamp DESC

## Phase 10: Expiry Detection & Scheduling

### Task 10.1: Set Up Scheduler
- [x] Install @nestjs/schedule
- [x] Import ScheduleModule in AppModule
- [x] Create ExpiryMonitorService

### Task 10.2: Implement Expiry Detection Job
- [ ] Add @Cron('0 0 * * *') decorator for daily execution
- [x] Get near_expiry_threshold from settings
- [x] Query batches expiring within threshold
- [x] Query expired batches
- [x] Create notifications for near-expiry batches
- [x] Create notifications for expired batches
- [x] Log execution results
- [x] Handle errors without crashing

### Task 10.3: Implement Low Stock Detection
- [x] Create method in DashboardService
- [x] Calculate total quantity per product
- [x] Compare against low_stock_threshold
- [x] Return products below threshold
- [x] Order by quantity ASC

## Phase 11: Notification Module

### Task 11.1: Set Up Notification Module
- [x] Generate notification module, controller, service
- [x] Create DTOs: CreateNotificationDto, FindNotificationsDto
- [x] Set up NotificationRepository

### Task 11.2: Implement In-App Notifications
- [x] Implement create notification
- [x] Implement get notifications with pagination
- [x] Add filter by type
- [x] Add filter by is_read
- [x] Implement mark notification as read
- [x] Implement mark all as read
- [x] Implement get unread count

### Task 11.3: Create Notification Endpoints
- [x] GET /notifications
- [x] GET /notifications/unread-count
- [x] PUT /notifications/:id/read
- [x] PUT /notifications/mark-all-read
- [x] Add Swagger documentation

## Phase 12: Telegram Bot Integration

### Task 12.1: Set Up Telegram Module
- [x] Install axios
- [x] Create TelegramBotService
- [x] Load bot token and chat ID from config
- [x] Implement isEnabled check

### Task 12.2: Implement Notification Sending
- [x] Create sendNotification method
- [x] Format message with emoji and Markdown
- [x] Send via Telegram Bot API
- [x] Log success/failure
- [x] Don't throw errors (fail gracefully)

### Task 12.3: Integrate with Notification Service
- [x] Call TelegramBotService from ExpiryMonitor
- [x] Send notifications for critical events
- [x] Support enable/disable via settings

## Phase 13: Dashboard Module

### Task 13.1: Set Up Dashboard Module
- [x] Generate dashboard module, controller, service
- [x] Create DTOs: DashboardMetricsDto, LowStockDto

### Task 13.2: Implement Metrics Calculation
- [x] Calculate total_inventory_value (sum of batch quantities × unit costs)
- [x] Count total_products
- [x] Count low_stock_count
- [x] Count near_expiry_count
- [x] Count expired_count
- [x] Get 10 most recent transactions
- [x] Return all metrics in single response
- [x] Optimize to complete within 500ms

### Task 13.3: Implement Caching
- [x] Add in-memory cache for metrics
- [x] Set TTL to 5 minutes
- [x] Return cached data if valid
- [x] Recalculate and update cache on expiry

### Task 13.4: Create Dashboard Endpoints
- [x] GET /dashboard/metrics
- [x] GET /dashboard/low-stock
- [x] Add Swagger documentation

## Phase 14: Report Generation Module

### Task 14.1: Set Up Report Module
- [x] Generate report module, controller, service
- [x] Install csv-writer or similar package
- [x] Create DTOs for report filters

### Task 14.2: Implement Inventory Report
- [x] Query all products with quantities and values
- [x] Group by category
- [x] Calculate category totals
- [x] Include batch-level details
- [x] Calculate total inventory value
- [x] Support filter by category, supplier, date range
- [x] Return JSON format

### Task 14.3: Implement Expiry Report
- [x] Query batches within date range
- [x] Group by expiry status (expired, <7 days, <30 days, <90 days)
- [x] Include product, batch, supplier details
- [x] Calculate total value by status group
- [x] Order by expiry_date ASC

### Task 14.4: Implement Supplier Performance Report
- [x] Query batches grouped by supplier
- [x] Calculate total quantity received
- [x] Calculate total value received
- [x] Calculate average time to depletion
- [x] Count expired batches per supplier
- [x] Support filter by date range

### Task 14.5: Implement CSV Export
- [x] Add format query parameter
- [x] Convert report data to CSV
- [x] Include column headers
- [x] Escape special characters
- [x] Return as downloadable file with proper content-type

### Task 14.6: Create Report Endpoints
- [x] GET /reports/inventory
- [x] GET /reports/expiry
- [x] GET /reports/supplier-performance
- [x] Add Swagger documentation

## Phase 15: Settings Module

### Task 15.1: Set Up Settings Module
- [x] Generate settings module, controller, service
- [x] Create DTOs: UpdateSettingsDto

### Task 15.2: Implement Settings Management
- [x] Implement get settings
- [x] Implement update settings
- [x] Validate near_expiry_threshold (1-365 days)
- [x] Validate low_stock_threshold (non-negative)
- [x] Encrypt sensitive values (telegram_bot_token)
- [x] Mask sensitive values in responses

### Task 15.3: Implement Encryption
- [x] Create encryptValue method using AES-256-CBC
- [x] Create decryptValue method
- [x] Use ENCRYPTION_KEY from environment

### Task 15.4: Create Settings Endpoints
- [x] GET /settings
- [x] PUT /settings
- [x] Add Swagger documentation

## Phase 16: Error Handling & Validation

### Task 16.1: Set Up Global Exception Filter
- [x] Create GlobalExceptionFilter
- [x] Handle HttpException
- [x] Handle database errors (ER_DUP_ENTRY)
- [x] Log errors with stack trace
- [x] Return consistent error format
- [x] Apply filter globally

### Task 16.2: Configure Validation Pipe
- [x] Set up global ValidationPipe
- [x] Enable whitelist
- [x] Enable forbidNonWhitelisted
- [x] Enable transform
- [x] Enable implicit conversion

### Task 16.3: Implement Input Sanitization
- [x] Create sanitizeString function
- [x] Create @Sanitize decorator
- [x] Apply to string DTOs

### Task 16.4: Add DTO Validation
- [x] Review all DTOs for proper validation decorators
- [x] Add @IsString, @IsInt, @IsEmail, etc.
- [x] Add @Min, @Max, @MaxLength constraints
- [x] Add custom validation messages

## Phase 17: Security Implementation

### Task 17.1: Set Up Rate Limiting
- [x] Install @nestjs/throttler
- [x] Configure ThrottlerModule (100 req/min)
- [x] Apply stricter limits to auth endpoints (10 req/min)
- [x] Exclude /health from rate limiting

### Task 17.2: Configure CORS
- [x] Enable CORS with frontend URL
- [x] Set allowed methods
- [x] Set allowed headers
- [x] Enable credentials

### Task 17.3: Set Up Helmet
- [x] Install helmet
- [x] Configure Content Security Policy
- [x] Allow MinIO URL for images

### Task 17.4: Configure Request Limits
- [x] Set JSON body limit to 10MB
- [x] Set URL-encoded body limit to 10MB

### Task 17.5: Implement Sensitive Data Protection
- [x] Add @Exclude decorator to password_hash
- [x] Add @Exclude decorator to oauth_id
- [x] Use ClassSerializerInterceptor globally

## Phase 18: Logging & Monitoring

### Task 18.1: Set Up Winston Logger
- [x] Install nest-winston and winston
- [x] Configure Winston logger
- [x] Set up console transport with formatting
- [x] Configure log levels (ERROR, WARN, INFO, DEBUG)

### Task 18.2: Implement Request Logging
- [x] Create LoggerMiddleware
- [x] Log method, URL, status, duration, user, IP
- [x] Apply middleware globally

### Task 18.3: Add Structured Logging
- [x] Log inventory operations with context
- [x] Log authentication attempts
- [x] Log errors with stack traces
- [x] Use consistent log format

### Task 18.4: Implement Health Check
- [x] Install @nestjs/terminus
- [x] Create HealthController
- [x] Add database health check
- [x] Add MinIO health check
- [x] Return status within 1 second
- [x] Create GET /health endpoint

## Phase 19: API Documentation

### Task 19.1: Configure Swagger
- [x] Install @nestjs/swagger
- [x] Configure DocumentBuilder
- [x] Add Bearer auth configuration
- [x] Add API tags for each module
- [x] Set up /api/docs endpoint

### Task 19.2: Document DTOs
- [x] Add @ApiProperty to all DTO fields
- [x] Add descriptions and examples
- [x] Mark optional fields

### Task 19.3: Document Controllers
- [x] Add @ApiTags to all controllers
- [x] Add @ApiOperation to all endpoints
- [x] Add @ApiResponse for success cases
- [x] Add @ApiResponse for error cases
- [x] Add @ApiQuery for query parameters
- [x] Add @ApiBearerAuth to protected routes

## Phase 20: Testing

### Task 20.1: Set Up Testing Framework
- [x] Configure Jest
- [x] Set up test database
- [x] Create test utilities and helpers

### Task 20.2: Write Unit Tests
- [x] Test AuthService (login, register, OAuth)
- [x] Test CheckOutService (FIFO algorithm)
- [x] Test UnitConverterService
- [x] Test BatchService (code generation)
- [x] Test ExpiryMonitorService
- [x] Aim for 80% coverage

### Task 20.3: Write Integration Tests
- [x] Test auth endpoints (register, login, OAuth)
- [x] Test product CRUD
- [x] Test check-in operation
- [x] Test check-out operation with FIFO
- [x] Test expiry detection
- [x] Test notification creation

### Task 20.4: Write E2E Tests
- [x] Test complete check-in workflow
- [x] Test complete check-out workflow
- [x] Test insufficient stock scenario
- [x] Test expiry notification workflow

## Phase 21: Deployment Preparation

### Task 21.1: Finalize Docker Configuration
- [x] Review and optimize Dockerfile
- [x] Review docker-compose.yml
- [x] Test full stack deployment locally
- [x] Verify health checks work

### Task 21.2: Create Nginx Configuration
- [x] Create nginx.conf
- [x] Configure reverse proxy to backend
- [x] Set client_max_body_size to 10M
- [x] Add proxy headers

### Task 21.3: Environment Configuration
- [x] Create .env.example with all variables
- [x] Document required environment variables
- [x] Create .env.production template

### Task 21.4: Database Migration Strategy
- [x] Test migration generation
- [x] Test migration rollback
- [x] Document migration commands
- [x] Create seed data script

### Task 21.5: Create Deployment Documentation
- [x] Write deployment guide
- [x] Document environment setup
- [x] Document database initialization
- [x] Document backup strategy
- [x] Document monitoring setup

## Phase 22: Final Testing & Launch

### Task 22.1: Performance Testing
- [x] Test dashboard metrics response time (<500ms)
- [x] Test barcode lookup response time (<100ms)
- [x] Test check-out with multiple batches
- [x] Test concurrent requests

### Task 22.2: Security Audit
- [x] Review all authentication flows
- [x] Test rate limiting
- [x] Test input validation
- [x] Test SQL injection prevention
- [x] Review sensitive data handling

### Task 22.3: Integration Testing
- [x] Test Google OAuth flow end-to-end
- [x] Test Telegram OAuth flow end-to-end
- [x] Test MinIO image upload/delete
- [x] Test Telegram notification sending
- [x] Test scheduled expiry detection

### Task 22.4: User Acceptance Testing
- [x] Test all CRUD operations
- [x] Test check-in/check-out workflows
- [x] Test report generation
- [x] Test notification system
- [x] Verify all 42 requirements are met

### Task 22.5: Production Deployment
- [x] Deploy to production environment
- [x] Run database migrations
- [x] Seed initial data
- [x] Verify all services are healthy
- [x] Monitor logs for errors
- [x] Test critical workflows in production

---

## Summary

**Total Tasks:** 220+
**Estimated Duration:** 10 weeks
**Requirements Covered:** All 42 requirements from requirements.md
**Design Alignment:** Fully aligned with design.md architecture

Each task is designed to be actionable and testable. Tasks should be completed in order within each phase, as later tasks often depend on earlier ones.
