import React, { useState } from 'react';
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
import { CheckCircle, XCircle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  title: string;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject,
  title 
}) => {
  const [comment, setComment] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(comment);
    } else if (action === 'reject') {
      onReject(comment);
    }
    setComment('');
    setAction(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Review the request and add your comments
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Add your comments (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
            rows={4}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setAction('reject');
              handleSubmit();
            }}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-xl"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => {
              setAction('approve');
              handleSubmit();
            }}
            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-xl"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
