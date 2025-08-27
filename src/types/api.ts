// ===================================================================
// API CONTRACTS & ENDPOINTS
// Backend-agnostic API interfaces for SaaS template
// REST endpoints, request/response types, error handling
// ===================================================================

// ===================================================================
// COMMON API TYPES
// ===================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ResponseMeta;
}

export interface ApiError extends Error {
  code: string;
  message: string;
  name: string;
  details?: Record<string, any>;
  field?: string;
  timestamp: string;
  request_id: string;
}

export interface ResponseMeta {
  page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  request_id: string;
  timestamp: string;
  version: string;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  date_from?: string;
  date_to?: string;
}

export type ApiParams = PaginationParams & FilterParams;

// ===================================================================
// AUTHENTICATION ENDPOINTS
// ===================================================================

export namespace AuthApi {
  // POST /auth/login
  export interface LoginRequest {
    email: string;
    password: string;
    remember_me?: boolean;
    mfa_code?: string;
  }

  export interface LoginResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    requires_mfa: boolean;
  }

  // POST /auth/register
  export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    company?: string;
    terms_accepted: boolean;
    marketing_consent?: boolean;
  }

  export interface RegisterResponse {
    user: User;
    verification_required: boolean;
    message: string;
  }

  // POST /auth/refresh
  export interface RefreshRequest {
    refresh_token: string;
  }

  export interface RefreshResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }

  // POST /auth/forgot-password
  export interface ForgotPasswordRequest {
    email: string;
  }

  // POST /auth/reset-password
  export interface ResetPasswordRequest {
    token: string;
    password: string;
  }

  // POST /auth/verify-email
  export interface VerifyEmailRequest {
    token: string;
  }

  // POST /auth/mfa/setup
  export interface MfaSetupResponse {
    secret: string;
    qr_code_url: string;
    backup_codes: string[];
  }

  // POST /auth/mfa/verify
  export interface MfaVerifyRequest {
    code: string;
  }

  // GET /auth/me
  export interface MeResponse {
    user: User;
    permissions: string[];
    subscription: Subscription | null;
  }

  // POST /auth/logout
  export interface LogoutRequest {
    refresh_token?: string;
  }
}

// ===================================================================
// USER MANAGEMENT ENDPOINTS
// ===================================================================

export namespace UsersApi {
  // GET /users
  export interface ListUsersParams extends ApiParams {
    role?: UserRole;
    status?: UserStatus;
    subscription_tier?: SubscriptionTier;
  }

  // GET /users/:id
  export interface GetUserResponse {
    user: User;
    subscription?: Subscription;
    audit_summary: {
      last_login: string;
      login_count: number;
      security_events: number;
    };
  }

  // PUT /users/:id
  export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    preferences?: Partial<UserPreferences>;
    metadata?: Record<string, any>;
  }

  // DELETE /users/:id
  export interface DeleteUserRequest {
    transfer_data_to?: string;
    gdpr_deletion?: boolean;
  }

  // POST /users/:id/impersonate
  export interface ImpersonateRequest {
    reason: string;
  }

  export interface ImpersonateResponse {
    access_token: string;
    expires_in: number;
    original_user: User;
  }
}

// ===================================================================
// SUBSCRIPTION & BILLING ENDPOINTS
// ===================================================================

export namespace BillingApi {
  // GET /billing/plans
  export interface ListPlansResponse {
    plans: SubscriptionPlan[];
  }

  // GET /billing/subscription
  export interface GetSubscriptionResponse {
    subscription: Subscription | null;
    plan: SubscriptionPlan | null;
    usage: UsageMetrics;
    upcoming_invoice?: Invoice;
  }

  export interface UsageMetrics {
    current_period_start: string;
    current_period_end: string;
    metrics: {
      users: { current: number; limit: number };
      storage: { current: number; limit: number };
      api_calls: { current: number; limit: number };
      email_sends: { current: number; limit: number };
    };
  }

  // POST /billing/checkout
  export interface CreateCheckoutRequest {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    success_url: string;
    cancel_url: string;
  }

