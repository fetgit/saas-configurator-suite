# SaaS Template API Documentation

## Overview

This document describes the complete REST API for the SaaS template. All endpoints are backend-agnostic and can be implemented with any server technology (Express.js, Fastify, Django, Flask, Rails, etc.).

## Base Configuration

```
Base URL: https://api.yourapp.com/v1
Content-Type: application/json
Authentication: Bearer <token>
```

## Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "data": any,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {},
    "field": "field_name",
    "timestamp": "2023-12-01T10:00:00Z",
    "request_id": "req_123456"
  },
  "message": "Optional success message",
  "meta": {
    "page": 1,
    "per_page": 50,
    "total": 150,
    "total_pages": 3,
    "request_id": "req_123456",
    "timestamp": "2023-12-01T10:00:00Z",
    "version": "1.0.0"
  }
}
```

## Authentication Endpoints

### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": true,
  "mfa_code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* User object */ },
    "access_token": "jwt_token_here",
    "refresh_token": "refresh_token_here",
    "expires_in": 3600,
    "requires_mfa": false
  }
}
```

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "company": "Acme Corp",
  "terms_accepted": true,
  "marketing_consent": false
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

### POST /auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password with token from email.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "new_password123"
}
```

### POST /auth/verify-email
Verify email address with token.

**Request:**
```json
{
  "token": "verification_token_from_email"
}
```

### GET /auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* Full user object */ },
    "permissions": ["read:users", "write:posts"],
    "subscription": { /* Subscription object or null */ }
  }
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

### POST /auth/mfa/setup
Setup multi-factor authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "TOTP_SECRET_KEY",
    "qr_code_url": "data:image/png;base64,...",
    "backup_codes": ["12345678", "87654321"]
  }
}
```

### POST /auth/mfa/verify
Verify MFA setup with TOTP code.

**Request:**
```json
{
  "code": "123456"
}
```

## User Management Endpoints

### GET /users
List users with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 50)
- `sort_by`: Sort field (default: created_at)
- `sort_order`: asc/desc (default: desc)
- `search`: Search query
- `role`: Filter by role (user/admin/superadmin)
- `status`: Filter by status (active/inactive/suspended)
- `subscription_tier`: Filter by tier (free/basic/premium/enterprise)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "status": "active",
      "subscription_tier": "premium",
      "created_at": "2023-12-01T10:00:00Z",
      "last_login_at": "2023-12-01T15:30:00Z"
    }
  ],
  "meta": { /* Pagination info */ }
}
```

### GET /users/:id
Get detailed user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* Full user object */ },
    "subscription": { /* Subscription object or null */ },
    "audit_summary": {
      "last_login": "2023-12-01T15:30:00Z",
      "login_count": 42,
      "security_events": 0
    }
  }
}
```

### PUT /users/:id
Update user information.

**Request:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "admin",
  "status": "active",
  "preferences": {
    "language": "en",
    "timezone": "UTC",
    "theme": "dark"
  },
  "metadata": { "department": "Engineering" }
}
```

### DELETE /users/:id
Delete user account.

**Request:**
```json
{
  "transfer_data_to": "another_user_id",
  "gdpr_deletion": true
}
```

### POST /users/:id/impersonate
Impersonate another user (admin only).

**Request:**
```json
{
  "reason": "Customer support debugging"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "impersonation_token",
    "expires_in": 3600,
    "original_user": { /* Admin user object */ }
  }
}
```

## Billing & Subscription Endpoints

### GET /billing/plans
Get available subscription plans.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "plan_123",
        "name": "Premium Plan",
        "tier": "premium",
        "price_monthly": 2999,
        "price_yearly": 29990,
        "currency": "USD",
        "features": ["Feature 1", "Feature 2"],
        "limits": {
          "users": 25,
          "storage_gb": 100,
          "api_calls_per_month": 100000
        },
        "trial_days": 14
      }
    ]
  }
}
```

### GET /billing/subscription
Get current subscription details.

