import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Eye, Calendar, DollarSign } from 'lucide-react';
import { getAllRequests, ProcurementRequest } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved_hod: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved_principal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

export const Approvals: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const allRequests = await getAllRequests();
      let filtered: ProcurementRequest[] = [];

      // Filter based on role and approval status
      if (user?.role === 'hod') {
        filtered = allRequests.filter(r => 
          r.status === 'pending' && r.department === user.department
        );
      } else if (user?.role === 'principal') {
        filtered = allRequests.filter(r => r.status === 'approved_hod');
      } else if (user?.role === 'purchase_officer') {
        filtered = allRequests.filter(r => r.status === 'approved_principal');
      } else if (user?.role === 'admin') {
        filtered = allRequests.filter(r => 
          r.status === 'pending' || 
          r.status === 'approved_hod' || 
          r.status === 'approved_principal'
        );
      }

      setRequests(filtered.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">Pending Approvals</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review and approve procurement requests
        </p>
      </div>

      <Card className="p-6 mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search pending requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>
      </Card>

      {filteredRequests.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700">
          <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-gray-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-gray-600 dark:text-gray-400">
            There are no pending requests requiring your approval
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white mb-2">{request.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[request.status as keyof typeof statusColors]}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="dark:border-slate-600">
                        {request.department}
                      </Badge>
                      <Badge variant="outline" className="dark:border-slate-600">
                        {request.category}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/request/${request.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{request.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">
                    Requested by: <span className="text-gray-900 dark:text-white">{request.createdBy}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