  export interface CreateCheckoutResponse {
    checkout_url: string;
    session_id: string;
  }

  // POST /billing/portal
  export interface CreatePortalResponse {
    portal_url: string;
  }

  // POST /billing/subscription/change
  export interface ChangeSubscriptionRequest {
    plan_id: string;
    billing_cycle?: 'monthly' | 'yearly';
    prorate?: boolean;
  }

  // POST /billing/subscription/cancel
  export interface CancelSubscriptionRequest {
    reason?: string;
    cancel_immediately?: boolean;
  }

  // GET /billing/invoices
  export interface ListInvoicesParams extends ApiParams {
    status?: InvoiceStatus;
  }

  // GET /billing/invoices/:id/download
  export interface DownloadInvoiceResponse {
    download_url: string;
    expires_at: string;
  }
}

// ===================================================================
// CONTENT & COMMUNITY ENDPOINTS
// ===================================================================

export namespace CommunityApi {
  // GET /communities
  export interface ListCommunitiesParams extends ApiParams {
    visibility?: ContentVisibility;
    member_of?: boolean;
  }

  // POST /communities
  export interface CreateCommunityRequest {
    name: string;
    description: string;
    slug: string;
    visibility: ContentVisibility;
    settings: CommunitySettings;
    rules?: string[];
    tags?: string[];
  }

  // PUT /communities/:id
  export interface UpdateCommunityRequest {
    name?: string;
    description?: string;
    visibility?: ContentVisibility;
    settings?: Partial<CommunitySettings>;
    rules?: string[];
    tags?: string[];
  }

  // POST /communities/:id/join
  export interface JoinCommunityRequest {
    message?: string;
  }

  // GET /communities/:id/members
  export interface ListMembersParams extends ApiParams {
    role?: CommunityRole;
    status?: MembershipStatus;
  }

  // PUT /communities/:id/members/:user_id
  export interface UpdateMemberRequest {
    role?: CommunityRole;
    status?: MembershipStatus;
  }

  // GET /posts
  export interface ListPostsParams extends ApiParams {
    community_id?: string;
    author_id?: string;
    status?: ContentStatus;
    visibility?: ContentVisibility;
    featured?: boolean;
    tags?: string[];
  }

  // POST /posts
  export interface CreatePostRequest {
    title: string;
    content: string;
    content_type?: 'text' | 'markdown' | 'html';
    community_id?: string;
    visibility?: ContentVisibility;
    tags?: string[];
    attachments?: string[];
  }

  // PUT /posts/:id
  export interface UpdatePostRequest {
    title?: string;
    content?: string;
    visibility?: ContentVisibility;
    tags?: string[];
    featured?: boolean;
    pinned?: boolean;
  }

  // POST /posts/:id/react
  export interface ReactToPostRequest {
    type: ReactionType;
  }

  // GET /posts/:id/comments
  export interface ListCommentsParams extends ApiParams {
    parent_id?: string;
  }

  // POST /posts/:id/comments
  export interface CreateCommentRequest {
    content: string;
    parent_id?: string;
  }
}

// ===================================================================
// SUPPORT & TICKETING ENDPOINTS
// ===================================================================

export namespace SupportApi {
  // GET /tickets
  export interface ListTicketsParams extends ApiParams {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assigned_to?: string;
  }

  // POST /tickets
  export interface CreateTicketRequest {
    title: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
    attachments?: string[];
  }

  // PUT /tickets/:id
  export interface UpdateTicketRequest {
    status?: TicketStatus;
    priority?: TicketPriority;
    assigned_to?: string;
    tags?: string[];
  }

  // POST /tickets/:id/messages
  export interface CreateTicketMessageRequest {
    content: string;
    is_internal?: boolean;
    attachments?: string[];
  }

  // POST /tickets/:id/resolve
  export interface ResolveTicketRequest {
    resolution: string;
  }

  // POST /tickets/:id/rate
  export interface RateTicketRequest {
    rating: number; // 1-5
    feedback?: string;
  }
}

