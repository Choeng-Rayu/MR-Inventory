# Smart Inventory Management System

A comprehensive batch-level inventory tracking system with FIFO management, barcode scanning, automated expiry detection, and multi-channel notifications. Built for retail environments such as mini marts, coffee shops, pharmacies, restaurants, warehouses, and schools.

## 🎯 Project Overview

The Smart Inventory Management System provides real-time inventory tracking at the batch/lot level, enabling businesses to:
- Track products with multiple batches from different suppliers
- Manage inventory with unique import dates, expiry dates, and costs per batch
- Automatically apply FIFO (First-In-First-Out) logic during stock deduction
- Monitor expiry dates with automated alerts
- Scan barcodes for quick product identification
- Generate comprehensive inventory, expiry, and supplier reports
- Receive notifications via in-app and Telegram

## 🏗️ Architecture

### Technology Stack

**Backend:**
- NestJS (Node.js/TypeScript)
- MySQL 8.0
- MinIO (S3-compatible object storage)
- JWT + OAuth (Google, Telegram)
- Docker + Docker Compose

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Query (TanStack Query)
- Zustand
- React Hook Form + Zod

**Infrastructure:**
- Nginx (Reverse Proxy)
- Docker (Single-host deployment)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SINGLE DOCKER HOST                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Nginx (Port 80/443)                                   │ │
│  │  - Serves React Frontend                               │ │
│  │  - Reverse Proxy to Backend API                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Backend (NestJS) - Port 3000                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│  ┌──────────────────┐          ┌──────────────────┐        │
│  │  MySQL Database  │          │  MinIO Storage   │        │
│  └──────────────────┘          └──────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### 📦 Batch-Level Inventory Tracking
- Track inventory at the batch/lot level with unique batch codes
- Associate each batch with supplier, import date, expiry date, and unit cost
- Automatic batch code generation (BATCH-YYYYMMDD-NNNN)
- Support for multiple units per product with conversion rates

### 🔄 FIFO Inventory Management
- Automatic First-In-First-Out deduction during check-out
- Deduct from oldest batches first to minimize expiry waste
- Display which batches are affected by each check-out operation
- Transaction history for complete audit trail

### 📱 Barcode Scanning
- Camera-based barcode scanning for quick product lookup
- Support for multiple formats (EAN-13, UPC-A, Code-128, QR)
- Manual barcode entry fallback
- Mobile-optimized scanning interface

### 🔐 Multi-Channel Authentication
- Email/Password authentication with bcrypt hashing
- Google OAuth integration
- Telegram OAuth integration
- JWT tokens with 24-hour expiration

### ⏰ Automated Expiry Monitoring
- Daily scheduled job to detect near-expiry and expired batches
- Configurable near-expiry threshold (default: 30 days)
- Visual indicators for urgency levels
- Automatic notification generation

### 🔔 Multi-Channel Notifications
- In-app notifications with unread count badge
- Telegram bot integration for external alerts
- Notification types: near expiry, expired, low stock, check-in, check-out
- Mark as read/unread functionality

### 📊 Comprehensive Reporting
- **Inventory Summary Report**: Current stock levels by category
- **Expiry Report**: Batches expiring within specified timeframe
- **Supplier Performance Report**: Purchases and metrics by supplier
- **Stock Movement Report**: Check-in/check-out activity over time
- Export to CSV format

### 📈 Real-Time Dashboard
- Total inventory value
- Total products count
- Low stock alerts
- Near-expiry and expired batch counts
- Recent activity feed
- Visual charts and analytics

### 🎨 Mobile-Responsive Design
- Works on screens 320px and wider
- Touch-friendly interface (44x44px minimum touch targets)
- Responsive navigation (desktop sidebar, mobile hamburger)
- Optimized for retail environments

### ♿ Accessibility Compliant
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- Proper color contrast ratios (4.5:1)

## 📋 Core Modules

