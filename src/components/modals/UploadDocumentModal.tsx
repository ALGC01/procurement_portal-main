import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { FileUploader } from "../forms/FileUploader";
import { RequestDocument } from "../../lib/db";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (docs: RequestDocument[]) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [docs, setDocs] = useState<RequestDocument[]>([]);

  const handleSubmit = () => {
    if (docs.length === 0) return;

    onUpload(docs);  // send selected files to RequestDetail
    setDocs([]);     // reset uploader
    onClose();
  };

  const handleClose = () => {
    setDocs([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <FileUploader
            documents={docs}
            onChange={(updatedDocs) => setDocs(updatedDocs)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>

          <Button
            className="bg-blue-600 text-white"
            onClick={handleSubmit}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
