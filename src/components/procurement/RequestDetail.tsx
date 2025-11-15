import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building, 
  FileText, 
  MessageSquare,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { getRequest, updateRequest, addComment, ProcurementRequest } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';
import { CommentModal } from '../modals/CommentModal';
import { ApprovalModal } from '../modals/ApprovalModal';
import { toast } from 'sonner@2.0.3';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved_hod: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved_principal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels = {
  pending: 'Pending Review',
  approved_hod: 'Approved by HOD',
  approved_principal: 'Approved by Principal',
  approved: 'Fully Approved',
  rejected: 'Rejected',
};

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<ProcurementRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    if (id) {
      try {
        const req = await getRequest(id);
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
      await addComment(id, {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        comment,
        timestamp: Date.now(),
      });
      toast.success('Comment added successfully');
      loadRequest();
    }
  };

  const handleApprove = async (comment: string) => {
    if (!request || !user) return;

    const updatedRequest = { ...request };
    
    if (user.role === 'hod') {
      updatedRequest.status = 'approved_hod';
      updatedRequest.approvals.hod = {
        approved: true,
        timestamp: Date.now(),
        userId: user.id,
        userName: user.name,
      };
    } else if (user.role === 'principal') {
      updatedRequest.status = 'approved_principal';
      updatedRequest.approvals.principal = {
        approved: true,
        timestamp: Date.now(),
        userId: user.id,
        userName: user.name,
      };
    } else if (user.role === 'purchase_officer') {
      updatedRequest.status = 'approved';
      updatedRequest.approvals.purchaseOfficer = {
        approved: true,
        timestamp: Date.now(),
        userId: user.id,
        userName: user.name,
      };
    }

    if (comment) {
      updatedRequest.comments.push({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        comment,
        timestamp: Date.now(),
      });
    }

    updatedRequest.updatedAt = Date.now();
    await updateRequest(updatedRequest);
    toast.success('Request approved successfully');
    loadRequest();
  };

  const handleReject = async (comment: string) => {
    if (!request || !user) return;

    const updatedRequest = { ...request };
    updatedRequest.status = 'rejected';
    
    if (comment) {
      updatedRequest.comments.push({
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        comment,
        timestamp: Date.now(),
      });
    }

    updatedRequest.updatedAt = Date.now();
    await updateRequest(updatedRequest);
    toast.success('Request rejected');
    loadRequest();
  };

  const canApprove = () => {
    if (!request || !user) return false;
    
    if (user.role === 'hod' && request.status === 'pending') return true;
    if (user.role === 'principal' && request.status === 'approved_hod') return true;
    if (user.role === 'purchase_officer' && request.status === 'approved_principal') return true;
    if (user.role === 'admin') return true;
    
    return false;
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <Button
        variant="ghost"
        onClick={() => navigate('/requests')}
        className="mb-6 rounded-xl"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-gray-900 dark:text-white mb-3">{request.title}</h1>
                <Badge className={statusColors[request.status]}>
                  {statusLabels[request.status]}
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

          {request.documents.length > 0 && (
            <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
              <h2 className="text-gray-900 dark:text-white mb-6">Documents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl"
                  >
                    <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white truncate">{doc.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white">Comments</h2>
              <Button
                onClick={() => setCommentModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
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
                  <div key={comment.id} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-gray-900 dark:text-white">{comment.userName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {comment.userRole.replace('_', ' ')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(comment.timestamp)}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {canApprove() && request.status !== 'rejected' && (
                <Button
                  onClick={() => setApprovalModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review Request
                </Button>
              )}
              <Button
                onClick={() => setCommentModalOpen(true)}
                variant="outline"
                className="w-full rounded-xl"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <h3 className="text-gray-900 dark:text-white mb-4">Approval Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${request.approvals.hod ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                  {request.approvals.hod ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">HOD Approval</p>
                  {request.approvals.hod ? (
                    <>
                      <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.approvals.hod.timestamp)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${request.approvals.principal ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                  {request.approvals.principal ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">Principal Approval</p>
                  {request.approvals.principal ? (
                    <>
                      <p className="text-sm text-green-600 dark:text-green-400">Approved</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.approvals.principal.timestamp)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${request.approvals.purchaseOfficer ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}>
                  {request.approvals.purchaseOfficer ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white">Purchase Officer</p>
                  {request.approvals.purchaseOfficer ? (
                    <>
                      <p className="text-sm text-green-600 dark:text-green-400">Processed</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(request.approvals.purchaseOfficer.timestamp)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <CommentModal
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        onSubmit={handleAddComment}
      />

      <ApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        title="Review Request"
      />
    </motion.div>
  );
};
