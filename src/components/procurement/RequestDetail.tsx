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
import { UploadDocumentModal } from '../modals/UploadDocumentModal';

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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);


  useEffect(() => {
    loadRequest();
  }, [id]);


  const loadRequest = async () => {
    if (!id) return;
    try {
      const req = await getRequest(id);
      setRequest(req || null);
    } catch (error) {
      console.error("Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };


  // ADD COMMENT
  const handleAddComment = async (comment: string) => {
    if (!user || !id) return;

    await addComment(id, {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      comment,
      timestamp: Date.now(),
    });

    toast.success("Comment added");
    loadRequest();
  };


  // APPROVE/REJECT
  const handleApprove = async (comment: string) => {
    if (!request || !user) return;

    const updatedRequest: any = { ...request };

    if (user.role === "hod") {
      updatedRequest.status = "approved_hod";
      updatedRequest.approvals.hod = {
        approved: true,
        timestamp: Date.now(),
        userId: user.id,
        userName: user.name,
      };
    } else if (user.role === "principal") {
      updatedRequest.status = "approved_principal";
      updatedRequest.approvals.principal = {
        approved: true,
        timestamp: Date.now(),
        userId: user.id,
        userName: user.name,
      };
    } else if (user.role === "purchase_officer") {
      updatedRequest.status = "approved";
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

    toast.success("Request approved");
    loadRequest();
  };

  const handleReject = async (comment: string) => {
    if (!request || !user) return;

    const updatedRequest = { ...request };
    updatedRequest.status = "rejected";

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

    toast.success("Request rejected");
    loadRequest();
  };


  // ROLE CHECK
  const canApprove = () => {
    if (!request || !user) return false;

    if (user.role === "hod" && request.status === "pending") return true;
    if (user.role === "principal" && request.status === "approved_hod") return true;
    if (user.role === "purchase_officer" && request.status === "approved_principal") return true;
    if (user.role === "admin") return true;

    return false;
  };

  const canUploadDocument = () => {
    if (!user) return false;
    return ["hod", "principal", "purchase_officer", "admin"].includes(user.role);
  };


  // UPLOAD DOC
  const handleDocumentUpload = async (files: any[]) => {
    if (!request) return;

    const updated = { ...request };

    updated.documents = [...updated.documents, ...files];
    updated.updatedAt = Date.now();

    await updateRequest(updated);

    toast.success("Documents uploaded");
    loadRequest();
  };


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  if (!request) {
    return (
      <Card className="p-12 text-center">
        <h3>Request not found</h3>
        <Button onClick={() => navigate("/requests")}>Back</Button>
      </Card>
    );
  }



  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">

      {/* BACK BUTTON */}
      <Button variant="ghost" onClick={() => navigate("/requests")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Requests
      </Button>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* BASIC DETAILS */}
          <Card className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1>{request.title}</h1>
                <Badge className={statusColors[request.status]}>
                  {statusLabels[request.status]}
                </Badge>
              </div>
            </div>

            {/* MAIN INFO */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex gap-3">
                <Building className="h-5 w-5" />
                <div>
                  <p className="text-sm">Department</p>
                  <p>{request.department}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <User className="h-5 w-5" />
                <div>
                  <p className="text-sm">Requested By</p>
                  <p>{request.createdBy}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="text-sm">Created</p>
                  <p>{formatDate(request.createdAt)}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <FileText className="h-5 w-5" />
                <div>
                  <p className="text-sm">Category</p>
                  <p>{request.category}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div>
                <h3>Description</h3>
                <p>{request.description}</p>
              </div>

              <div>
                <h3>Justification</h3>
                <p>{request.justification}</p>
              </div>
            </div>
          </Card>


          {/* ITEMS */}
          <Card className="p-8">
            <h2>Items</h2>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left">Item Name</th>
                    <th className="px-6 py-4 text-left">Qty</th>
                    <th className="px-6 py-4 text-left">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {request.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">{item.itemName}</td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4">₹{item.approxAmount.toLocaleString()}</td>
                    </tr>
                  ))}

                  <tr className="border-t-2 bg-gray-50">
                    <td className="px-6 py-4" colSpan={2}>
                      Total
                    </td>
                    <td className="px-6 py-4">₹{request.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>


          {/* DOCUMENTS */}
          <Card className="p-8">
            <h2>Documents</h2>

            {request.documents.length === 0 && (
              <p className="text-gray-500 py-4">No documents uploaded yet</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {request.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{doc.name}</p>
                    <p className="text-sm text-gray-600">{(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* UPLOAD DOCUMENT BUTTON (your required location) */}
            {canUploadDocument() && (
              <Button
                className="mt-6 bg-blue-600 text-white rounded-xl"
                onClick={() => setUploadModalOpen(true)}
              >
                Upload New Document
              </Button>
            )}
          </Card>


          {/* COMMENTS */}
          <Card className="p-8">
            <div className="flex justify-between mb-6">
              <h2>Comments</h2>

              <Button className="bg-blue-600 text-white rounded-xl"
                onClick={() => setCommentModalOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
              </Button>
            </div>

            <div className="space-y-4">
              {request.comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No comments yet</p>
              ) : (
                request.comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <div>
                        <p>{c.userName}</p>
                        <p className="text-sm text-gray-500">{c.userRole}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(c.timestamp)}</p>
                    </div>
                    <p className="mt-2">{c.comment}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Quick Actions</h3>

            {canApprove() && request.status !== "rejected" && (
              <Button
                onClick={() => setApprovalModalOpen(true)}
                className="w-full bg-green-600 text-white rounded-xl"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> Review Request
              </Button>
            )}

            <Button variant="outline" onClick={() => setCommentModalOpen(true)} className="w-full mt-3">
              <MessageSquare className="h-4 w-4 mr-2" /> Add Comment
            </Button>
          </Card>


          {/* TIMELINE */}
          <Card className="p-6">
            <h3 className="mb-4">Approval Timeline</h3>

            <div className="space-y-4">
              {/* HOD */}
              <div className="flex gap-3">
                <div className={`p-2 rounded-full ${request.approvals.hod ? "bg-green-100" : "bg-gray-200"}`}>
                  {request.approvals.hod ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-500" />}
                </div>
                <div>
                  <p>HOD Approval</p>
                  <p className="text-sm text-gray-500">
                    {request.approvals.hod ? formatDate(request.approvals.hod.timestamp) : "Pending"}
                  </p>
                </div>
              </div>

              {/* PRINCIPAL */}
              <div className="flex gap-3">
                <div className={`p-2 rounded-full ${request.approvals.principal ? "bg-green-100" : "bg-gray-200"}`}>
                  {request.approvals.principal ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-500" />}
                </div>
                <div>
                  <p>Principal Approval</p>
                  <p className="text-sm text-gray-500">
                    {request.approvals.principal ? formatDate(request.approvals.principal.timestamp) : "Pending"}
                  </p>
                </div>
              </div>

              {/* PURCHASE OFFICER */}
              <div className="flex gap-3">
                <div className={`p-2 rounded-full ${request.approvals.purchaseOfficer ? "bg-green-100" : "bg-gray-200"}`}>
                  {request.approvals.purchaseOfficer ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-gray-500" />}
                </div>
                <div>
                  <p>Purchase Officer</p>
                  <p className="text-sm text-gray-500">
                    {request.approvals.purchaseOfficer ? formatDate(request.approvals.purchaseOfficer.timestamp) : "Pending"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>


      {/* MODALS */}
      <CommentModal isOpen={commentModalOpen} onClose={() => setCommentModalOpen(false)} onSubmit={handleAddComment} />

      <ApprovalModal isOpen={approvalModalOpen} onClose={() => setApprovalModalOpen(false)} onApprove={handleApprove} onReject={handleReject} title="Review Request" />

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
      />

    </motion.div>
  );
};
