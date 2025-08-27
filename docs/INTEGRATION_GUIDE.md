# Backend Integration Guide

## Overview

This guide provides a complete roadmap for integrating any backend technology with the SaaS template frontend. The architecture is designed to be backend-agnostic and supports PostgreSQL, MongoDB, Firebase, Supabase, or any custom solution.

## Architecture Overview

```mermaid
graph TB
    Frontend[React Frontend] --> API[API Layer]
    API --> Auth[Authentication Service]
    API --> Business[Business Logic Layer]
    Business --> Data[Data Access Layer]
    Data --> DB[(Database)]
    
    API --> Cache[Cache Layer]
    API --> Queue[Job Queue]
    API --> Storage[File Storage]
    API --> Email[Email Service]
    API --> Payment[Payment Service]
    
    subgraph "External Services"
        Stripe[Stripe]
        S3[AWS S3]
        SendGrid[SendGrid]
        Redis[Redis]
    end
    
    Payment --> Stripe
    Storage --> S3
    Email --> SendGrid
    Cache --> Redis
```

## Quick Start Options

### Option 1: Express.js + PostgreSQL (Recommended)

```bash
# 1. Setup project structure
mkdir saas-backend && cd saas-backend
npm init -y

# 2. Install dependencies
npm install express cors helmet morgan compression
npm install bcryptjs jsonwebtoken
npm install pg postgres
npm install joi express-rate-limit
npm install stripe nodemailer
npm install @types/node typescript ts-node nodemon --save-dev

# 3. Database setup
psql -U postgres -c "CREATE DATABASE saas_template;"
psql -U postgres -d saas_template -f ../docs/DATABASE_SCHEMA.sql
```

**Project Structure:**
```
saas-backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, validation, etc.
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── types/          # TypeScript types
│   └── app.ts          # Express app setup
├── migrations/         # Database migrations
├── tests/             # Test files
└── docs/              # API documentation
```

### Option 2: Next.js API Routes + Prisma

```bash
# 1. Setup Next.js project
npx create-next-app@latest saas-backend --typescript
cd saas-backend

# 2. Install Prisma and dependencies
npm install prisma @prisma/client
npm install next-auth
npm install stripe @stripe/stripe-js
npm install @sendgrid/mail

# 3. Initialize Prisma
npx prisma init
# Copy DATABASE_SCHEMA.sql content to prisma/schema.prisma (converted)
npx prisma generate
npx prisma db push
```

### Option 3: Django + PostgreSQL

```bash
# 1. Setup Django project
pip install django djangorestframework
pip install psycopg2-binary
pip install django-cors-headers
pip install stripe python-decouple
django-admin startproject saas_backend
cd saas_backend

# 2. Configure settings and create apps
python manage.py startapp authentication
python manage.py startapp billing
python manage.py startapp community
python manage.py startapp support

# 3. Database setup
python manage.py makemigrations
python manage.py migrate
```

### Option 4: FastAPI + SQLAlchemy

```bash
# 1. Setup FastAPI project
pip install fastapi uvicorn
pip install sqlalchemy alembic psycopg2-binary
pip install python-jose[cryptography] passlib[bcrypt]
pip install stripe python-multipart

# 2. Project structure
mkdir saas-backend && cd saas-backend
mkdir app app/api app/core app/models app/schemas app/services
```

## Database Integration

### PostgreSQL Setup

1. **Install and configure PostgreSQL**
2. **Run the schema**: Use `docs/DATABASE_SCHEMA.sql`
3. **Connection example**:

```javascript
// Node.js with pg
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
```

### MongoDB Setup

```javascript
// Convert SQL schema to MongoDB collections
const mongoose = require('mongoose');

// User schema example
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  subscription_tier: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'] },
  // ... other fields from database.ts
}, { timestamps: true });
```

### Supabase Integration

