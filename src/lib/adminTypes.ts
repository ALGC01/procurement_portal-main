// Admin and Configuration Types

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  passwordHash?: string; // Never expose to frontend in real app
}

export type UserRole =
  | 'Admin'
  | 'Principal'
  | 'Faculty'
  | 'HOD'
  | 'SO'
  | 'PO_Purchase'
  | 'PO_Payment'
  | 'AO';

export interface Department {
  id: string;
  name: string;
  code: string;
  budgetAllocated: number;
  budgetSpent: number;
  budgetRemaining: number;
  hodId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetConfig {
  id: string;
  departmentId: string;
  fiscalYear: string;
  totalBudget: number;
  allocated: number;
  spent: number;
  reserved: number;
  available: number;
  updatedAt: Date;
  updatedBy: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  order: number;
  role: UserRole;
  roleName: string;
  canAttachDocuments: boolean;
  requiresSignature: boolean;
  autoAdvance: boolean;
}

export interface SystemConfig {
  key: string;
  value: any;
  description: string;
  category: 'auth' | 'workflow' | 'budget' | 'general';
  updatedAt: Date;
  updatedBy: string;
}

export const DEFAULT_WORKFLOW_STEPS: WorkflowStep[] = [
  { order: 1, role: 'Faculty', roleName: 'Faculty', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 2, role: 'HOD', roleName: 'HOD', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 3, role: 'SO', roleName: 'Store Officer (1st)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 4, role: 'PO_Purchase', roleName: 'Purchase Officer (1st)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 5, role: 'Principal', roleName: 'Principal (1st)', canAttachDocuments: false, requiresSignature: true, autoAdvance: false },
  { order: 6, role: 'PO_Payment', roleName: 'Payment Officer', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 7, role: 'SO', roleName: 'Store Officer (2nd)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 8, role: 'HOD', roleName: 'HOD (2nd)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 9, role: 'SO', roleName: 'Store Officer (3rd)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 10, role: 'PO_Purchase', roleName: 'Purchase Officer (2nd)', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
  { order: 11, role: 'Principal', roleName: 'Principal (2nd)', canAttachDocuments: false, requiresSignature: true, autoAdvance: false },
  { order: 12, role: 'AO', roleName: 'Accountant Officer', canAttachDocuments: true, requiresSignature: true, autoAdvance: false },
];