**Response:**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_123",
      "status": "active",
      "tier": "premium",
      "current_period_start": "2023-12-01T00:00:00Z",
      "current_period_end": "2023-12-31T23:59:59Z",
      "cancel_at_period_end": false
    },
    "plan": { /* Plan object */ },
    "usage": {
      "current_period_start": "2023-12-01T00:00:00Z",
      "current_period_end": "2023-12-31T23:59:59Z",
      "metrics": {
        "users": { "current": 15, "limit": 25 },
        "storage": { "current": 45, "limit": 100 },
        "api_calls": { "current": 50000, "limit": 100000 }
      }
    },
    "upcoming_invoice": { /* Next invoice or null */ }
  }
}
```

### POST /billing/checkout
Create Stripe checkout session.

**Request:**
```json
{
  "plan_id": "plan_123",
  "billing_cycle": "monthly",
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "checkout_url": "https://checkout.stripe.com/pay/cs_...",
    "session_id": "cs_123456"
  }
}
```

### POST /billing/portal
Create Stripe customer portal session.

**Response:**
```json
{
  "success": true,
  "data": {
    "portal_url": "https://billing.stripe.com/p/session/..."
  }
}
```

### POST /billing/subscription/change
Change subscription plan.

**Request:**
```json
{
  "plan_id": "new_plan_123",
  "billing_cycle": "yearly",
  "prorate": true
}
```

### POST /billing/subscription/cancel
Cancel subscription.

**Request:**
```json
{
  "reason": "No longer needed",
  "cancel_immediately": false
}
```

### GET /billing/invoices
Get billing history.

**Query Parameters:**
- `page`, `per_page`: Pagination
- `status`: Filter by invoice status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inv_123",
      "invoice_number": "INV-2023-001",
      "status": "paid",
      "amount": 2999,
      "tax_amount": 240,
      "total_amount": 3239,
      "currency": "USD",
      "due_date": "2023-12-15T00:00:00Z",
      "paid_at": "2023-12-01T10:30:00Z",
      "pdf_url": "https://..."
    }
  ],
  "meta": { /* Pagination */ }
}
```

