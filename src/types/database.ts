// ===================================================================
// DATABASE MODELS & INTERFACES
// Backend-agnostic data models for SaaS template
// Compatible with PostgreSQL, MongoDB, Firebase, etc.
// ===================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// USER MANAGEMENT
// ===================================================================

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
  company_id?: string;
  subscription_tier?: SubscriptionTier;
  email_verified: boolean;
  phone?: string;
  phone_verified: boolean;
  mfa_enabled: boolean;
  mfa_secret?: string;
  last_login_at?: string;
  login_count: number;
  status: UserStatus;
  preferences: UserPreferences;
  metadata: Record<string, any>;
}

export type UserRole = 'user' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email_marketing: boolean;
  email_product_updates: boolean;
  email_security_alerts: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
}

export interface PrivacyPreferences {
  analytics_consent: boolean;
  marketing_consent: boolean;
  data_processing_consent: boolean;
  consent_date: string;
}

// ===================================================================
// SUBSCRIPTION & BILLING
// ===================================================================

export interface Subscription extends BaseEntity {
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_id: string;
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  billing_cycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  tax_rate?: number;
  discount_id?: string;
  metadata: Record<string, any>;
}

export type SubscriptionStatus = 
  | 'trialing' 
  | 'active' 
  | 'past_due' 
  | 'canceled' 
  | 'unpaid' 
  | 'incomplete';

export interface SubscriptionPlan extends BaseEntity {
  name: string;
  tier: SubscriptionTier;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  features: PlanFeature[];
  limits: PlanLimits;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  is_active: boolean;
  trial_days: number;
  description: string;
  metadata: Record<string, any>;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number;
  description?: string;
}

export interface PlanLimits {
  users: number;
  storage_gb: number;
  api_calls_per_month: number;
  email_sends_per_month: number;
  communities: number;
  custom_domains: number;
  support_level: 'basic' | 'priority' | 'dedicated';
}

export interface Invoice extends BaseEntity {
  user_id: string;
  subscription_id: string;
  stripe_invoice_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  due_date: string;
  paid_at?: string;
  payment_method: string;
  billing_address: BillingAddress;
  line_items: InvoiceLineItem[];
  pdf_url?: string;
  metadata: Record<string, any>;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  period_start?: string;
  period_end?: string;
}

export interface BillingAddress {
  company?: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  tax_id?: string;
}

// ===================================================================
// AUDIT & SECURITY
// ===================================================================

