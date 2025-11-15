import React, { useState } from 'react';
import { motion } from 'motion/react';
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

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment);
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Add Comment</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Share your thoughts or feedback on this request
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Textarea
            placeholder="Enter your comment here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
            rows={5}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim()}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
          >
            Submit Comment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