### GET /billing/invoices/:id/download
Get invoice download URL.

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "https://signed-url-to-pdf",
    "expires_at": "2023-12-01T11:00:00Z"
  }
}
```

## Community Endpoints

### GET /communities
List communities.

**Query Parameters:**
- Standard pagination and search
- `visibility`: public/private/community
- `member_of`: true/false (filter by user membership)

### POST /communities
Create new community.

**Request:**
```json
{
  "name": "Tech Discussions",
  "description": "A place for tech enthusiasts",
  "slug": "tech-discussions",
  "visibility": "public",
  "settings": {
    "allow_posting": true,
    "require_approval": false,
    "allow_comments": true
  },
  "rules": ["Be respectful", "No spam"],
  "tags": ["technology", "discussion"]
}
```

### PUT /communities/:id
Update community.

### POST /communities/:id/join
Join a community.

**Request:**
```json
{
  "message": "I'd like to join this community"
}
```

### DELETE /communities/:id/members/me
Leave a community.

### GET /communities/:id/members
List community members.

**Query Parameters:**
- `role`: member/moderator/admin/owner
- `status`: active/banned/pending

### PUT /communities/:id/members/:user_id
Update member role/status.

**Request:**
```json
{
  "role": "moderator",
  "status": "active"
}
```

### GET /posts
List posts.

**Query Parameters:**
- `community_id`: Filter by community
- `author_id`: Filter by author
- `status`: draft/published/archived
- `visibility`: public/private/community
- `featured`: true/false
- `tags[]`: Array of tags

### POST /posts
Create new post.

**Request:**
```json
{
  "title": "My Great Post",
  "content": "This is the content...",
  "content_type": "markdown",
  "community_id": "community_123",
  "visibility": "public",
  "tags": ["technology", "tutorial"],
  "attachments": ["attachment_id_1", "attachment_id_2"]
}
```

### PUT /posts/:id
Update post.

### DELETE /posts/:id
Delete post.

### POST /posts/:id/react
React to a post.

**Request:**
```json
{
  "type": "like"
}
```

### GET /posts/:id/comments
Get post comments.

**Query Parameters:**
- `parent_id`: Get replies to specific comment

### POST /posts/:id/comments
Create comment.

**Request:**
```json
{
  "content": "Great post!",
  "parent_id": "comment_123"
}
```

## Support & Ticketing Endpoints

### GET /tickets
List support tickets.

**Query Parameters:**
- `status`: open/in_progress/waiting_customer/resolved/closed
- `priority`: low/medium/high/urgent
- `category`: technical/billing/feature_request/bug_report/general
- `assigned_to`: Filter by assigned user

### POST /tickets
Create support ticket.

**Request:**
```json
{
  "title": "Cannot access my account",
  "description": "I'm getting an error when trying to log in...",
  "priority": "high",
  "category": "technical",
  "attachments": ["attachment_id_1"]
}
```

### PUT /tickets/:id
Update ticket.

**Request:**
```json
{
  "status": "in_progress",
  "priority": "medium",
  "assigned_to": "support_user_id",
  "tags": ["login-issue", "urgent"]
}
```

### POST /tickets/:id/messages
Add message to ticket.

**Request:**
```json
{
  "content": "We're looking into this issue...",
  "is_internal": false,
  "attachments": ["attachment_id"]
}
```

### POST /tickets/:id/resolve
Mark ticket as resolved.

**Request:**
```json
{
  "resolution": "Issue was resolved by resetting the user's password."
}
```

### POST /tickets/:id/rate
Rate resolved ticket.

**Request:**
```json
{
  "rating": 5,
  "feedback": "Great support, very helpful!"
}
```

## Email & Marketing Endpoints

### GET /email/templates
List email templates.

**Query Parameters:**
- `category`: transactional/marketing/notification/welcome/billing/security
- `is_active`: true/false

### POST /email/templates
Create email template.

**Request:**
```json
{
  "name": "Welcome Email v2",
  "category": "welcome",
  "subject": "Welcome to {{app_name}}!",
  "html_content": "<h1>Welcome {{user_name}}!</h1>...",
  "text_content": "Welcome {{user_name}}!...",
  "variables": ["user_name", "app_name"],
  "tags": ["onboarding", "welcome"]
}
```

### PUT /email/templates/:id
Update email template.

### DELETE /email/templates/:id
Delete email template.

### POST /email/send
Send individual email.

**Request:**
```json
{
  "template_id": "template_123",
  "to": ["user@example.com"],
  "cc": ["manager@example.com"],
  "subject": "Custom subject",
  "variables": {
    "user_name": "John",
    "app_name": "MyApp"
  },
  "scheduled_at": "2023-12-01T15:00:00Z"
}
```

### GET /email/campaigns
List email campaigns.

### POST /email/campaigns
Create email campaign.

**Request:**
```json
{
  "name": "Monthly Newsletter",
  "template_id": "template_123",
  "sender_name": "MyApp Team",
  "sender_email": "newsletter@myapp.com",
  "subject": "Our Monthly Update",
  "target_audience": {
    "user_roles": ["user"],
    "subscription_tiers": ["premium", "enterprise"],
    "tags": ["newsletter-subscriber"]
  },
  "scheduled_at": "2023-12-01T15:00:00Z"
}
```

### POST /email/campaigns/:id/send
Send campaign.

**Request:**
```json
{
  "test_email": "test@example.com"
}
```

### GET /email/campaigns/:id/stats
Get campaign statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "sent": 1000,
      "delivered": 980,
      "opened": 420,
      "clicked": 85,
      "unsubscribed": 5,
      "bounced": 20,
      "complained": 1
    },
    "timeline": [
      {
        "date": "2023-12-01",
        "opened": 150,
        "clicked": 30,
        "unsubscribed": 2
      }
    ]
  }
}
```

## Analytics Endpoints

### GET /analytics/overview
Get analytics overview.

**Query Parameters:**
- `period`: day/week/month/quarter/year
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "total_users": 1250,
      "active_users": 890,
      "new_users": 45,
      "churned_users": 12,
      "revenue": 45000,
      "mrr": 15000,
      "arr": 180000,
      "ltv": 2400,
      "churn_rate": 2.1,
      "retention_rate": 97.9
    },
    "trends": [
      {
        "date": "2023-12-01",
        "users": 1200,
        "revenue": 12000,
        "signups": 15
      }
    ]
  }
}
```

### GET /analytics/users
Get user analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "acquisition": {
      "sources": [
        { "source": "organic", "count": 450, "percentage": 45.0 },
        { "source": "social", "count": 300, "percentage": 30.0 }
      ],
      "channels": [
        { "channel": "google", "count": 400, "percentage": 40.0 }
      ]
    },
    "engagement": {
      "daily_active": 650,
      "weekly_active": 890,
      "monthly_active": 1200,
      "session_duration": 1250
    },
    "retention": [
      {
        "cohort": "2023-11",
        "day_0": 100,
        "day_1": 85,
        "day_7": 72,
        "day_30": 58
      }
    ]
  }
}
```

### GET /analytics/revenue
Get revenue analytics.

### POST /analytics/events
Track custom event.

