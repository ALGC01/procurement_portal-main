import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { RequestDocument } from '../../lib/db';

interface FileUploaderProps {
  documents: RequestDocument[];
  onChange: (documents: RequestDocument[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ documents, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const doc: RequestDocument = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: event.target?.result as string,
        };
        onChange([...documents, doc]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all duration-300"
      >
        <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-900 dark:text-white mb-2">Click to upload documents</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">PDF, DOC, DOCX, or Images</p>
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
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  {doc.type.startsWith('image/') ? (
                    <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 dark:text-white truncate">{doc.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(doc.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
