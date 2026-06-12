# Toxic Society Backend API

Custom Python backend for the Toxic Society e-commerce platform, replacing Supabase to optimize costs and provide full control.

## 🏗️ Architecture

- **Framework**: FastAPI (async, type-safe)
- **Database**: MySQL 8.0+ (XAMPP for local, cPanel for production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT + Google OAuth
- **Payment**: Paystack integration
- **Hosting**: Docker-ready for Railway, Render, Fly.io, AWS, or cPanel

## 📋 Features

- ✅ User authentication (email/password + Google OAuth)
- ✅ Product management (CRUD)
- ✅ Shopping cart & orders
- ✅ Payment verification (Paystack)
- ✅ Product reviews & ratings
- ✅ Discount codes
- ✅ Product drops (timed releases)
- ✅ Admin dashboard API
- ✅ Role-based access control (RBAC)
- ✅ Database migrations (Alembic)
- ✅ OWASP security hardening

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- MySQL 8.0+ (via XAMPP, Docker, or local install)
- Optional: Docker & Docker Compose

### Local Development with XAMPP

#### 1. Install XAMPP

Download and install XAMPP from [apachefriends.org](https://www.apachefriends.org/)

#### 2. Start XAMPP Services

- Open XAMPP Control Panel
- Click **"Start"** for Apache (optional, for frontend testing)
- Click **"Start"** for MySQL

XAMPP MySQL runs on `localhost:3306` by default

#### 3. Create Database

**Option A: Using phpMyAdmin (GUI)**

- Go to `http://localhost/phpmyadmin`
- Click **"New"** database
- Database name: `toxic_society`
- Create database

**Option B: Using Command Line**

```bash
mysql -u root -p  # Press Enter if no password set
# Or with password
mysql -u root -p<password>

# Then run:
CREATE DATABASE toxic_society;
EXIT;
```

#### 4. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

#### 5. Update .env for XAMPP

Edit `backend/.env`:

```env
# XAMPP MySQL connection
DATABASE_URL=mysql+pymysql://root:@localhost:3306/toxic_society

# Or if you set a MySQL root password
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/toxic_society

# Your other keys remain the same
SECRET_KEY=your-secret-key-here
GOOGLE_CLIENT_ID=...
PAYSTACK_SECRET_KEY=...
```

#### 6. Run Migrations

```bash
# Create database tables
alembic upgrade head

# You should see: "INFO [alembic.runtime.migration] Done."
```

#### 7. Start Backend Server

```bash
# Development mode with auto-reload
uvicorn main:app --reload

# Or production mode
uvicorn main:app --host 0.0.0.0 --port 8000
```

Access:

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

### Local Development with Docker

If you prefer Docker (MySQL runs in container):

```bash
# Start MySQL + Backend with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

---

### Deploying to cPanel (Production)

When you're ready to go live:

#### 1. Export Local Database

```bash
# From your local machine
mysqldump -u root -p toxic_society > backup.sql

# Or using phpMyAdmin
# Go to http://localhost/phpmyadmin
# Select toxic_society database
# Export > Format: SQL > Go
```

#### 2. Create cPanel Database

In your hosting control panel:

- Go to **Databases** → **MySQL Databases**
- Create new database: `username_toxic_society`
- Create new user: `username_ts_user` with strong password
- Add user to database with **All Privileges**

#### 3. Import Database

In **phpMyAdmin** on cPanel:

- Select your new database
- Go to **Import** tab
- Upload `backup.sql`
- Execute

#### 4. Update Backend Credentials

Update `.env` with cPanel credentials:

```env
DATABASE_URL=mysql+pymysql://username_ts_user:password@localhost:3306/username_toxic_society
```

#### 5. Deploy Backend

Use your cPanel hosting's deployment method (Git, FTP, SSH, etc.)

---

## 📁 Project Structure

```
backend/
├── app/
│   ├── models/          # SQLAlchemy ORM models (MySQL compatible)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Authentication, error handling
│   ├── utils/           # Validators, security, constants
│   ├── config.py        # Settings management
│   └── database.py      # Database connection
├── alembic/             # Database migrations
│   ├── versions/        # Migration files
│   └── env.py          # Alembic configuration
├── main.py             # FastAPI application entry point
├── requirements.txt    # Python dependencies
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
└── README.md           # This file
```

## 🔌 API Endpoints

### Authentication

```
POST   /auth/register                # Register new user
POST   /auth/login                   # Login with credentials
GET    /auth/google                  # Google OAuth redirect
GET    /auth/google/callback         # Google OAuth callback
```

### Products

```
GET    /api/v1/products              # List products (with filters)
GET    /api/v1/products/{id}         # Get product details
POST   /api/v1/products              # Create product (admin)
PATCH  /api/v1/products/{id}         # Update product (admin)
DELETE /api/v1/products/{id}         # Delete product (admin)
```

### Orders

```
POST   /api/v1/orders                # Create order
GET    /api/v1/orders/{id}           # Get order details
GET    /api/v1/orders/user/{user_id} # Get user orders
PATCH  /api/v1/orders/{id}           # Update order status (admin)
```

### Reviews

```
GET    /api/v1/reviews               # List reviews
GET    /api/v1/reviews/{id}          # Get review
POST   /api/v1/reviews               # Create review (authenticated)
PATCH  /api/v1/reviews/{id}          # Update review
DELETE /api/v1/reviews/{id}          # Delete review
```

### Payments

```
POST   /api/v1/payments/verify       # Verify Paystack payment
```

### Admin

```
GET    /api/admin/dashboard          # Dashboard stats
GET    /api/admin/orders             # All orders
GET    /api/admin/products           # All products
POST   /api/admin/users              # Create admin user
```

## 🔐 Authentication

### JWT Flow

1. User logs in or registers
2. Backend generates JWT token
3. Frontend stores token in localStorage
4. Include token in all authenticated requests:

```
Authorization: Bearer <token>
```

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Frontend redirects to `/auth/google`
3. Backend redirects to Google OAuth
4. Google redirects back to `/auth/google/callback?code=...&state=...`
5. Backend exchanges code for user info
6. Backend returns JWT token
7. Frontend stores token and redirects to home

## 💳 Payment Processing

### Paystack Integration

1. Frontend collects payment details
2. Frontend initializes Paystack payment popup
3. User completes payment
4. Paystack returns payment reference
5. Frontend sends reference to `/api/v1/payments/verify`
6. Backend verifies with Paystack (SECRET_KEY never exposed to client)
7. Backend creates order and returns order ID

**Security**:

- SECRET_KEY stored only on server (Vercel env vars)
- Reference validated (OWASP A03 injection prevention)
- Amount verified against Paystack's server response (OWASP A04 price tampering)

## 🗄️ Database

### Tables

- `users` - User accounts
- `customer_profiles` - Customer info
- `products` - Product catalog
- `product_colors` - Color variants
- `product_inventory` - Stock by size/color
- `orders` - Purchase orders
- `reviews` - Product reviews
- `drops` - Timed releases
- `discounts` - Promo codes
- `discount_usage` - Discount usage tracking

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "add new column"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_products.py -v

# Run with coverage
pytest --cov=app tests/
```

## 📦 Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect GitHub repo to Railway
3. Add environment variables in Railway dashboard
4. Railway auto-deploys on push
5. PostgreSQL add-on available

```bash
# Railway CLI
railway login
railway init
railway up
```

### Render

1. Connect GitHub repo
2. Create Web Service
3. Add PostgreSQL add-on
4. Add environment variables
5. Deploy

### Fly.io

```bash
# Install Fly CLI
flyctl auth login
flyctl launch

# Deploy
flyctl deploy
```

### AWS (ECS + RDS)

1. Create RDS PostgreSQL instance
2. Create ECS cluster
3. Push Docker image to ECR
4. Create ECS service
5. Configure load balancer

## 🔧 Configuration

### Environment Variables

See `.env.example` for all options.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key (keep secret!)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `PAYSTACK_SECRET_KEY` - Payment processing key
- `FRONTEND_URL` - Frontend domain for CORS

## 📊 Performance

- **Connection Pooling**: SQLAlchemy pool with configurable size
- **Caching**: Currency rates cached 1 hour
- **Pagination**: All list endpoints support pagination
- **Indexes**: Database indexes on frequently queried columns
- **Async**: FastAPI handles async I/O for concurrency

## 🛡️ Security

- **OWASP A03**: Input validation (validators.py)
- **OWASP A04**: Price tampering prevention (payment verification)
- **CORS**: Restricted to frontend domain
- **HTTPS**: Enforced in production (via proxy)
- **JWT**: HS256 algorithm, 24-hour expiry
- **Password**: bcrypt hashing with salt
- **SQL Injection**: SQLAlchemy parameterized queries
- **Rate Limiting**: Implement via nginx/reverse proxy

## 🐛 Debugging

### Logs

```bash
# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres
```

### Database Console

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d toxic_society

# List tables
\dt

# Exit
\q
```

### API Documentation

Interactive API docs available at `/docs` (Swagger UI)

## 📝 API Examples

### Create User

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "full_name": "John Doe"
  }'
```

### List Products

```bash
curl "http://localhost:8000/api/v1/products?category=clothing&skip=0&limit=20"
```

### Create Order

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": "uuid",
        "quantity": 2,
        "size": "M",
        "color": "Black"
      }
    ],
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "delivery_location": "123 Main St"
  }'
```

## 📚 Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [Alembic Docs](https://alembic.sqlalchemy.org/)

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Run tests
4. Create pull request

## 📄 License

Proprietary - Toxic Society

## 📞 Support

For issues or questions, contact the development team.

---

**Next Steps for Frontend Integration:**

1. Update frontend API client to point to this backend
2. Replace supabase-js imports with axios/fetch
3. Update AuthContext to use JWT tokens
4. Test all endpoints in development
5. Deploy both services together
