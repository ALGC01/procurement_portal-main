import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { CheckCircle, ArrowLeft, Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { RequestDocument, Signature } from '../../lib/newDb';
import { SignatureModal } from '../signature/SignatureModal';

interface WorkflowActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (comment: string, signature: Signature, documents: RequestDocument[]) => void;
  onReturn: (comment: string, documents: RequestDocument[]) => void;
  title: string;
  canAttachDocuments: boolean;
  userId: string;
  userName: string;
}

export const WorkflowActionModal: React.FC<WorkflowActionModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReturn,
  title,
  canAttachDocuments,
  userId,
  userName,
}) => {
  const [comment, setComment] = useState('');
  const [documents, setDocuments] = useState<RequestDocument[]>([]);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'return' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const doc: RequestDocument = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: event.target?.result as string,
          uploadedBy: userName,
          uploadedAt: Date.now(),
        };
        setDocuments((prev) => [...prev, doc]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleApprove = () => {
    if (!signature) {
      setActionType('approve');
      setShowSignatureModal(true);
      return;
    }
    onApprove(comment, signature, documents);
    handleClose();
  };

  const handleReturn = () => {
    if (!comment.trim()) {
      return; // Comment is mandatory for return
    }
    onReturn(comment, documents);
    handleClose();
  };

  const handleSignatureSaved = (sig: Signature) => {
    setSignature(sig);
    setShowSignatureModal(false);
    if (actionType === 'approve') {
      onApprove(comment, sig, documents);
      handleClose();
    }
  };

  const handleClose = () => {
    setComment('');
    setDocuments([]);
    setSignature(null);
    setActionType(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Review the request and take action
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="comment" className="text-gray-700 dark:text-gray-300">
                Comments {actionType === 'return' && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="comment"
                placeholder="Add your comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                rows={4}
              />
            </div>

            {canAttachDocuments && (
              <div>
                <Label className="text-gray-700 dark:text-gray-300 mb-2 block">
                  Attach Documents (Optional)
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300"
                >
                  <Upload className="h-8 w-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload documents
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <AnimatePresence>
                  {documents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {documents.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl"
                        >
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                            {doc.type.startsWith('image/') ? (
                              <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white truncate">
                              {doc.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {signature && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-700"
              >
                <p className="text-sm text-green-800 dark:text-green-300 mb-2">
                  ✓ Signature Added
                </p>
                {signature.type === 'type' ? (
                  <p className="text-2xl font-serif italic text-green-900 dark:text-green-100">
                    {signature.data}
                  </p>
                ) : (
                  <img
                    src={signature.data}
                    alt="Signature"
                    className="max-h-20 bg-white dark:bg-slate-800 rounded p-2"
                  />
                )}
              </motion.div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={handleClose} className="rounded-xl w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleReturn}
              disabled={!comment.trim()}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-xl w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Previous
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Forward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSave={handleSignatureSaved}
        userId={userId}
        userName={userName}
      />
    </>
  );
};