```javascript
// Install Supabase client
npm install @supabase/supabase-js

// Initialize client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

## API Implementation Templates

### Express.js Controllers

```javascript
// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'auth.invalid_credentials',
            message: 'Invalid email or password'
          }
        });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'auth.invalid_credentials',
            message: 'Invalid email or password'
          }
        });
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: 900
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'system.internal_error',
          message: 'Internal server error'
        }
      });
    }
  }

  async register(req, res) {
    // Implementation similar to login
  }
}

module.exports = new AuthController();
```

### Django Views

```python
# views/auth_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(email=email, password=password)
    if not user:
        return Response({
            'success': False,
            'error': {
                'code': 'auth.invalid_credentials',
                'message': 'Invalid email or password'
            }
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'success': True,
        'data': {
            'user': {
                'id': str(user.id),
                'email': user.email,
                'name': user.name,
                'role': user.role
            },
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'expires_in': 900
        }
    })
```

### FastAPI Endpoints

```python
# routers/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not pwd_context.verify(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail={
                "success": False,
                "error": {
                    "code": "auth.invalid_credentials",
                    "message": "Invalid email or password"
                }
            }
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "success": True,
        "data": {
            "user": {
                "id": str(user.id),
                "email": user.email,
                "name": user.name,
                "role": user.role
            },
            "access_token": access_token,
            "expires_in": 900
        }
    }
```

## Authentication & Authorization

### JWT Implementation

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth.unauthorized',
        message: 'No authorization header provided'
      }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'auth.token_expired',
        message: 'Token expired or invalid'
      }
    });
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'auth.forbidden',
          message: 'Insufficient permissions'
        }
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

### Role-Based Access Control

```javascript
// services/rbac.js
const permissions = {
  user: [
    'read:own_profile',
    'update:own_profile',
    'create:posts',
    'read:posts'
  ],
  admin: [
    'read:users',
    'update:users',
    'delete:posts',
    'read:analytics'
  ],
  superadmin: [
    'read:all',
    'update:all',
    'delete:all',
    'manage:system'
  ]
};

const hasPermission = (userRole, permission) => {
  const userPermissions = permissions[userRole] || [];
  const inheritedPermissions = getInheritedPermissions(userRole);
  
  return [...userPermissions, ...inheritedPermissions].includes(permission);
};

const getInheritedPermissions = (role) => {
  const hierarchy = {
    superadmin: ['admin', 'user'],
    admin: ['user'],
    user: []
  };
  
  const inherited = hierarchy[role] || [];
  return inherited.reduce((acc, inheritedRole) => {
    return [...acc, ...permissions[inheritedRole]];
  }, []);
};
```

## Stripe Integration

### Payment Processing

```javascript
// services/stripeService.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createCustomer(email, name, metadata = {}) {
    return await stripe.customers.create({
      email,
      name,
      metadata
    });
  }

  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createPortalSession(customerId, returnUrl) {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async handleWebhook(payload, signature) {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
    }
  }

  async handleSubscriptionCreated(subscription) {
    // Update user subscription in database
    await User.updateSubscription(subscription.customer, {
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });
  }
}

module.exports = new StripeService();
```

## Email Integration

### SendGrid Setup

```javascript
// services/emailService.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendTemplate(templateId, to, dynamicTemplateData) {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      templateId,
      dynamicTemplateData,
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendTemplate('d-welcome-template-id', user.email, {
      user_name: user.name,
      app_name: process.env.APP_NAME,
      login_url: `${process.env.FRONTEND_URL}/login`
    });
  }

  async sendPasswordResetEmail(user, resetToken) {
    return this.sendTemplate('d-password-reset-template-id', user.email, {
      user_name: user.name,
      reset_url: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    });
  }
}

