import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ItemTable } from './ItemTable';
import { FileUploader } from './FileUploader';
import { useAuth } from '../../contexts/AuthContext';
import { addRequest } from '../../lib/db';
import { RequestItem, RequestDocument } from '../../lib/db';
import { toast } from 'sonner@2.0.3';

export const RequestForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    department: user?.department || '',
    course: 'UG' as 'UG' | 'PG',
    category: '',
    orderType: '<25000' as '<25000' | '>25000' | '>100000',
    description: '',
    justification: '',
  });

  const [items, setItems] = useState<RequestItem[]>([]);
  const [documents, setDocuments] = useState<RequestDocument[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.department || !formData.category || !formData.description || !formData.justification) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.approxAmount, 0);

      await addRequest({
        id: Date.now().toString(),
        ...formData,
        items,
        documents,
        totalAmount,
        status: 'pending',
        createdBy: user?.name || '',
        createdByRole: user?.role || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        comments: [],
        approvals: {},
      });

      toast.success('Request created successfully!');
      navigate('/requests');
    } catch (error) {
      toast.error('Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">Create New Request</h1>
        <p className="text-gray-600 dark:text-gray-400">Fill in the details to create a procurement request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
          <h2 className="text-gray-900 dark:text-white mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Title *</Label>
              <Input
                id="title"
                placeholder="Enter request title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                required
              />
            </div>

            <div>
              <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">Department *</Label>
              <Input
                id="department"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                required
              />
            </div>

            <div>
              <Label htmlFor="course" className="text-gray-700 dark:text-gray-300">Course *</Label>
              <Select value={formData.course} onValueChange={(value: 'UG' | 'PG') => setFormData({ ...formData, course: value })}>
                <SelectTrigger className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UG">Under Graduate (UG)</SelectItem>
                  <SelectItem value="PG">Post Graduate (PG)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">Category *</Label>
              <Input
                id="category"
                placeholder="e.g., Equipment, Books, Consumables"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                required
              />
            </div>

            <div>
              <Label htmlFor="orderType" className="text-gray-700 dark:text-gray-300">Order Type *</Label>
              <Select 
                value={formData.orderType} 
                onValueChange={(value: '<25000' | '>25000' | '>100000') => setFormData({ ...formData, orderType: value })}
              >
                <SelectTrigger className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="<25000">Less than ₹25,000</SelectItem>
                  <SelectItem value=">25000">₹25,000 - ₹1,00,000</SelectItem>
                  <SelectItem value=">100000">Greater than ₹1,00,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description of the items to be procured"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
              rows={4}
              required
            />
          </div>

          <div className="mt-6">
            <Label htmlFor="justification" className="text-gray-700 dark:text-gray-300">Justification *</Label>
            <Textarea
              id="justification"
              placeholder="Explain why this procurement is necessary"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
              rows={4}
              required
            />
          </div>
        </Card>

        <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
          <h2 className="text-gray-900 dark:text-white mb-6">Items</h2>
          <ItemTable items={items} onChange={setItems} />
        </Card>

        <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
          <h2 className="text-gray-900 dark:text-white mb-6">Documents</h2>
          <FileUploader documents={documents} onChange={setDocuments} />
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/requests')}
            className="rounded-xl px-8"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl px-8 transition-all duration-200 hover:scale-105"
          >
            {loading ? 'Creating...' : 'Create Request'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
