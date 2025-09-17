// ===================================================================
// SERVICE LAYER
// Business logic abstraction for backend integration
// Universal service classes for all SaaS features
// ===================================================================

import { apiClient } from '@/hooks/useApi';
import type { 
  ApiResponse, AuthApi, UsersApi, BillingApi, CommunityApi,
  SupportApi, EmailApi, AnalyticsApi, FilesApi, AuditApi,
  DataApi, ApiManagementApi, SystemApi
} from '@/types/api';
import type {
  User, Subscription, SubscriptionPlan, Post, Community,
  SupportTicket, EmailTemplate, EmailCampaign, Attachment,
  AuditLog, SecurityEvent, DataExport, BackupJob, ApiKey,
  Webhook, FeatureFlag, SystemHealth
} from '@/types/database';

// ===================================================================
// AUTHENTICATION SERVICE
// ===================================================================

export class AuthService {
  static async login(credentials: AuthApi.LoginRequest): Promise<AuthApi.LoginResponse> {
    const response = await apiClient.post<AuthApi.LoginResponse>('/auth/login', credentials);
    
    if (response.data?.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    return response.data!;
  }

  static async register(userData: AuthApi.RegisterRequest): Promise<AuthApi.RegisterResponse> {
    const response = await apiClient.post<AuthApi.RegisterResponse>('/auth/register', userData);
    return response.data!;
  }

  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  static async refreshToken(): Promise<AuthApi.RefreshResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    const response = await apiClient.post<AuthApi.RefreshResponse>('/auth/refresh', {
      refresh_token: refreshToken
    });

    if (response.data?.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }

    return response.data!;
  }

  static async getCurrentUser(): Promise<AuthApi.MeResponse> {
    const response = await apiClient.get<AuthApi.MeResponse>('/auth/me');
    return response.data!;
  }

  static async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  static async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  }

  static async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  static async setupMFA(): Promise<AuthApi.MfaSetupResponse> {
    const response = await apiClient.post<AuthApi.MfaSetupResponse>('/auth/mfa/setup');
    return response.data!;
  }

  static async verifyMFA(code: string): Promise<void> {
    await apiClient.post('/auth/mfa/verify', { code });
  }
}

// ===================================================================
// USER MANAGEMENT SERVICE
// ===================================================================

export class UserService {
  static async getUsers(params?: UsersApi.ListUsersParams): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users', params);
    return response.data!;
  }

  static async getUser(id: string): Promise<UsersApi.GetUserResponse> {
    const response = await apiClient.get<UsersApi.GetUserResponse>(`/users/${id}`);
    return response.data!;
  }

  static async updateUser(id: string, updates: UsersApi.UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, updates);
    return response.data!;
  }

  static async deleteUser(id: string, options?: UsersApi.DeleteUserRequest): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  static async impersonateUser(id: string, reason: string): Promise<UsersApi.ImpersonateResponse> {
    const response = await apiClient.post<UsersApi.ImpersonateResponse>(`/users/${id}/impersonate`, { reason });
    return response.data!;
  }
}

// ===================================================================
// BILLING & SUBSCRIPTION SERVICE
// ===================================================================