**Request:**
```json
{
  "event_name": "button_clicked",
  "properties": {
    "button_id": "cta_signup",
    "page": "/pricing",
    "variant": "A"
  },
  "user_id": "user_123",
  "session_id": "session_456"
}
```

## File Management Endpoints

### POST /files/upload
Upload file.

**Request:** (multipart/form-data)
```
file: [File]
bucket: "user-uploads"
path: "documents/"
is_public: false
metadata: {"description": "Important document"}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attachment": {
      "id": "file_123",
      "filename": "document_abc123.pdf",
      "original_filename": "important-document.pdf",
      "file_size": 2048576,
      "mime_type": "application/pdf",
      "url": "https://storage.example.com/...",
      "is_public": false
    }
  }
}
```

### GET /files
List files.

**Query Parameters:**
- `bucket`: Filter by bucket
- `path`: Filter by path prefix
- `mime_type`: Filter by MIME type

### DELETE /files/:id
Delete file.

**Query Parameters:**
- `permanent`: true/false (default: false)

### POST /files/:id/generate-url
Generate signed URL for file access.

**Request:**
```json
{
  "expires_in": 3600,
  "action": "read"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://signed-url...",
    "expires_at": "2023-12-01T11:00:00Z"
  }
}
```

## Audit & Security Endpoints

### GET /audit/logs
Get audit logs.

**Query Parameters:**
- `user_id`: Filter by user
- `action`: Filter by action
- `resource_type`: Filter by resource type
- `status`: success/failure/warning
- `date_from`, `date_to`: Date range

### GET /audit/security-events
Get security events.

**Query Parameters:**
- `user_id`: Filter by user
- `event_type`: Filter by event type
- `severity`: low/medium/high/critical
- `resolved`: true/false

### PUT /audit/security-events/:id/resolve
Mark security event as resolved.

**Request:**
```json
{
  "resolution_notes": "False positive - user was traveling"
}
```

### GET /audit/export
Export audit logs.

**Query Parameters:**
- `format`: json/csv
- `date_from`: Start date
- `date_to`: End date
- `filters`: Additional filters as JSON

**Response:**
```json
{
  "success": true,
  "data": {
    "download_url": "https://signed-url-to-export...",
    "expires_at": "2023-12-01T11:00:00Z",
    "file_size": 1048576
  }
}
```

## Data Export & Backup Endpoints

### POST /data/export
Create data export request.

**Request:**
```json
{
  "export_type": "gdpr_export",
  "format": "json",
  "requested_data": ["profile", "posts", "comments", "subscriptions"],
  "email_when_ready": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "export_id": "export_123",
    "estimated_completion": "2023-12-01T11:00:00Z"
  }
}
```

### GET /data/exports
List data exports.

### GET /data/exports/:id/download
Download completed export.

### POST /data/backup
Create system backup.

**Request:**
```json
{
  "type": "full",
  "tables": ["users", "subscriptions", "posts"],
  "retention_days": 30,
  "encrypt": true
}
```

### GET /data/backups
List backups.

### POST /data/restore
Restore from backup.

**Request:**
```json
{
  "backup_id": "backup_123",
  "tables": ["users"],
  "preview": true
}
```

## API Management Endpoints

### GET /api/keys
List API keys.

### POST /api/keys
Create API key.

**Request:**
```json
{
  "name": "Mobile App Integration",
  "permissions": [
    {
      "resource": "posts",
      "actions": ["read", "create"]
    }
  ],
  "rate_limit": 1000,
  "expires_at": "2024-12-01T00:00:00Z",
  "ip_whitelist": ["192.168.1.1", "10.0.0.0/8"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": { /* API key object */ },
    "secret_key": "sk_live_abcd1234..." 
  }
}
```

### PUT /api/keys/:id
Update API key.

### POST /api/keys/:id/regenerate
Regenerate API key secret.

### DELETE /api/keys/:id
Delete API key.

### GET /api/webhooks
List webhooks.

### POST /api/webhooks
Create webhook.

**Request:**
```json
{
  "name": "User Registration Webhook",
  "url": "https://yourapp.com/webhooks/user-registered",
  "events": ["user.created", "user.updated"],
  "secret": "webhook_secret_123",
  "retry_count": 3,
  "timeout_seconds": 30
}
```

### PUT /api/webhooks/:id
Update webhook.

### DELETE /api/webhooks/:id
Delete webhook.

### POST /api/webhooks/:id/test
Test webhook.

