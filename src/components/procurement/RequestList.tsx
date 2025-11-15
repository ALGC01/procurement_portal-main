import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Search, Eye, Calendar, DollarSign, FileText } from 'lucide-react';
import { getAllRequests, ProcurementRequest } from '../../lib/db';
import { useAuth } from '../../contexts/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved_hod: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  approved_principal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels = {
  pending: 'Pending',
  approved_hod: 'HOD Approved',
  approved_principal: 'Principal Approved',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const RequestList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const allRequests = await getAllRequests();
      // Filter requests based on user role
      let filtered = allRequests;
      if (user?.role === 'faculty') {
        filtered = allRequests.filter(r => r.createdBy === user.name);
      } else if (user?.role === 'hod') {
        filtered = allRequests.filter(r => r.department === user.department || r.createdBy === user.name);
      }
      setRequests(filtered.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request =>
    request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.category.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-gray-900 dark:text-white mb-2">My Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your procurement requests</p>
      </div>

      <Card className="p-6 mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border-gray-200 dark:border-slate-700">
            <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-gray-900 dark:text-white mb-2">No requests found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search' : 'Create your first procurement request to get started'}
            </p>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-gray-200 dark:border-slate-700 cursor-pointer"
                onClick={() => navigate(`/request/${request.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white mb-2">{request.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusColors[request.status]}>
                        {statusLabels[request.status]}
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
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/request/${request.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {request.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>₹{request.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{request.items.length} items</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