// ===================================================================
// EMAIL & MARKETING ENDPOINTS
// ===================================================================

export namespace EmailApi {
  // GET /email/templates
  export interface ListTemplatesParams extends ApiParams {
    category?: EmailTemplateCategory;
    is_active?: boolean;
  }

  // POST /email/templates
  export interface CreateTemplateRequest {
    name: string;
    category: EmailTemplateCategory;
    subject: string;
    html_content: string;
    text_content?: string;
    variables?: string[];
    tags?: string[];
  }

  // POST /email/send
  export interface SendEmailRequest {
    template_id?: string;
    to: string | string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    html_content?: string;
    text_content?: string;
    variables?: Record<string, any>;
    scheduled_at?: string;
  }

  // GET /email/campaigns
  export interface ListCampaignsParams extends ApiParams {
    status?: CampaignStatus;
  }

  // POST /email/campaigns
  export interface CreateCampaignRequest {
    name: string;
    template_id: string;
    sender_name: string;
    sender_email: string;
    subject?: string;
    target_audience: AudienceFilter;
    scheduled_at?: string;
  }

  // POST /email/campaigns/:id/send
  export interface SendCampaignRequest {
    test_email?: string;
  }

  // GET /email/campaigns/:id/stats
  export interface GetCampaignStatsResponse {
    statistics: CampaignStatistics;
    timeline: Array<{
      date: string;
      opened: number;
      clicked: number;
      unsubscribed: number;
    }>;
  }
}

// ===================================================================
// ANALYTICS ENDPOINTS
// ===================================================================

export namespace AnalyticsApi {
  // GET /analytics/overview
  export interface GetOverviewParams {
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
    date_from?: string;
    date_to?: string;
  }

  export interface GetOverviewResponse {
    metrics: AnalyticsMetrics;
    trends: Array<{
      date: string;
      users: number;
      revenue: number;
      signups: number;
    }>;
  }

  // GET /analytics/users
  export interface GetUserAnalyticsResponse {
    acquisition: {
      sources: Array<{ source: string; count: number; percentage: number }>;
      channels: Array<{ channel: string; count: number; percentage: number }>;
    };
    engagement: {
      daily_active: number;
      weekly_active: number;
      monthly_active: number;
      session_duration: number;
    };
    retention: Array<{
      cohort: string;
      day_0: number;
      day_1: number;
      day_7: number;
      day_30: number;
    }>;
  }

  // GET /analytics/revenue
  export interface GetRevenueAnalyticsResponse {
    subscription_metrics: {
      mrr: number;
      arr: number;
      ltv: number;
      churn_rate: number;
    };
    plan_distribution: Array<{
      plan: string;
      subscribers: number;
      revenue: number;
    }>;
    cohort_revenue: Array<{
      cohort: string;
      month_0: number;
      month_1: number;
      month_3: number;
      month_6: number;
      month_12: number;
    }>;
  }

  // POST /analytics/events
  export interface TrackEventRequest {
    event_name: string;
    properties?: Record<string, any>;
    user_id?: string;
    session_id?: string;
  }
}

// ===================================================================
// FILE MANAGEMENT ENDPOINTS
// ===================================================================

export namespace FilesApi {
  // POST /files/upload
  export interface UploadFileRequest {
    file: File;
    bucket?: string;
    path?: string;
    is_public?: boolean;
    metadata?: Record<string, any>;
  }

  export interface UploadFileResponse {
    attachment: Attachment;
    upload_url?: string; // For direct upload to storage
  }

  // GET /files
  export interface ListFilesParams extends ApiParams {
    bucket?: string;
    path?: string;
    mime_type?: string;
  }

  // DELETE /files/:id
  export interface DeleteFileRequest {
    permanent?: boolean;
  }

  // POST /files/:id/generate-url
  export interface GenerateUrlRequest {
    expires_in?: number; // seconds
    action?: 'read' | 'write';
  }

