import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  PlusCircle,
  Eye
} from 'lucide-react';
import { fetchAllRequests } from '../lib/api';
import { ProcurementRequest } from '../lib/newDb';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/badge';
import { getStepConfig } from '../lib/workflowTypes';

const getStepBadgeColor = (step: string) => {
  if (step === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (step.includes('principal')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const allRequests = await fetchAllRequests();
    
    let filtered = allRequests;
    if (user?.role === 'faculty') {
      filtered = allRequests.filter(r => r.createdBy === user.name);
    } else if (user?.role === 'hod') {
      filtered = allRequests.filter(r => r.department === user.department);
    }

    setRequests(filtered.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5));
    
    setStats({
      total: filtered.length,
      pending: filtered.filter(r => r.currentStep !== 'completed').length,
      approved: filtered.filter(r => r.currentStep === 'completed').length,
      totalAmount: filtered.reduce((sum, r) => sum + r.totalAmount, 0),
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's an overview of your procurement activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <FileText className="h-8 w-8" />
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-blue-100 mb-1">Total Requests</p>
            <h2 className="text-white">{stats.total}</h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8" />
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-yellow-100 mb-1">Pending</p>
            <h2 className="text-white">{stats.pending}</h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8" />
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-green-100 mb-1">Approved</p>
            <h2 className="text-white">{stats.approved}</h2>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-2xl shadow-lg border-0">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">₹</span>
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="text-purple-100 mb-1">Total Amount</p>
            <h2 className="text-white">₹{(stats.totalAmount / 1000).toFixed(0)}K</h2>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-gray-900 dark:text-white">Recent Requests</h2>
              <Button
                variant="ghost"
                onClick={() => navigate('/requests')}
                className="rounded-xl"
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No requests yet</p>
                  {user?.role === 'faculty' && (
                    <Button
                      onClick={() => navigate('/create')}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Request
                    </Button>
                  )}
                </div>
              ) : (
                requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/request/${request.id}`)}
                  >
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white mb-1">{request.title}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getStepBadgeColor(request.currentStep)} variant="secondary">
                          {getStepConfig(request.currentStep)?.label || request.currentStep}
                        </Badge>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-gray-900 dark:text-white">
                        ₹{request.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.items.length} items
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
            <h2 className="text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {user?.role === 'faculty' && (
                <Button
                  onClick={() => navigate('/create')}
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl justify-start"
                >
                  <PlusCircle className="h-5 w-5 mr-3" />
                  Create New Request
                </Button>
              )}
              <Button
                onClick={() => navigate('/requests')}
                variant="outline"
                className="w-full rounded-xl justify-start"
              >
                <FileText className="h-5 w-5 mr-3" />
                View All Requests
              </Button>
              {['hod', 'so', 'po', 'principal', 'payment_officer', 'ao', 'admin'].includes(user?.role || '') && (
                <Button
                  onClick={() => navigate('/approvals')}
                  variant="outline"
                  className="w-full rounded-xl justify-start"
                >
                  <CheckCircle className="h-5 w-5 mr-3" />
                  Pending Approvals
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl border-blue-200 dark:border-blue-700 mt-6">
            <h3 className="text-gray-900 dark:text-white mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Check out our guidelines for creating effective procurement requests
            </p>
            <Button variant="outline" className="w-full rounded-xl">
              View Guidelines
            </Button>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