**Request:**
```json
{
  "event_type": "user.created",
  "test_payload": {
    "user_id": "user_123",
    "email": "test@example.com"
  }
}
```

## System & Admin Endpoints

### GET /system/health
Get system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-12-01T10:00:00Z",
    "services": [
      {
        "name": "database",
        "status": "healthy",
        "response_time": 15,
        "error_rate": 0,
        "last_checked": "2023-12-01T10:00:00Z"
      }
    ],
    "metrics": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "disk_usage": 23.4,
      "active_connections": 142,
      "requests_per_minute": 1250,
      "error_rate": 0.02
    }
  }
}
```

### GET /system/settings
List system settings.

### PUT /system/settings/:key
Update system setting.

**Request:**
```json
{
  "value": "new_setting_value"
}
```

### GET /system/feature-flags
List feature flags.

### PUT /system/feature-flags/:key
Update feature flag.

**Request:**
```json
{
  "is_enabled": true,
  "rollout_percentage": 50,
  "target_audience": {
    "user_roles": ["admin"],
    "subscription_tiers": ["premium"]
  }
}
```

### GET /system/jobs
List background jobs.

### POST /system/maintenance
Schedule maintenance.

**Request:**
```json
{
  "title": "Database Maintenance",
  "description": "Scheduled database optimization",
  "scheduled_start": "2023-12-02T02:00:00Z",
  "scheduled_end": "2023-12-02T04:00:00Z",
  "notify_users": true
}
```

## Error Codes Reference

### Authentication Errors
- `auth.unauthorized` (401): No valid authentication provided
- `auth.forbidden` (403): User lacks required permissions
- `auth.invalid_credentials` (401): Invalid email/password
- `auth.token_expired` (401): JWT token has expired
- `auth.mfa_required` (200): MFA code required for login
- `auth.account_locked` (423): Account temporarily locked

### Validation Errors
- `validation.error` (422): General validation error
- `validation.required` (422): Required field missing
- `validation.invalid_format` (422): Invalid field format
- `validation.too_long` (422): Field value too long
- `validation.too_short` (422): Field value too short

### Resource Errors
- `resource.not_found` (404): Requested resource not found
- `resource.already_exists` (409): Resource already exists
- `resource.conflict` (409): Resource conflict
- `resource.gone` (410): Resource no longer available

### Business Logic Errors
- `business.insufficient_permissions` (403): User lacks required permissions
- `business.subscription_required` (402): Paid subscription required
- `business.usage_limit_exceeded` (429): Usage limit exceeded
- `business.feature_not_available` (403): Feature not available in current plan

### System Errors
- `system.internal_error` (500): Internal server error
- `system.service_unavailable` (503): Service temporarily unavailable
- `system.maintenance_mode` (503): System in maintenance mode
- `system.rate_limit_exceeded` (429): API rate limit exceeded

### Payment Errors
- `payment.required` (402): Payment required
- `payment.failed` (402): Payment processing failed
- `payment.subscription_expired` (402): Subscription has expired
- `payment.invoice_overdue` (402): Outstanding invoice payment required

## Rate Limiting

API endpoints are rate limited per user/API key:

- **Authentication endpoints**: 10 requests per minute
- **Read operations**: 1000 requests per hour
- **Write operations**: 100 requests per hour
- **File uploads**: 50 requests per hour
- **Email sending**: 100 emails per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Webhook Events

The system can send webhooks for these events:

### User Events
- `user.created`
- `user.updated`
- `user.deleted`
- `user.login`
- `user.logout`

### Subscription Events
- `subscription.created`
- `subscription.updated`
- `subscription.canceled`
- `subscription.payment_succeeded`
- `subscription.payment_failed`

### Content Events
- `post.created`
- `post.updated`
- `post.deleted`
- `comment.created`

### Support Events
- `ticket.created`
- `ticket.updated`
- `ticket.resolved`

### System Events
- `backup.completed`
- `export.ready`
- `maintenance.scheduled`

## API Versioning

The API uses URL versioning:
- Current version: `/v1/`
- Deprecated versions are supported for 12 months
- Breaking changes trigger a new version
- Non-breaking changes are additive to current version

## SDKs and Client Libraries

Official SDKs available for:
- JavaScript/TypeScript (Node.js & Browser)
- Python
- PHP
- Ruby
- Go
- Java
- C#

Community SDKs:
- Rust
- Swift
- Kotlin
- Dart/Flutter