### Backend Modules
1. **Auth Module**: JWT + OAuth authentication
2. **Product Module**: Product catalog management
3. **Category Module**: Product categorization
4. **Supplier Module**: Supplier information management
5. **Batch Module**: Batch/lot tracking
6. **Unit Converter Module**: Multi-unit support with conversion
7. **Check-In Module**: Inventory receiving
8. **Check-Out Module**: FIFO inventory deduction
9. **Transaction Logger Module**: Complete audit trail
10. **Notification Module**: In-app and Telegram notifications
11. **Expiry Monitor Module**: Scheduled expiry detection
12. **Dashboard Module**: Real-time metrics
13. **Report Generator Module**: Inventory reports

### Frontend Pages
1. **Login Page**: Email/Password, Google, Telegram authentication
2. **Dashboard**: Metrics, charts, activity feed, alerts
3. **Products**: List, create, edit, delete, search, filter
4. **Suppliers**: CRUD operations, inventory history
5. **Check-In**: Barcode scanning, batch creation
6. **Check-Out**: Barcode scanning, FIFO deduction
7. **Inventory**: Batch list, adjustments
8. **Transactions**: Complete history with filters
9. **Expiry Alerts**: Near-expiry and expired batches
10. **Reports**: Inventory, expiry, supplier, stock movement
11. **Settings**: Thresholds, Telegram integration
12. **Profile**: User information management

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts and OAuth information
- **categories**: Product categories
- **products**: Product catalog (name, SKU, barcode, base unit)
- **units**: Unit configurations with conversion rates
- **suppliers**: Supplier information
- **batches**: Inventory batches (quantity in base unit)
- **transactions**: All inventory movements
- **notifications**: In-app notifications
- **settings**: System configuration

### Key Relationships
- Products have multiple units with conversion rates
- Products have multiple batches from different suppliers
- Batches have multiple transactions
- All quantities stored in base unit for consistency

## 🔌 API Endpoints (48 Total)

### Authentication (6)
- POST /auth/register, /auth/login, /auth/google, /auth/telegram, /auth/logout
- GET /auth/profile

### Products (9)
- GET /products, /products/:id, /products/barcode/:barcode, /products/:id/units
- POST /products, /products/:id/image, /products/:id/units
- PUT /products/:id
- DELETE /products/:id

### Categories (4)
- GET /categories
- POST /categories
- PUT /categories/:id
- DELETE /categories/:id

### Suppliers (6)
- GET /suppliers, /suppliers/:id, /suppliers/:id/inventory
- POST /suppliers
- PUT /suppliers/:id
- DELETE /suppliers/:id

### Batches (3)
- GET /batches, /batches/:id
- POST /batches

### Inventory Operations (3)
- POST /inventory/check-in, /inventory/check-out, /inventory/adjust

### Transactions (2)
- GET /transactions, /transactions/:id

### Dashboard (2)
- GET /dashboard/metrics, /dashboard/low-stock

### Reports (3)
- GET /reports/inventory, /reports/expiry, /reports/supplier-performance

### Notifications (4)
- GET /notifications, /notifications/unread-count
- PUT /notifications/:id/read, /notifications/mark-all-read

### Settings (2)
- GET /settings
- PUT /settings

### Health (1)
- GET /health

## 🚀 Getting Started

### Prerequisites
- Docker Engine 20.10+
- Docker Compose 2.0+
- Minimum 4GB RAM, 20GB disk space
- Ports 80 and 443 available

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MR-Inventory
```

2. **Configure environment variables**
```bash
cp .env.example .env
nano .env  # Edit with your values
```

Required environment variables:
```env
# Database
MYSQL_ROOT_PASSWORD=<secure_password>
DB_PASSWORD=<secure_password>

# JWT
JWT_SECRET=<secure_random_string_min_32_chars>

# MinIO
MINIO_ACCESS_KEY=<access_key>
MINIO_SECRET_KEY=<secret_key_min_8_chars>

# OAuth
GOOGLE_CLIENT_ID=<google_client_id>
TELEGRAM_BOT_TOKEN=<telegram_bot_token>
```

3. **Build and start all services**
```bash
docker-compose up -d --build
```

4. **Verify deployment**
```bash
# Check container status
docker-compose ps

# Check backend health
curl http://localhost/health