module.exports = new EmailService();
```

### Nodemailer Setup

```javascript
// services/emailService.js
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, html, text) {
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async renderTemplate(templateName, variables) {
    // Load template from database or file system
    const template = await EmailTemplate.findByName(templateName);
    
    let html = template.html_content;
    let text = template.text_content;
    let subject = template.subject;

    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
      text = text.replace(regex, value);
      subject = subject.replace(regex, value);
    });

    return { html, text, subject };
  }
}
```

## File Storage Integration

### AWS S3 Setup

```javascript
// services/fileService.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: 'private',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const userId = req.user.userId;
      const timestamp = Date.now();
      const filename = `${userId}/${timestamp}-${file.originalname}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

class FileService {
  async generateSignedUrl(key, expiresIn = 3600) {
    return s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    });
  }

  async deleteFile(key) {
    return s3.deleteObject({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    }).promise();
  }
}

module.exports = { upload, FileService: new FileService() };
```

## Background Jobs & Queues

### Bull Queue Setup

```javascript
// services/queueService.js
const Queue = require('bull');
const redis = require('redis');

const redisClient = redis.createClient(process.env.REDIS_URL);

// Create queues
const emailQueue = new Queue('email processing', {
  redis: { port: 6379, host: 'localhost' },
});

const backupQueue = new Queue('backup processing', {
  redis: { port: 6379, host: 'localhost' },
});

// Email queue processor
emailQueue.process('send-email', async (job) => {
  const { templateId, to, variables } = job.data;
  await EmailService.sendTemplate(templateId, to, variables);
});

// Backup queue processor
backupQueue.process('create-backup', async (job) => {
  const { type, tables } = job.data;
  await BackupService.createBackup(type, tables);
});

class QueueService {
  async addEmailJob(templateId, to, variables, delay = 0) {
    return emailQueue.add('send-email', { templateId, to, variables }, {
      delay,
      attempts: 3,
      backoff: 'exponential',
    });
  }

  async addBackupJob(type, tables) {
    return backupQueue.add('create-backup', { type, tables }, {
      attempts: 1,
    });
  }
}

module.exports = new QueueService();
```

## Monitoring & Logging

### Winston Logger Setup

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'saas-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Request Logging Middleware

```javascript
// middleware/logging.js
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId,
    });
  });
  
  next();
};

module.exports = requestLogger;
```

## Testing Setup

### Jest Configuration

```javascript
// tests/setup.js
const { Pool } = require('pg');

// Test database setup
const testDb = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
});

beforeAll(async () => {
  // Run migrations
  await testDb.query('BEGIN');
});

afterAll(async () => {
  await testDb.query('ROLLBACK');
  await testDb.end();
});

beforeEach(async () => {
  // Clean up test data
  await testDb.query('TRUNCATE TABLE users, subscriptions, posts CASCADE');
});
```

### API Tests Example

```javascript
// tests/auth.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  test('POST /auth/login - valid credentials', async () => {
    // Create test user
    await User.create({
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Test User',
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.access_token).toBeDefined();
  });

  test('POST /auth/login - invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('auth.invalid_credentials');
  });
});
```

## Deployment Options

### Docker Setup

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/saas
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=saas
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables

```env
# .env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/saas
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App

# AWS
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
S3_BUCKET=your-app-files

# Frontend
FRONTEND_URL=https://yourapp.com
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

## Security Checklist

- [ ] Environment variables for all secrets
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection headers
- [ ] CSRF protection for state-changing operations
- [ ] Password hashing with bcrypt
- [ ] JWT token expiration and rotation
- [ ] File upload validation and scanning
- [ ] Database connections secured
- [ ] Error messages don't leak sensitive info
- [ ] Audit logging implemented
- [ ] Regular security dependency updates

## Performance Optimization

- [ ] Database query optimization
- [ ] Proper indexing strategy
- [ ] Connection pooling
- [ ] Redis/Memcached caching
- [ ] CDN for static assets
- [ ] Image optimization and resizing
- [ ] API response compression
- [ ] Database connection limits
- [ ] Background job processing
- [ ] Health check endpoints
- [ ] Application monitoring
- [ ] Database monitoring

This integration guide provides the foundation for implementing a production-ready SaaS backend that seamlessly integrates with the React frontend. Choose the technology stack that best fits your team's expertise and requirements.