  export interface GenerateUrlResponse {
    url: string;
    expires_at: string;
  }
}

// ===================================================================
// AUDIT & SECURITY ENDPOINTS
// ===================================================================

export namespace AuditApi {
  // GET /audit/logs
  export interface ListAuditLogsParams extends ApiParams {
    user_id?: string;
    action?: string;
    resource_type?: string;
    status?: 'success' | 'failure' | 'warning';
    date_from?: string;
    date_to?: string;
  }

  // GET /audit/security-events
  export interface ListSecurityEventsParams extends ApiParams {
    user_id?: string;
    event_type?: SecurityEventType;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resolved?: boolean;
  }

  // PUT /audit/security-events/:id/resolve
  export interface ResolveSecurityEventRequest {
    resolution_notes?: string;
  }

  // GET /audit/export
  export interface ExportAuditRequest {
    format: 'json' | 'csv';
    date_from: string;
    date_to: string;
    filters?: Record<string, any>;
  }

  export interface ExportAuditResponse {
    download_url: string;
    expires_at: string;
    file_size: number;
  }
}

// ===================================================================
// DATA EXPORT & BACKUP ENDPOINTS
// ===================================================================

export namespace DataApi {
  // POST /data/export
  export interface CreateExportRequest {
    export_type: ExportType;
    format: ExportFormat;
    requested_data: string[];
    email_when_ready?: boolean;
  }

  export interface CreateExportResponse {
    export_id: string;
    estimated_completion: string;
  }

  // GET /data/exports
  export interface ListExportsParams extends ApiParams {
    export_type?: ExportType;
    status?: ExportStatus;
  }

  // GET /data/exports/:id/download
  export interface DownloadExportResponse {
    download_url: string;
    expires_at: string;
    file_size: number;
  }

  // POST /data/backup
  export interface CreateBackupRequest {
    type: BackupType;
    tables?: string[];
    retention_days?: number;
    encrypt?: boolean;
  }

  // GET /data/backups
  export interface ListBackupsParams extends ApiParams {
    type?: BackupType;
    status?: BackupStatus;
  }

  // POST /data/restore
  export interface RestoreBackupRequest {
    backup_id: string;
    tables?: string[];
    preview?: boolean; // Return diff without applying
  }

  export interface RestoreBackupResponse {
    job_id: string;
    estimated_completion: string;
    preview?: {
      tables_affected: string[];
      records_affected: number;
      changes_summary: Record<string, any>;
    };
  }
}

// ===================================================================
// API MANAGEMENT ENDPOINTS
// ===================================================================

export namespace ApiManagementApi {
  // GET /api/keys
  export interface ListApiKeysResponse {
    keys: (Omit<ApiKey, 'key_hash'> & { key_preview: string })[];
  }

  // POST /api/keys
  export interface CreateApiKeyRequest {
    name: string;
    permissions: ApiPermission[];
    rate_limit?: number;
    expires_at?: string;
    ip_whitelist?: string[];
  }

  export interface CreateApiKeyResponse {
    key: ApiKey;
    secret_key: string; // Only returned once
  }

  // PUT /api/keys/:id
  export interface UpdateApiKeyRequest {
    name?: string;
    permissions?: ApiPermission[];
    rate_limit?: number;
    is_active?: boolean;
    ip_whitelist?: string[];
  }

  // POST /api/keys/:id/regenerate
  export interface RegenerateApiKeyResponse {
    secret_key: string;
  }

  // GET /api/webhooks
  export interface ListWebhooksResponse {
    webhooks: Webhook[];
  }

  // POST /api/webhooks
  export interface CreateWebhookRequest {
    name: string;
    url: string;
    events: string[];
    secret?: string;
    retry_count?: number;
    timeout_seconds?: number;
  }

  // POST /api/webhooks/:id/test
  export interface TestWebhookRequest {
    event_type: string;
    test_payload?: Record<string, any>;
  }

  export interface TestWebhookResponse {
    delivery_id: string;
    status: DeliveryStatus;
    response_code?: number;
    response_body?: string;
  }
}