# View logs
docker-compose logs -f
```

5. **Access the application**
- Frontend: http://localhost
- API Documentation: http://localhost/api/docs
- Health Check: http://localhost/health

### Default Credentials
- Email: admin@inventory.local
- Password: (set during first run or in seed data)

## 📁 Project Structure

```
MR-Inventory/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── products/       # Product management
│   │   ├── suppliers/      # Supplier management
│   │   ├── inventory/      # Check-in/check-out/batches
│   │   ├── notifications/  # Notification system
│   │   ├── reports/        # Report generation
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # State management
│   │   └── ...
│   ├── Dockerfile
│   └── package.json
├── nginx/                  # Nginx configuration
│   └── nginx.conf
├── .kiro/                  # Project specifications
│   └── specs/
│       ├── smart-inventory-backend/
│       │   ├── requirements.md
│       │   └── design.md
│       ├── smart-inventory-frontend/
│       │   ├── requirements.md
│       │   └── design.md
│       └── ALIGNMENT_VERIFICATION.md
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run start:dev  # Development mode with hot reload
npm run test       # Run tests
npm run build      # Production build
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev        # Development server (port 5173)
npm run test       # Run tests
npm run build      # Production build
```

### Database Migrations
```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 📊 Key Business Logic

### FIFO Algorithm
1. Convert requested quantity to base unit
2. Query non-depleted batches ordered by import_date ASC
3. Deduct from oldest batch first
4. If batch insufficient, move to next batch
5. Mark batches as depleted when quantity reaches zero
6. Record transaction for each affected batch

### Unit Conversion
- All batch quantities stored in base unit
- Frontend sends unit_id with quantity
- Backend converts to base unit using conversion rate
- Transactions record both unit_id (for audit) and quantity (in base unit)

### Batch Code Generation
- Format: BATCH-YYYYMMDD-NNNN
- YYYYMMDD: Import date
- NNNN: Sequential number (padded to 4 digits)

### Expiry Detection
- Runs daily at 00:00 UTC
- Queries batches within near_expiry_threshold
- Creates notifications for near-expiry and expired batches
- Sends Telegram notifications if enabled

## 🧪 Testing

### Backend Tests
```bash
npm run test              # Unit tests
npm run test:e2e          # E2E tests
npm run test:cov          # Coverage report
```

### Frontend Tests
```bash
npm run test              # Vitest unit tests
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report
```

## 📦 Deployment

### Production Deployment
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Backup database
docker-compose exec mysql mysqldump -u root -p inventory > backup.sql

# Restore database
docker-compose exec -T mysql mysql -u root -p inventory < backup.sql
```

### Scaling Considerations
- Current design: Single Docker host (suitable for small to medium deployments)
- For high availability: Add load balancer, database replication, Redis cache
- For horizontal scaling: Separate frontend/backend/database to different hosts

## 🔒 Security Features

- Password hashing with bcrypt (cost factor 10)
- JWT tokens with 24-hour expiration
- OAuth integration (Google, Telegram)
- SQL injection prevention (TypeORM parameterized queries)
- XSS prevention (React built-in escaping)
- HTTPS enforcement (Nginx)
- Rate limiting (100 req/min for auth, 1000 req/min for API)
- Input validation (class-validator, Zod)
- File upload restrictions (5MB max, image formats only)

## 📝 Documentation

- **Requirements**: `.kiro/specs/smart-inventory-backend/requirements.md`
- **Backend Design**: `.kiro/specs/smart-inventory-backend/design.md`
- **Frontend Design**: `.kiro/specs/smart-inventory-frontend/design.md`
- **Alignment Verification**: `.kiro/specs/ALIGNMENT_VERIFICATION.md`
- **API Documentation**: http://localhost/api/docs (Swagger UI)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Specify your license here]

## 👥 Authors

[Your name/team]

## 🙏 Acknowledgments

- NestJS framework
- React ecosystem
- Tailwind CSS
- Docker community

## 📞 Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Email: [support-email]
- Documentation: [docs-url]

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-09  
**Status:** Ready for Implementation