export class BillingService {
  static async getPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<BillingApi.ListPlansResponse>('/billing/plans');
    return response.data!.plans;
  }

  static async getSubscription(): Promise<BillingApi.GetSubscriptionResponse> {
    const response = await apiClient.get<BillingApi.GetSubscriptionResponse>('/billing/subscription');
    return response.data!;
  }

  static async createCheckout(request: BillingApi.CreateCheckoutRequest): Promise<string> {
    const response = await apiClient.post<BillingApi.CreateCheckoutResponse>('/billing/checkout', request);
    return response.data!.checkout_url;
  }

  static async createCustomerPortal(): Promise<string> {
    const response = await apiClient.post<BillingApi.CreatePortalResponse>('/billing/portal');
    return response.data!.portal_url;
  }

  static async changeSubscription(planId: string, billingCycle?: 'monthly' | 'yearly'): Promise<void> {
    await apiClient.post('/billing/subscription/change', { plan_id: planId, billing_cycle: billingCycle });
  }

  static async cancelSubscription(reason?: string, immediately = false): Promise<void> {
    await apiClient.post('/billing/subscription/cancel', { reason, cancel_immediately: immediately });
  }

  static async getInvoices(params?: BillingApi.ListInvoicesParams) {
    const response = await apiClient.get('/billing/invoices', params);
    return response.data!;
  }

  static async downloadInvoice(invoiceId: string): Promise<string> {
    const response = await apiClient.get<BillingApi.DownloadInvoiceResponse>(`/billing/invoices/${invoiceId}/download`);
    return response.data!.download_url;
  }
}

// ===================================================================
// COMMUNITY SERVICE
// ===================================================================

export class CommunityService {
  static async getCommunities(params?: CommunityApi.ListCommunitiesParams): Promise<Community[]> {
    const response = await apiClient.get<Community[]>('/communities', params);
    return response.data!;
  }

  static async createCommunity(data: CommunityApi.CreateCommunityRequest): Promise<Community> {
    const response = await apiClient.post<Community>('/communities', data);
    return response.data!;
  }

  static async updateCommunity(id: string, updates: CommunityApi.UpdateCommunityRequest): Promise<Community> {
    const response = await apiClient.put<Community>(`/communities/${id}`, updates);
    return response.data!;
  }

  static async joinCommunity(id: string, message?: string): Promise<void> {
    await apiClient.post(`/communities/${id}/join`, { message });
  }

  static async leaveCommunity(id: string): Promise<void> {
    await apiClient.delete(`/communities/${id}/members/me`);
  }

  static async getMembers(communityId: string, params?: CommunityApi.ListMembersParams) {
    const response = await apiClient.get(`/communities/${communityId}/members`, params);
    return response.data!;
  }

  static async updateMember(communityId: string, userId: string, updates: CommunityApi.UpdateMemberRequest): Promise<void> {
    await apiClient.put(`/communities/${communityId}/members/${userId}`, updates);
  }

  static async getPosts(params?: CommunityApi.ListPostsParams): Promise<Post[]> {
    const response = await apiClient.get<Post[]>('/posts', params);
    return response.data!;
  }

  static async createPost(data: CommunityApi.CreatePostRequest): Promise<Post> {
    const response = await apiClient.post<Post>('/posts', data);
    return response.data!;
  }

  static async updatePost(id: string, updates: CommunityApi.UpdatePostRequest): Promise<Post> {
    const response = await apiClient.put<Post>(`/posts/${id}`, updates);
    return response.data!;
  }

  static async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  }

  static async reactToPost(id: string, type: string): Promise<void> {
    await apiClient.post(`/posts/${id}/react`, { type });
  }

  static async getComments(postId: string, params?: CommunityApi.ListCommentsParams) {
    const response = await apiClient.get(`/posts/${postId}/comments`, params);
    return response.data!;
  }

  static async createComment(postId: string, data: CommunityApi.CreateCommentRequest) {
    const response = await apiClient.post(`/posts/${postId}/comments`, data);
    return response.data!;
  }
}

// ===================================================================
// SUPPORT SERVICE
// ===================================================================

export class SupportService {
  static async getTickets(params?: SupportApi.ListTicketsParams): Promise<SupportTicket[]> {
    const response = await apiClient.get<SupportTicket[]>('/tickets', params);
    return response.data!;
  }

  static async createTicket(data: SupportApi.CreateTicketRequest): Promise<SupportTicket> {
    const response = await apiClient.post<SupportTicket>('/tickets', data);
    return response.data!;
  }

  static async updateTicket(id: string, updates: SupportApi.UpdateTicketRequest): Promise<SupportTicket> {
    const response = await apiClient.put<SupportTicket>(`/tickets/${id}`, updates);
    return response.data!;
  }

