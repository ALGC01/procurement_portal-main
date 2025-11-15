import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WorkflowStep } from './workflowTypes';

export interface RequestItem {
  id: string;
  itemName: string;
  quantity: number;
  approxAmount: number;
}

export interface RequestDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy?: string;
  uploadedAt?: number;
  uploadedAtStep?: WorkflowStep;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: number;
  action?: 'approve' | 'return' | 'comment';
  step?: WorkflowStep;
}

export interface Signature {
  id: string;
  type: 'draw' | 'upload' | 'type';
  data: string; // base64 for draw/upload, text for type
  userId: string;
  userName: string;
  timestamp: number;
}

export interface WorkflowAction {
  step: WorkflowStep;
  userId: string;
  userName: string;
  userRole: string;
  action: 'approve' | 'return';
  comment?: string;
  signature?: Signature;
  documents?: RequestDocument[];
  timestamp: number;
}

export interface ProcurementRequest {
  id: string;
  title: string;
  department: string;
  course: 'UG' | 'PG';
  category: string;
  orderType: '<25000' | '>25000' | '>100000';
  description: string;
  justification: string;
  items: RequestItem[];
  totalAmount: number;
  documents: RequestDocument[];
  currentStep: WorkflowStep;
  createdBy: string;
  createdByRole: string;
  createdAt: number;
  updatedAt: number;
  comments: Comment[];
  workflowHistory: WorkflowAction[];
}

interface ProcurementDB extends DBSchema {
  requests: {
    key: string;
    value: ProcurementRequest;
    indexes: { 'by-step': WorkflowStep; 'by-department': string; 'by-date': number };
  };
  signatures: {
    key: string;
    value: Signature;
    indexes: { 'by-user': string };
  };
}

let dbInstance: IDBPDatabase<ProcurementDB> | null = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ProcurementDB>('procurement-db-v2', 2, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Delete old stores if they exist
      if (db.objectStoreNames.contains('requests')) {
        db.deleteObjectStore('requests');
      }
      
      const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
      requestStore.createIndex('by-step', 'currentStep');
      requestStore.createIndex('by-department', 'department');
      requestStore.createIndex('by-date', 'createdAt');

      if (!db.objectStoreNames.contains('signatures')) {
        const signatureStore = db.createObjectStore('signatures', { keyPath: 'id' });
        signatureStore.createIndex('by-user', 'userId');
      }
    },
  });

  return dbInstance;
};

export const addRequest = async (request: ProcurementRequest) => {
  const db = await getDB();
  await db.add('requests', request);
};

export const updateRequest = async (request: ProcurementRequest) => {
  const db = await getDB();
  await db.put('requests', request);
};

export const getRequest = async (id: string) => {
  const db = await getDB();
  return await db.get('requests', id);
};

export const getAllRequests = async () => {
  const db = await getDB();
  return await db.getAll('requests');
};

export const getRequestsByStep = async (step: WorkflowStep) => {
  const db = await getDB();
  return await db.getAllFromIndex('requests', 'by-step', step);
};

export const deleteRequest = async (id: string) => {
  const db = await getDB();
  await db.delete('requests', id);
};

export const addComment = async (requestId: string, comment: Comment) => {
  const request = await getRequest(requestId);
  if (request) {
    request.comments.push(comment);
    request.updatedAt = Date.now();
    await updateRequest(request);
  }
};

export const saveSignature = async (signature: Signature) => {
  const db = await getDB();
  await db.put('signatures', signature);
};

export const getUserSignatures = async (userId: string) => {
  const db = await getDB();
  return await db.getAllFromIndex('signatures', 'by-user', userId);
};

export const getSignature = async (id: string) => {
  const db = await getDB();
  return await db.get('signatures', id);
};
