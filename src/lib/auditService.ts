// Audit Logging Service - Append-Only Mock Implementation

import {
  AuditLog,
  AuditActionType,
  AuditSeverity,
  AuditMetadata,
  AuditLogFilter,
  ActivitySummary,
  AUDIT_STORAGE_KEY,
  AUDIT_INDEX_KEY,
} from './auditTypes';

// TODO: Backend integration - Replace localStorage with backend API calls
// This mock implementation uses localStorage to simulate append-only logs
// In production, use:
// - Backend REST API or GraphQL mutations
// - WORM (Write Once Read Many) storage like AWS S3 Object Lock
// - Immutable database tables with triggers preventing updates/deletes
// - Event sourcing patterns
// - Blockchain-based audit trails for maximum security

class AuditService {
  private storageKey = AUDIT_STORAGE_KEY;
  private indexKey = AUDIT_INDEX_KEY;

  // Create a new audit log entry (append-only)
  async log(
    actionType: AuditActionType,
    userId: string,
    username: string,
    userRole: string,
    metadata: AuditMetadata = {},
    severity: AuditSeverity = 'info'
  ): Promise<AuditLog> {
    const logEntry: AuditLog = {
      id: this.generateId(),
      timestamp: new Date(),
      actionType,
      severity,
      userId,
      username,
      userRole,
      metadata,
      userAgent: this.getUserAgent(),
      ipAddress: 'PLACEHOLDER_IP', // TODO: Backend should capture real IP
      sessionId: this.getSessionId(),
    };

    // Append to storage (simulating append-only behavior)
    await this.appendLog(logEntry);

    // Update search index for faster filtering
    await this.updateIndex(logEntry);

    return logEntry;
  }

  // Get all logs (Admin/Principal only - enforce in calling code)
  async getAllLogs(filter?: AuditLogFilter): Promise<AuditLog[]> {
    const logs = await this.readAllLogs();
    
    if (!filter) {
      return logs;
    }

    return this.filterLogs(logs, filter);
  }

  // Get activity summary for non-admin users
  async getActivitySummary(userId: string): Promise<ActivitySummary> {
    const logs = await this.readAllLogs();
    const userLogs = logs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Last 10 actions

    const recentActions = userLogs.map(log => ({
      actionType: this.getActionTypeLabel(log.actionType),
      timestamp: new Date(log.timestamp),
      description: this.getActionDescription(log),
    }));

    return {
      userId,
      recentActions,
      totalActions: userLogs.length,
    };
  }

