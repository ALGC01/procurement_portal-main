/**
 * Fake API Layer for Procurement System
 * 
 * This file contains all API functions that would normally communicate with a backend.
 * Currently, they interact with IndexedDB for frontend-only functionality.
 * 
 * TODO: Replace these implementations with actual HTTP calls when backend is ready.
 * Example:
 *   const response = await fetch('/api/requests', { method: 'POST', body: JSON.stringify(data) });
 *   return await response.json();
 */

import { 
  ProcurementRequest, 
  WorkflowAction, 
  Comment, 
  Signature,
  RequestDocument,
  addRequest as dbAddRequest,
  updateRequest as dbUpdateRequest,
  getRequest as dbGetRequest,
  getAllRequests as dbGetAllRequests,
  getRequestsByStep as dbGetRequestsByStep,
  addComment as dbAddComment,
  saveSignature as dbSaveSignature,
  getUserSignatures as dbGetUserSignatures,
} from './newDb';
import { WorkflowStep, getNextStep, getPreviousStep } from './workflowTypes';

// Simulated API delay for realistic behavior
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 300));

/**
 * Create a new procurement request
 * @placeholder POST /api/requests
 */
export const createRequest = async (request: ProcurementRequest): Promise<{ success: boolean; id: string }> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch('/api/requests', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // });
  // return await response.json();
  
  await dbAddRequest(request);
  return { success: true, id: request.id };
};

/**
 * Get all requests (filtered by role/department on backend)
 * @placeholder GET /api/requests
 */
export const fetchAllRequests = async (): Promise<ProcurementRequest[]> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch('/api/requests');
  // return await response.json();
  
  return await dbGetAllRequests();
};

/**
 * Get a single request by ID
 * @placeholder GET /api/requests/:id
 */
export const fetchRequest = async (id: string): Promise<ProcurementRequest | undefined> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/${id}`);
  // return await response.json();
  
  return await dbGetRequest(id);
};

/**
 * Get requests pending approval for a specific workflow step
 * @placeholder GET /api/requests/pending/:step
 */
export const fetchPendingRequests = async (step: WorkflowStep): Promise<ProcurementRequest[]> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/pending/${step}`);
  // return await response.json();
  
  return await dbGetRequestsByStep(step);
};

/**
 * Approve a request and move to next workflow step
 * @placeholder POST /api/requests/:id/approve
 */
export const approveRequest = async (
  requestId: string,
  action: WorkflowAction
): Promise<{ success: boolean; nextStep: WorkflowStep | null }> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/${requestId}/approve`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(action)
  // });
  // return await response.json();
  
  const request = await dbGetRequest(requestId);
  if (!request) return { success: false, nextStep: null };
  
  // Add action to history
  request.workflowHistory.push(action);
  
  // Add comment if provided
  if (action.comment) {
    request.comments.push({
      id: Date.now().toString() + Math.random(),
      userId: action.userId,
      userName: action.userName,
      userRole: action.userRole,
      comment: action.comment,
      timestamp: action.timestamp,
      action: 'approve',
      step: action.step,
    });
  }
  
  // Add documents if provided
  if (action.documents && action.documents.length > 0) {
    request.documents.push(...action.documents);
  }
  
  // Move to next step
  const nextStep = getNextStep(request.currentStep);
  if (nextStep) {
    request.currentStep = nextStep;
  }
  
  request.updatedAt = Date.now();
  await dbUpdateRequest(request);
  
  return { success: true, nextStep };
};

/**
 * Return a request to previous workflow step
 * @placeholder POST /api/requests/:id/return
 */
export const returnRequest = async (
  requestId: string,
  action: WorkflowAction
): Promise<{ success: boolean; previousStep: WorkflowStep | null }> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/${requestId}/return`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(action)
  // });
  // return await response.json();
  
  const request = await dbGetRequest(requestId);
  if (!request) return { success: false, previousStep: null };
  
  // Add action to history
  request.workflowHistory.push(action);
  
  // Add comment (mandatory for return)
  request.comments.push({
    id: Date.now().toString() + Math.random(),
    userId: action.userId,
    userName: action.userName,
    userRole: action.userRole,
    comment: action.comment || 'Returned to previous step',
    timestamp: action.timestamp,
    action: 'return',
    step: action.step,
  });
  
  // Add documents if provided
  if (action.documents && action.documents.length > 0) {
    request.documents.push(...action.documents);
  }
  
  // Move to previous step
  const previousStep = getPreviousStep(request.currentStep);
  if (previousStep) {
    request.currentStep = previousStep;
  }
  
  request.updatedAt = Date.now();
  await dbUpdateRequest(request);
  
  return { success: true, previousStep };
};

/**
 * Add a comment to a request
 * @placeholder POST /api/requests/:id/comments
 */
export const addCommentToRequest = async (
  requestId: string,
  comment: Comment
): Promise<{ success: boolean }> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/requests/${requestId}/comments`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(comment)
  // });
  // return await response.json();
  
  await dbAddComment(requestId, comment);
  return { success: true };
};

/**
 * Save user signature
 * @placeholder POST /api/signatures
 */
export const saveUserSignature = async (signature: Signature): Promise<{ success: boolean }> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch('/api/signatures', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(signature)
  // });
  // return await response.json();
  
  await dbSaveSignature(signature);
  return { success: true };
};

/**
 * Get user's saved signatures
 * @placeholder GET /api/signatures/user/:userId
 */
export const fetchUserSignatures = async (userId: string): Promise<Signature[]> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/signatures/user/${userId}`);
  // return await response.json();
  
  return await dbGetUserSignatures(userId);
};

/**
 * Upload document
 * @placeholder POST /api/documents/upload
 */
export const uploadDocument = async (file: File): Promise<RequestDocument> => {
  await simulateNetworkDelay();
  
  // TODO: Replace with actual file upload
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/documents/upload', {
  //   method: 'POST',
  //   body: formData
  // });
  // return await response.json();
  
  // Simulate file upload by converting to base64
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: e.target?.result as string,
        uploadedAt: Date.now(),
      });
    };
    reader.readAsDataURL(file);
  });
};
