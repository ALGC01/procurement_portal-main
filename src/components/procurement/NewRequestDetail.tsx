import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  MessageSquare,
  CheckCircle,
  Clock,
  Download,
  ArrowRight,
} from 'lucide-react';
import { fetchRequest, approveRequest, returnRequest, addCommentToRequest } from '../../lib/api';
import { ProcurementRequest, Signature, RequestDocument, WorkflowAction } from '../../lib/newDb';
import { useAuth } from '../../contexts/AuthContext';
import { CommentModal } from '../modals/CommentModal';
import { WorkflowActionModal } from '../modals/WorkflowActionModal';
import { toast } from 'sonner@2.0.3';
import { WORKFLOW_STEPS, getStepConfig, canUserApproveStep } from '../../lib/workflowTypes';

export const NewRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    if (id) {
      try {
        const req = await fetchRequest(id);
        setRequest(req || null);
      } catch (error) {
        console.error('Failed to load request:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddComment = async (comment: string) => {
    if (id && user) {
      await addCommentToRequest(id, {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        comment,
        timestamp: Date.now(),
        action: 'comment',
      });
      toast.success('Comment added successfully');
      loadRequest();
    }
  };

  const handleApprove = async (comment: string, signature: Signature, documents: RequestDocument[]) => {
    if (!request || !user) return;

    const action: WorkflowAction = {
      step: request.currentStep,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'approve',
      comment,
      signature,
      documents,
      timestamp: Date.now(),
    };

    const result = await approveRequest(request.id, action);
    
    if (result.success) {
      toast.success('Request approved and forwarded successfully');
      loadRequest();
    } else {
      toast.error('Failed to approve request');
    }
  };

  const handleReturn = async (comment: string, documents: RequestDocument[]) => {
    if (!request || !user) return;

    const action: WorkflowAction = {
      step: request.currentStep,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'return',
      comment,
      documents,
      timestamp: Date.now(),
    };

    const result = await returnRequest(request.id, action);
    
    if (result.success) {
      toast.success('Request returned to previous step');
      loadRequest();
    } else {
      toast.error('Failed to return request');
    }
  };

  const canTakeAction = () => {
    if (!request || !user) return false;
    return canUserApproveStep(user.role, request.currentStep);
  };

  const canAttachDocuments = () => {
    return user?.role !== 'principal';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentStepIndex = () => {
    if (!request) return 0;
    const stepConfig = getStepConfig(request.currentStep);
    return stepConfig ? stepConfig.order : 0;
  };

  const getProgressPercentage = () => {
    const current = getCurrentStepIndex();
    const total = WORKFLOW_STEPS.length - 1; // -1 because faculty is 0
    return (current / total) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <Card className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl">
        <h3 className="text-gray-900 dark:text-white mb-4">Request not found</h3>
        <Button onClick={() => navigate('/requests')} className="rounded-xl">
          Go Back
        </Button>
      </Card>
    );
  }

  const currentStepConfig = getStepConfig(request.currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate('/requests')}
        className="mb-6 rounded-xl"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>

      {/* Workflow Progress */}
      <Card className="p-6 mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg border-blue-200 dark:border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-900 dark:text-white mb-1">Workflow Progress</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current Stage: <span className="text-blue-600 dark:text-blue-400">{currentStepConfig?.label}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl text-blue-600 dark:text-blue-400">
              {Math.round(getProgressPercentage())}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
          </div>
        </div>
        <Progress value={getProgressPercentage()} className="h-3" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-gray-900 dark:text-white mb-3">{request.title}</h1>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {currentStepConfig?.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Building className="h-5 w-5" />
                <div>
                  <p className="text-sm">Department</p>
                  <p className="text-gray-900 dark:text-white">{request.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <User className="h-5 w-5" />
                <div>
                  <p className="text-sm">Requested By</p>
                  <p className="text-gray-900 dark:text-white">{request.createdBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm">Created</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(request.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="text-sm">Category</p>
                  <p className="text-gray-900 dark:text-white">{request.category}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{request.description}</p>
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white mb-2">Justification</h3>
                <p className="text-gray-600 dark:text-gray-400">{request.justification}</p>
              </div>
            </div>
          </Card>

          {/* Items Table */}
          <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <h2 className="text-gray-900 dark:text-white mb-6">Items</h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Item Name</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Quantity</th>
                    <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {request.items.map((item, index) => (
                    <tr key={item.id} className={index > 0 ? 'border-t border-gray-200 dark:border-slate-700' : ''}>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.itemName}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{item.quantity}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">₹{item.approxAmount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700">
                    <td colSpan={2} className="px-6 py-4 text-gray-900 dark:text-white">Total</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">₹{request.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Documents */}
          {request.documents.length > 0 && (
            <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
              <h2 className="text-gray-900 dark:text-white mb-6">Attached Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl"
                  >
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(doc.size / 1024).toFixed(1)} KB
                        {doc.uploadedBy && ` • Uploaded by ${doc.uploadedBy}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Comments & History */}
          <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white">Comments & Activity</h2>
              <Button
                onClick={() => setCommentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
                size="sm"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>

            <div className="space-y-4">
              {request.comments.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet</p>
              ) : (
                request.comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 dark:text-white">{comment.userName}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {comment.userRole.replace('_', ' ')}
                          </p>
                          {comment.action && (
                            <Badge
                              variant="outline"
                              className={
                                comment.action === 'approve'
                                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                  : comment.action === 'return'
                                  ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400'
                                  : ''
                              }
                            >
                              {comment.action === 'approve' ? '✓ Approved' : comment.action === 'return' ? '↩ Returned' : '💬 Comment'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.timestamp)}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Buttons */}
          {canTakeAction() && request.currentStep !== 'completed' && (
            <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <Button
                onClick={() => setActionModalOpen(true)}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl mb-3"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Review Request
              </Button>
              <Button
                onClick={() => setCommentModalOpen(true)}
                variant="outline"
                className="w-full rounded-xl"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </Card>
          )}

          {/* Workflow Timeline */}
          <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-white mb-4">Approval Workflow</h3>
            <div className="space-y-3">
              {WORKFLOW_STEPS.slice(1).map((step, index) => {
                const isCompleted = step.order < getCurrentStepIndex();
                const isCurrent = step.order === getCurrentStepIndex();
                const action = request.workflowHistory.find(h => h.step === step.step);

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`p-2 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : isCurrent
                          ? 'bg-blue-100 dark:bg-blue-900/30 animate-pulse'
                          : 'bg-gray-100 dark:bg-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : isCurrent ? (
                        <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white text-sm">{step.label}</p>
                      {action && (
                        <>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {action.action === 'approve' ? '✓ Approved' : '↩ Returned'} by {action.userName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(action.timestamp)}
                          </p>
                        </>
                      )}
                      {isCurrent && !action && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">⏳ Pending Review</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Signatures */}
          {request.workflowHistory.some(h => h.signature) && (
            <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
              <h3 className="text-gray-900 dark:text-white mb-4">Signatures</h3>
              <div className="space-y-4">
                {request.workflowHistory
                  .filter(h => h.signature)
                  .map((history) => (
                    <div key={history.signature!.id} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {history.userName} ({getStepConfig(history.step)?.label})
                      </p>
                      {history.signature!.type === 'type' ? (
                        <p className="text-xl font-serif italic text-gray-900 dark:text-white">
                          {history.signature!.data}
                        </p>
                      ) : (
                        <img
                          src={history.signature!.data}
                          alt="Signature"
                          className="max-h-16 bg-white dark:bg-slate-900 rounded p-2 border border-gray-200 dark:border-slate-700"
                        />
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(history.signature!.timestamp)}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onSubmit={handleAddComment}
      />

      <WorkflowActionModal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        onApprove={handleApprove}
        onReturn={handleReturn}
        title="Review Request"
        canAttachDocuments={canAttachDocuments()}
        userId={user?.id || ''}
        userName={user?.name || ''}
      />
    </motion.div>
  );
};