  static async addMessage(ticketId: string, data: SupportApi.CreateTicketMessageRequest) {
    const response = await apiClient.post(`/tickets/${ticketId}/messages`, data);
    return response.data!;
  }

  static async resolveTicket(id: string, resolution: string): Promise<void> {
    await apiClient.post(`/tickets/${id}/resolve`, { resolution });
  }

  static async rateTicket(id: string, rating: number, feedback?: string): Promise<void> {
    await apiClient.post(`/tickets/${id}/rate`, { rating, feedback });
  }
}

// ===================================================================
// EMAIL & MARKETING SERVICE
// ===================================================================

export class EmailService {
  static async getTemplates(params?: EmailApi.ListTemplatesParams): Promise<EmailTemplate[]> {
    const response = await apiClient.get<EmailTemplate[]>('/email/templates', params);
    return response.data!;
  }

  static async createTemplate(data: EmailApi.CreateTemplateRequest): Promise<EmailTemplate> {
    const response = await apiClient.post<EmailTemplate>('/email/templates', data);
    return response.data!;
  }

  static async sendEmail(data: EmailApi.SendEmailRequest): Promise<void> {
    await apiClient.post('/email/send', data);
  }

  static async getCampaigns(params?: EmailApi.ListCampaignsParams): Promise<EmailCampaign[]> {
    const response = await apiClient.get<EmailCampaign[]>('/email/campaigns', params);
    return response.data!;
  }

  static async createCampaign(data: EmailApi.CreateCampaignRequest): Promise<EmailCampaign> {
    const response = await apiClient.post<EmailCampaign>('/email/campaigns', data);
    return response.data!;
  }

  static async sendCampaign(id: string, testEmail?: string): Promise<void> {
    await apiClient.post(`/email/campaigns/${id}/send`, { test_email: testEmail });
  }

  static async getCampaignStats(id: string): Promise<EmailApi.GetCampaignStatsResponse> {
    const response = await apiClient.get<EmailApi.GetCampaignStatsResponse>(`/email/campaigns/${id}/stats`);
    return response.data!;
  }
}

// ===================================================================
// ANALYTICS SERVICE
// ===================================================================

export class AnalyticsService {
  static async getOverview(params: AnalyticsApi.GetOverviewParams): Promise<AnalyticsApi.GetOverviewResponse> {
    const response = await apiClient.get<AnalyticsApi.GetOverviewResponse>('/analytics/overview', params);
    return response.data!;
  }

  static async getUserAnalytics(): Promise<AnalyticsApi.GetUserAnalyticsResponse> {
    const response = await apiClient.get<AnalyticsApi.GetUserAnalyticsResponse>('/analytics/users');
    return response.data!;
  }

  static async getRevenueAnalytics(): Promise<AnalyticsApi.GetRevenueAnalyticsResponse> {
    const response = await apiClient.get<AnalyticsApi.GetRevenueAnalyticsResponse>('/analytics/revenue');
    return response.data!;
  }

  static async trackEvent(data: AnalyticsApi.TrackEventRequest): Promise<void> {
    await apiClient.post('/analytics/events', data);
  }
}

// ===================================================================
// FILE MANAGEMENT SERVICE
// ===================================================================

export class FileService {
  static async uploadFile(file: File, options?: Partial<FilesApi.UploadFileRequest>): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.bucket) formData.append('bucket', options.bucket);
    if (options?.path) formData.append('path', options.path);
    if (options?.is_public !== undefined) formData.append('is_public', String(options.is_public));
    if (options?.metadata) formData.append('metadata', JSON.stringify(options.metadata));

    const response = await apiClient.request<FilesApi.UploadFileResponse>('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
    });

    return response.data!.attachment;
  }

  static async getFiles(params?: FilesApi.ListFilesParams): Promise<Attachment[]> {
    const response = await apiClient.get<Attachment[]>('/files', params);
    return response.data!;
  }

  static async deleteFile(id: string, permanent = false): Promise<void> {
    await apiClient.delete(`/files/${id}?permanent=${permanent}`);
  }

  static async generateUrl(id: string, options?: FilesApi.GenerateUrlRequest): Promise<string> {
    const response = await apiClient.post<FilesApi.GenerateUrlResponse>(`/files/${id}/generate-url`, options);
    return response.data!.url;
  }
}

