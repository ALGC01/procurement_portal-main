import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  comment: string;
  timestamp: number;
}

export type RequestStatus = 'pending' | 'approved_hod' | 'approved_principal' | 'approved' | 'rejected';

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
  status: RequestStatus;
  createdBy: string;
  createdByRole: string;
  createdAt: number;
  updatedAt: number;
  comments: Comment[];
  approvals: {
    hod?: { approved: boolean; timestamp: number; userId: string; userName: string };
    principal?: { approved: boolean; timestamp: number; userId: string; userName: string };
    purchaseOfficer?: { approved: boolean; timestamp: number; userId: string; userName: string };
  };
}

interface ProcurementDB extends DBSchema {
  requests: {
    key: string;
    value: ProcurementRequest;
    indexes: { 'by-status': string; 'by-department': string; 'by-date': number };
  };
}

let dbInstance: IDBPDatabase<ProcurementDB> | null = null;

export const getDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ProcurementDB>('procurement-db', 1, {
    upgrade(db) {
      const requestStore = db.createObjectStore('requests', { keyPath: 'id' });
      requestStore.createIndex('by-status', 'status');
      requestStore.createIndex('by-department', 'department');
      requestStore.createIndex('by-date', 'createdAt');
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

export const getRequestsByStatus = async (status: RequestStatus) => {
  const db = await getDB();
  return await db.getAllFromIndex('requests', 'by-status', status);
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