  // Export logs as JSON
  async exportAsJSON(filter?: AuditLogFilter): Promise<string> {
    const logs = await this.getAllLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  // Export logs as CSV
  async exportAsCSV(filter?: AuditLogFilter): Promise<string> {
    const logs = await this.getAllLogs(filter);
    
    if (logs.length === 0) {
      return 'No data to export';
    }

    const headers = [
      'Timestamp',
      'Action Type',
      'Severity',
      'User ID',
      'Username',
      'Role',
      'Request ID',
      'Description',
      'Session ID',
    ];

    const rows = logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.actionType,
      log.severity,
      log.userId,
      log.username,
      log.userRole,
      log.metadata.requestId || '',
      this.getActionDescription(log),
      log.sessionId || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  // Private helper methods

  private async appendLog(log: AuditLog): Promise<void> {
    try {
      const logs = await this.readAllLogs();
      logs.push(log);
      localStorage.setItem(this.storageKey, JSON.stringify(logs));
      
      // TODO: Backend - Send to immutable storage
      // await fetch('/api/audit/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(log),
      // });
    } catch (error) {
      console.error('Failed to append audit log:', error);
      // In production, this should trigger alerts
    }
  }

  private async readAllLogs(): Promise<AuditLog[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const logs = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return logs.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    } catch (error) {
      console.error('Failed to read audit logs:', error);
      return [];
    }
  }

  private async updateIndex(log: AuditLog): Promise<void> {
    // Simple indexing by date and user for faster lookups
    // In production, use proper database indexes
    try {
      const indexData = localStorage.getItem(this.indexKey);
      const index = indexData ? JSON.parse(indexData) : {};
      
      const dateKey = new Date(log.timestamp).toISOString().split('T')[0];
      if (!index[dateKey]) {
        index[dateKey] = [];
      }
      index[dateKey].push(log.id);
      
      localStorage.setItem(this.indexKey, JSON.stringify(index));
    } catch (error) {
      console.error('Failed to update audit index:', error);
    }
  }

  private filterLogs(logs: AuditLog[], filter: AuditLogFilter): AuditLog[] {
    return logs.filter(log => {
      // Date range filter
      if (filter.startDate && new Date(log.timestamp) < new Date(filter.startDate)) {
        return false;
      }
      if (filter.endDate && new Date(log.timestamp) > new Date(filter.endDate)) {
        return false;
      }

      // Action type filter
      if (filter.actionTypes && filter.actionTypes.length > 0) {
        if (!filter.actionTypes.includes(log.actionType)) {
          return false;
        }
      }

      // Severity filter
      if (filter.severities && filter.severities.length > 0) {
        if (!filter.severities.includes(log.severity)) {
          return false;
        }
      }

      // User filter
      if (filter.userIds && filter.userIds.length > 0) {
        if (!filter.userIds.includes(log.userId)) {
          return false;
        }
      }

      // Role filter
      if (filter.roles && filter.roles.length > 0) {
        if (!filter.roles.includes(log.userRole)) {
          return false;
        }
      }

      // Request ID filter
      if (filter.requestId && log.metadata.requestId !== filter.requestId) {
        return false;
      }

      // Search term filter
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        const searchableText = [
          log.actionType,
          log.username,
          log.userRole,
          JSON.stringify(log.metadata),
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  private getActionTypeLabel(actionType: AuditActionType): string {
    const labels: Record<AuditActionType, string> = {
      login_success: 'Login Successful',
      login_failed: 'Login Failed',
      logout: 'Logout',
      session_expired: 'Session Expired',
      account_locked: 'Account Locked',
      account_unlocked: 'Account Unlocked',
      password_reset_requested: 'Password Reset Requested',
      password_reset_completed: 'Password Reset Completed',
      otp_generated: 'OTP Generated',
      otp_verified: 'OTP Verified',
      request_created: 'Request Created',
      request_updated: 'Request Updated',
      request_deleted: 'Request Deleted',
      approval_granted: 'Approval Granted',
      approval_returned: 'Approval Returned',
      comment_added: 'Comment Added',
      document_attached: 'Document Attached',
      document_deleted: 'Document Deleted',
      signature_added: 'Signature Added',
      workflow_advanced: 'Workflow Advanced',
      user_created: 'User Created',
      user_updated: 'User Updated',
      user_deleted: 'User Deleted',
      role_updated: 'Role Updated',
      department_created: 'Department Created',
      department_updated: 'Department Updated',
      department_deleted: 'Department Deleted',
      budget_updated: 'Budget Updated',
      config_changed: 'Configuration Changed',
    };
    return labels[actionType] || actionType;
  }

  private getActionDescription(log: AuditLog): string {
    const { actionType, metadata } = log;

    switch (actionType) {
      case 'approval_granted':
        return `Approved request ${metadata.requestId} at stage ${metadata.workflowStage}`;
      case 'approval_returned':
        return `Returned request ${metadata.requestId} to previous stage`;
      case 'document_attached':
        return `Attached document: ${metadata.documentName}`;
      case 'login_failed':
        return `Login failed: ${metadata.failureReason}`;
      case 'user_created':
        return `Created user: ${metadata.targetUserId}`;
      default:
        return this.getActionTypeLabel(actionType);
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserAgent(): string {
    return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  private getSessionId(): string {
    // Get from session storage or auth context
    return sessionStorage.getItem('sessionId') || 'unknown';
  }
}

// Singleton instance
export const auditService = new AuditService();