// ===================================================================
// SYSTEM & ADMIN ENDPOINTS
// ===================================================================

export namespace SystemApi {
  // GET /system/health
  export interface GetHealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: ServiceHealth[];
    metrics: SystemMetrics;
  }

  // GET /system/settings
  export interface ListSettingsParams extends ApiParams {
    category?: string;
  }

  // PUT /system/settings/:key
  export interface UpdateSettingRequest {
    value: string;
  }

  // GET /system/feature-flags
  export interface ListFeatureFlagsResponse {
    flags: FeatureFlag[];
  }

  // PUT /system/feature-flags/:key
  export interface UpdateFeatureFlagRequest {
    is_enabled?: boolean;
    rollout_percentage?: number;
    target_audience?: AudienceFilter;
  }

  // GET /system/jobs
  export interface ListJobsParams extends ApiParams {
    status?: 'pending' | 'running' | 'completed' | 'failed';
    type?: string;
  }

  // POST /system/maintenance
  export interface ScheduleMaintenanceRequest {
    title: string;
    description: string;
    scheduled_start: string;
    scheduled_end: string;
    notify_users: boolean;
  }
}

// ===================================================================
// ERROR CODES REFERENCE
// ===================================================================

export const API_ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'auth.unauthorized',
  FORBIDDEN: 'auth.forbidden',
  INVALID_CREDENTIALS: 'auth.invalid_credentials',
  TOKEN_EXPIRED: 'auth.token_expired',
  MFA_REQUIRED: 'auth.mfa_required',
  ACCOUNT_LOCKED: 'auth.account_locked',

  // Validation
  VALIDATION_ERROR: 'validation.error',
  REQUIRED_FIELD: 'validation.required',
  INVALID_FORMAT: 'validation.invalid_format',
  VALUE_TOO_LONG: 'validation.too_long',
  VALUE_TOO_SHORT: 'validation.too_short',

  // Resource
  NOT_FOUND: 'resource.not_found',
  ALREADY_EXISTS: 'resource.already_exists',
  CONFLICT: 'resource.conflict',
  GONE: 'resource.gone',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'business.insufficient_permissions',
  SUBSCRIPTION_REQUIRED: 'business.subscription_required',
  USAGE_LIMIT_EXCEEDED: 'business.usage_limit_exceeded',
  FEATURE_NOT_AVAILABLE: 'business.feature_not_available',

  // System
  INTERNAL_ERROR: 'system.internal_error',
  SERVICE_UNAVAILABLE: 'system.service_unavailable',
  MAINTENANCE_MODE: 'system.maintenance_mode',
  RATE_LIMIT_EXCEEDED: 'system.rate_limit_exceeded',

  // Payment
  PAYMENT_REQUIRED: 'payment.required',
  PAYMENT_FAILED: 'payment.failed',
  SUBSCRIPTION_EXPIRED: 'payment.subscription_expired',
  INVOICE_OVERDUE: 'payment.invoice_overdue',
} as const;

import type { 
  User, Subscription, SubscriptionPlan, Invoice, BillingAddress,
  Post, Community, CommunityMembership, Comment, Reaction,
  SupportTicket, TicketMessage, EmailTemplate, EmailCampaign,
  Attachment, AuditLog, SecurityEvent, ApiKey, Webhook,
  DataExport, BackupJob, FeatureFlag, SystemHealth,
  UserRole, UserStatus, SubscriptionTier, ContentStatus,
  ContentVisibility, TicketStatus, TicketPriority, TicketCategory,
  CampaignStatus, EmailTemplateCategory, AudienceFilter,
  CampaignStatistics, AnalyticsMetrics, UserPreferences,
  ReactionType, CommunityRole, MembershipStatus,
  SecurityEventType, ExportType, ExportFormat, ExportStatus,
  BackupType, BackupStatus, DeliveryStatus, ServiceHealth,
  SystemMetrics, CommunitySettings, ApiPermission, InvoiceStatus
} from './database';