export interface AuditLog extends BaseEntity {
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address: string;
  user_agent: string;
  location?: GeoLocation;
  status: 'success' | 'failure' | 'warning';
  details: Record<string, any>;
  risk_score?: number;
  session_id?: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface SecurityEvent extends BaseEntity {
  user_id?: string;
  event_type: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address: string;
  user_agent: string;
  location?: GeoLocation;
  details: Record<string, any>;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
}

export type SecurityEventType = 
  | 'suspicious_login'
  | 'failed_login_attempts'
  | 'mfa_bypass_attempt'
  | 'unusual_activity'
  | 'data_export'
  | 'admin_action'
  | 'api_abuse';

export interface MFADevice extends BaseEntity {
  user_id: string;
  device_name: string;
  device_type: 'totp' | 'sms' | 'email' | 'backup_codes';
  is_primary: boolean;
  last_used_at?: string;
  backup_codes?: string[];
  phone_number?: string;
  verified: boolean;
}

// ===================================================================
// COMMUNICATION & MARKETING
// ===================================================================

export interface EmailTemplate extends BaseEntity {
  name: string;
  category: EmailTemplateCategory;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  version: number;
  tags: string[];
  metadata: Record<string, any>;
}

export type EmailTemplateCategory = 
  | 'transactional'
  | 'marketing'
  | 'notification'
  | 'welcome'
  | 'billing'
  | 'security';

export interface EmailCampaign extends BaseEntity {
  name: string;
  template_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  status: CampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  target_audience: AudienceFilter;
  statistics: CampaignStatistics;
  metadata: Record<string, any>;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'failed';

export interface AudienceFilter {
  user_roles?: UserRole[];
  subscription_tiers?: SubscriptionTier[];
  tags?: string[];
  custom_query?: string;
  estimated_recipients: number;
}

export interface CampaignStatistics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
  complained: number;
  conversion_count: number;
  conversion_value: number;
}

// ===================================================================
// CONTENT & COMMUNITY
// ===================================================================

export interface Post extends BaseEntity {
  author_id: string;
  community_id?: string;
  title: string;
  content: string;
  content_type: 'text' | 'markdown' | 'html';
  status: ContentStatus;
  visibility: ContentVisibility;
  tags: string[];
  attachments: Attachment[];
  reactions: Reaction[];
  comment_count: number;
  view_count: number;
  featured: boolean;
  pinned: boolean;
  metadata: Record<string, any>;
}

export type ContentStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type ContentVisibility = 'public' | 'private' | 'community' | 'followers';

export interface Community extends BaseEntity {
  name: string;
  description: string;
  slug: string;
  owner_id: string;
  visibility: ContentVisibility;
  member_count: number;
  post_count: number;
  settings: CommunitySettings;
  rules: string[];
  tags: string[];
  banner_url?: string;
  avatar_url?: string;
  metadata: Record<string, any>;
}

export interface CommunitySettings {
  allow_posting: boolean;
  require_approval: boolean;
  allow_comments: boolean;
  allow_reactions: boolean;
  max_post_length: number;
  allowed_file_types: string[];
}

export interface CommunityMembership extends BaseEntity {
  user_id: string;
  community_id: string;
  role: CommunityRole;
  status: MembershipStatus;
  joined_at: string;
  last_activity_at?: string;
}

export type CommunityRole = 'member' | 'moderator' | 'admin' | 'owner';
export type MembershipStatus = 'active' | 'banned' | 'pending' | 'left';

export interface Comment extends BaseEntity {
  post_id: string;
  author_id: string;
  parent_id?: string;
  content: string;
  status: ContentStatus;
  reactions: Reaction[];
  reply_count: number;
  metadata: Record<string, any>;
}

export interface Reaction {
  user_id: string;
  type: ReactionType;
  created_at: string;
}

export type ReactionType = 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';

// ===================================================================
// SUPPORT & TICKETING
// ===================================================================

export interface SupportTicket extends BaseEntity {
  user_id: string;
  assigned_to?: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  tags: string[];
  attachments: Attachment[];
  messages: TicketMessage[];
  resolution?: string;
  resolved_at?: string;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  metadata: Record<string, any>;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general';

export interface TicketMessage extends BaseEntity {
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  attachments: Attachment[];
  metadata: Record<string, any>;
}

// ===================================================================
// FILE MANAGEMENT
// ===================================================================

export interface Attachment extends BaseEntity {
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  bucket: string;
  path: string;
  is_public: boolean;
  metadata: Record<string, any>;
}

// ===================================================================
// ANALYTICS & TRACKING
// ===================================================================

export interface UserEvent extends BaseEntity {
  user_id?: string;
  session_id: string;
  event_name: string;
  properties: Record<string, any>;
  page_url?: string;
  referrer?: string;
  ip_address: string;
  user_agent: string;
  location?: GeoLocation;
  device_info: DeviceInfo;
}

export interface DeviceInfo {
  device_type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  screen_resolution: string;
  viewport_size: string;
}

export interface Analytics {
  period_start: string;
  period_end: string;
  metrics: AnalyticsMetrics;
  breakdowns: AnalyticsBreakdown[];
}

export interface AnalyticsMetrics {
  total_users: number;
  active_users: number;
  new_users: number;
  churned_users: number;
  revenue: number;
  mrr: number;
  arr: number;
  ltv: number;
  churn_rate: number;
  retention_rate: number;
}

export interface AnalyticsBreakdown {
  dimension: string;
  values: Array<{
    key: string;
    value: number;
    percentage: number;
  }>;
}

// ===================================================================
// BACKUP & DATA EXPORT
// ===================================================================

export interface DataExport extends BaseEntity {
  user_id: string;
  export_type: ExportType;
  format: ExportFormat;
  status: ExportStatus;
  file_url?: string;
  file_size?: number;
  expires_at: string;
  requested_data: string[];
  metadata: Record<string, any>;
}

export type ExportType = 'user_data' | 'gdpr_export' | 'backup' | 'analytics';
export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';

export interface BackupJob extends BaseEntity {
  type: BackupType;
  status: BackupStatus;
  file_path: string;
  file_size?: number;
  tables_included: string[];
  retention_days: number;
  encrypted: boolean;
  metadata: Record<string, any>;
}

export type BackupType = 'full' | 'incremental' | 'differential';
export type BackupStatus = 'pending' | 'running' | 'completed' | 'failed' | 'expired';

// ===================================================================
// API & INTEGRATIONS
// ===================================================================

export interface ApiKey extends BaseEntity {
  user_id: string;
  name: string;
  key_hash: string;
  permissions: ApiPermission[];
  rate_limit: number;
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  ip_whitelist?: string[];
  metadata: Record<string, any>;
}

export interface ApiPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface Webhook extends BaseEntity {
  user_id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret: string;
  retry_count: number;
  timeout_seconds: number;
  last_triggered_at?: string;
  success_count: number;
  failure_count: number;
  metadata: Record<string, any>;
}

export interface WebhookDelivery extends BaseEntity {
  webhook_id: string;
  event_type: string;
  payload: Record<string, any>;
  status: DeliveryStatus;
  response_code?: number;
  response_body?: string;
  attempts: number;
  next_retry_at?: string;
  delivered_at?: string;
}

export type DeliveryStatus = 'pending' | 'delivered' | 'failed' | 'abandoned';

// ===================================================================
// SYSTEM & CONFIGURATION
// ===================================================================

export interface SystemSetting extends BaseEntity {
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description?: string;
  is_sensitive: boolean;
  requires_restart: boolean;
}

export interface FeatureFlag extends BaseEntity {
  name: string;
  key: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_audience?: AudienceFilter;
  conditions: Record<string, any>;
  metadata: Record<string, any>;
}

export interface SystemHealth {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  metrics: SystemMetrics;
}

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  response_time: number;
  error_rate: number;
  last_checked: string;
}

export interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  requests_per_minute: number;
  error_rate: number;
}