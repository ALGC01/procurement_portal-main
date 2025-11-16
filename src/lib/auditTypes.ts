// Audit and Logging Types

export type AuditActionType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'session_expired'
  | 'account_locked'
  | 'account_unlocked'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'otp_generated'
  | 'otp_verified'
  | 'request_created'
  | 'request_updated'
  | 'request_deleted'
  | 'approval_granted'
  | 'approval_returned'
  | 'comment_added'
  | 'document_attached'
  | 'document_deleted'
  | 'signature_added'
  | 'workflow_advanced'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'role_updated'
  | 'department_created'
  | 'department_updated'
  | 'department_deleted'
  | 'budget_updated'
  | 'config_changed';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditMetadata {
  requestId?: string;
  beforeValue?: any;
  afterValue?: any;
  comment?: string;
  documentName?: string;
  documentSize?: number;
  documentHash?: string; // Placeholder for file hash
  signatureType?: 'draw' | 'upload' | 'type';
  workflowStage?: string;
  failureReason?: string;
  targetUserId?: string;
  targetRole?: string;
  configKey?: string;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  timestamp: Date;
  actionType: AuditActionType;
  severity: AuditSeverity;
  userId: string;
  username: string;
  userRole: string;
  metadata: AuditMetadata;
  userAgent?: string;
  ipAddress?: string; // Placeholder for backend
  sessionId?: string;
}

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  actionTypes?: AuditActionType[];
  severities?: AuditSeverity[];
  userIds?: string[];
  roles?: string[];
  requestId?: string;
  searchTerm?: string;
}

export interface ActivitySummary {
  userId: string;
  recentActions: {
    actionType: string;
    timestamp: Date;
    description: string;
  }[];
  totalActions: number;
}

// For append-only log storage (mocked with localStorage/IndexedDB)
export const AUDIT_STORAGE_KEY = 'procurement_audit_logs';
export const AUDIT_INDEX_KEY = 'procurement_audit_index';

// TODO: Backend teams should replace this with WORM/immutable storage
// such as AWS S3 Object Lock, Azure Immutable Blob Storage, or
// database-level append-only tables with triggers preventing updates/deletes