// ===================================================================
// AUDIT & SECURITY SERVICE
// ===================================================================

export class AuditService {
  static async getLogs(params?: AuditApi.ListAuditLogsParams): Promise<AuditLog[]> {
    const response = await apiClient.get<AuditLog[]>('/audit/logs', params);
    return response.data!;
  }

  static async getSecurityEvents(params?: AuditApi.ListSecurityEventsParams): Promise<SecurityEvent[]> {
    const response = await apiClient.get<SecurityEvent[]>('/audit/security-events', params);
    return response.data!;
  }

  static async resolveSecurityEvent(id: string, notes?: string): Promise<void> {
    await apiClient.put(`/audit/security-events/${id}/resolve`, { resolution_notes: notes });
  }

  static async exportAuditLogs(request: AuditApi.ExportAuditRequest): Promise<string> {
    const response = await apiClient.get<AuditApi.ExportAuditResponse>('/audit/export', request);
    return response.data!.download_url;
  }
}

// ===================================================================
// DATA EXPORT & BACKUP SERVICE
// ===================================================================

export class DataService {
  static async createExport(request: DataApi.CreateExportRequest): Promise<string> {
    const response = await apiClient.post<DataApi.CreateExportResponse>('/data/export', request);
    return response.data!.export_id;
  }

  static async getExports(params?: DataApi.ListExportsParams): Promise<DataExport[]> {
    const response = await apiClient.get<DataExport[]>('/data/exports', params);
    return response.data!;
  }

  static async downloadExport(id: string): Promise<string> {
    const response = await apiClient.get<DataApi.DownloadExportResponse>(`/data/exports/${id}/download`);
    return response.data!.download_url;
  }

  static async createBackup(request: DataApi.CreateBackupRequest): Promise<void> {
    await apiClient.post('/data/backup', request);
  }

  static async getBackups(params?: DataApi.ListBackupsParams): Promise<BackupJob[]> {
    const response = await apiClient.get<BackupJob[]>('/data/backups', params);
    return response.data!;
  }

  static async restoreBackup(request: DataApi.RestoreBackupRequest): Promise<DataApi.RestoreBackupResponse> {
    const response = await apiClient.post<DataApi.RestoreBackupResponse>('/data/restore', request);
    return response.data!;
  }
}

// ===================================================================
// API MANAGEMENT SERVICE
// ===================================================================

export class ApiManagementService {
  static async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get<ApiManagementApi.ListApiKeysResponse>('/api/keys');
    return response.data!.keys.map(key => ({
      ...key,
      key_hash: 'legacy_key'
    }));
  }

  static async createApiKey(request: ApiManagementApi.CreateApiKeyRequest): Promise<{ key: ApiKey; secret: string }> {
    const response = await apiClient.post<ApiManagementApi.CreateApiKeyResponse>('/api/keys', request);
    return { key: response.data!.key, secret: response.data!.secret_key };
  }

  static async updateApiKey(id: string, updates: ApiManagementApi.UpdateApiKeyRequest): Promise<ApiKey> {
    const response = await apiClient.put<ApiKey>(`/api/keys/${id}`, updates);
    return response.data!;
  }

  static async regenerateApiKey(id: string): Promise<string> {
    const response = await apiClient.post<ApiManagementApi.RegenerateApiKeyResponse>(`/api/keys/${id}/regenerate`);
    return response.data!.secret_key;
  }

  static async deleteApiKey(id: string): Promise<void> {
    await apiClient.delete(`/api/keys/${id}`);
  }

  static async getWebhooks(): Promise<Webhook[]> {
    const response = await apiClient.get<ApiManagementApi.ListWebhooksResponse>('/api/webhooks');
    return response.data!.webhooks;
  }

  static async createWebhook(request: ApiManagementApi.CreateWebhookRequest): Promise<Webhook> {
    const response = await apiClient.post<Webhook>('/api/webhooks', request);
    return response.data!;
  }

  static async testWebhook(id: string, request: ApiManagementApi.TestWebhookRequest): Promise<ApiManagementApi.TestWebhookResponse> {
    const response = await apiClient.post<ApiManagementApi.TestWebhookResponse>(`/api/webhooks/${id}/test`, request);
    return response.data!;
  }
}

