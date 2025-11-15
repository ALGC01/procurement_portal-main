// Workflow Types and Configuration

export type WorkflowStep = 
  | 'faculty'
  | 'hod_1'
  | 'so_1'
  | 'po_1'
  | 'principal_1'
  | 'payment_officer'
  | 'so_2'
  | 'hod_2'
  | 'so_3'
  | 'po_2'
  | 'principal_2'
  | 'ao'
  | 'completed';

export interface WorkflowStepConfig {
  step: WorkflowStep;
  role: string;
  label: string;
  order: number;
}

export const WORKFLOW_STEPS: WorkflowStepConfig[] = [
  { step: 'faculty', role: 'faculty', label: 'Faculty', order: 0 },
  { step: 'hod_1', role: 'hod', label: 'HOD (1st Review)', order: 1 },
  { step: 'so_1', role: 'so', label: 'Store Officer (1st Review)', order: 2 },
  { step: 'po_1', role: 'po', label: 'Purchase Officer (1st Review)', order: 3 },
  { step: 'principal_1', role: 'principal', label: 'Principal (1st Review)', order: 4 },
  { step: 'so_2', role: 'so', label: 'Store Officer (2nd Review)', order: 5 },
  { step: 'hod_2', role: 'hod', label: 'HOD (2nd Review)', order: 6 },
  { step: 'so_3', role: 'so', label: 'Store Officer (3rd Review)', order: 7 },
  { step: 'po_2', role: 'po', label: 'Purchase Officer (2nd Review)', order: 8 },
  { step: 'principal_2', role: 'principal', label: 'Principal (Final Review)', order: 9 },
  { step: 'ao', role: 'ao', label: 'Accountant Officer', order: 10 },
  { step: 'completed', role: '', label: 'Completed', order: 11 },
];

export const getStepByOrder = (order: number): WorkflowStepConfig | undefined => {
  return WORKFLOW_STEPS.find(s => s.order === order);
};

export const getStepConfig = (step: WorkflowStep): WorkflowStepConfig | undefined => {
  return WORKFLOW_STEPS.find(s => s.step === step);
};

export const getNextStep = (currentStep: WorkflowStep): WorkflowStep | null => {
  const current = getStepConfig(currentStep);
  if (!current) return null;
  const next = getStepByOrder(current.order + 1);
  return next ? next.step : null;
};

export const getPreviousStep = (currentStep: WorkflowStep): WorkflowStep | null => {
  const current = getStepConfig(currentStep);
  if (!current || current.order === 0) return null;
  const prev = getStepByOrder(current.order - 1);
  return prev ? prev.step : null;
};

export const canUserApproveStep = (userRole: string, step: WorkflowStep): boolean => {
  const stepConfig = getStepConfig(step);
  if (!stepConfig) return false;
  return stepConfig.role === userRole || userRole === 'admin';
};
