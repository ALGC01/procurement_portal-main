import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Pen, Upload, Type, Trash2 } from 'lucide-react';
import { Signature } from '../../lib/newDb';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: Signature) => void;
  userId: string;
  userName: string;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userId,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'upload' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  // ⭐ FIXED: Correct scaling for perfect drawing alignment
  const getScaledCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getScaledCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getScaledCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    let signatureData = '';
    let type: 'draw' | 'upload' | 'type' = activeTab;

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        signatureData = canvas.toDataURL();
      }
    } else if (activeTab === 'upload') {
      signatureData = uploadedImage || '';
    } else if (activeTab === 'type') {
      signatureData = typedSignature;
    }

    if (!signatureData) return;

    const signature: Signature = {
      id: Date.now().toString() + Math.random(),
      type,
      data: signatureData,
      userId,
      userName,
      timestamp: Date.now(),
    };

    onSave(signature);
    handleClose();
  };

  const handleClose = () => {
    setTypedSignature('');
    setUploadedImage(null);
    clearCanvas();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Create Your Signature</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Draw, upload, or type your signature
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="type" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Type
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <Button
              variant="outline"
              onClick={clearCanvas}
              className="w-full rounded-xl"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center">
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Signature"
                    className="max-h-40 mx-auto"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUploadedImage(null)}
                    className="rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <Label htmlFor="signature-upload" className="cursor-pointer">
                    <span className="text-blue-600 dark:text-blue-400 hover:underline">
                      Click to upload
                    </span>
                    <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                  </Label>
                  <Input
                    id="signature-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-4">
            <div>
              <Label htmlFor="typed-signature" className="text-gray-700 dark:text-gray-300">
                Type your full name
              </Label>
              <Input
                id="typed-signature"
                placeholder="Enter your name"
                value={typedSignature}
                onChange={(e) => setTypedSignature(e.target.value)}
                className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>
            {typedSignature && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 p-8 rounded-xl text-center border-2 border-gray-200 dark:border-slate-600">
                <p className="text-4xl font-serif italic text-blue-900 dark:text-blue-100">
                  {typedSignature}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              (activeTab === 'draw' && !canvasRef.current) ||
              (activeTab === 'upload' && !uploadedImage) ||
              (activeTab === 'type' && !typedSignature)
            }
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
          >
            Save Signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