// ===================================================================
// SYSTEM & ADMIN SERVICE
// ===================================================================

export class SystemService {
  static async getHealth(): Promise<SystemHealth> {
    const response = await apiClient.get<SystemApi.GetHealthResponse>('/system/health');
    return response.data!;
  }

  static async getSettings(params?: SystemApi.ListSettingsParams) {
    const response = await apiClient.get('/system/settings', params);
    return response.data!;
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    await apiClient.put(`/system/settings/${key}`, { value });
  }

  static async getFeatureFlags(): Promise<FeatureFlag[]> {
    const response = await apiClient.get<SystemApi.ListFeatureFlagsResponse>('/system/feature-flags');
    return response.data!.flags;
  }

  static async updateFeatureFlag(key: string, updates: SystemApi.UpdateFeatureFlagRequest): Promise<void> {
    await apiClient.put(`/system/feature-flags/${key}`, updates);
  }

  static async scheduleMaintenance(request: SystemApi.ScheduleMaintenanceRequest): Promise<void> {
    await apiClient.post('/system/maintenance', request);
  }
}

// ===================================================================
// STRIPE INTEGRATION SERVICE
// ===================================================================

export class StripeService {
  static async createPaymentIntent(amount: number, currency = 'usd', metadata?: Record<string, string>) {
    const response = await apiClient.post('/stripe/payment-intents', {
      amount,
      currency,
      metadata,
    });
    return response.data!;
  }

  static async createSetupIntent(customerId?: string) {
    const response = await apiClient.post('/stripe/setup-intents', {
      customer_id: customerId,
    });
    return response.data!;
  }

  static async getPaymentMethods(customerId: string) {
    const response = await apiClient.get(`/stripe/customers/${customerId}/payment-methods`);
    return response.data!;
  }

  static async detachPaymentMethod(paymentMethodId: string) {
    await apiClient.delete(`/stripe/payment-methods/${paymentMethodId}`);
  }

  static async createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
    const response = await apiClient.post('/stripe/customers', {
      email,
      name,
      metadata,
    });
    return response.data!;
  }

  static async updateCustomer(customerId: string, updates: Record<string, any>) {
    const response = await apiClient.put(`/stripe/customers/${customerId}`, updates);
    return response.data!;
  }
}

// ===================================================================
// EXPORT ALL SERVICES
// ===================================================================

const services = {
  auth: AuthService,
  users: UserService,
  billing: BillingService,
  community: CommunityService,
  support: SupportService,
  email: EmailService,
  analytics: AnalyticsService,
  files: FileService,
  audit: AuditService,
  data: DataService,
  apiManagement: ApiManagementService,
  system: SystemService,
  stripe: StripeService,
};

export default services;

// Export apiClient for use in other services
export { apiClient };

// Individual exports for convenience
export {
  AuthService as Auth,
  UserService as Users,
  BillingService as Billing,
  CommunityService as Community,
  SupportService as Support,
  EmailService as Email,
  AnalyticsService as Analytics,
  FileService as Files,
  AuditService as Audit,
  DataService as Data,
  ApiManagementService as ApiManagement,
  SystemService as System,
  StripeService as Stripe,
};