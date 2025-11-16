import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Users, Building2, DollarSign, Settings, FileText, Shield } from 'lucide-react';
import { UserManagement } from '../components/admin/UserManagement';
import { DepartmentManagement } from '../components/admin/DepartmentManagement';
import { BudgetManagement } from '../components/admin/BudgetManagement';
import { WorkflowConfiguration } from '../components/admin/WorkflowConfiguration';
import { AuditLogViewer } from '../components/admin/AuditLogViewer';
import { useAuth } from '../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Only Admin and Principal can access this page
  // if (!user || (user.role !== 'Admin' && user.role !== 'Principal')) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Card className="p-8 text-center">
  //         <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
  //         <h2 className="text-gray-900 dark:text-white mb-2">Access Denied</h2>
  //         <p className="text-gray-600 dark:text-gray-400">
  //           You do not have permission to access this page.
  //         </p>
  //       </Card>
  //     </div>
  //   );
  // }
  if(true)
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-gray-900 dark:text-white mb-2">
          {user.role === 'Admin' ? 'Admin Dashboard' : 'Principal Dashboard'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage users, departments, budgets, and system configuration
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

        <TabsList
          className="
            flex w-full overflow-x-auto whitespace-nowrap gap-4 
            py-3 px-4 rounded-xl 
            bg-gray-100 dark:bg-gray-800
            scrollbar-hide
          "
        >
          <TabsTrigger value="users" className="flex items-center gap-2 px-4 py-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>

          <TabsTrigger value="departments" className="flex items-center gap-2 px-4 py-2">
            <Building2 className="h-4 w-4" />
            <span>Departments</span>
          </TabsTrigger>

          <TabsTrigger value="budget" className="flex items-center gap-2 px-4 py-2">
            <DollarSign className="h-4 w-4" />
            <span>Budget</span>
          </TabsTrigger>

          <TabsTrigger value="workflow" className="flex items-center gap-2 px-4 py-2">
            <Settings className="h-4 w-4" />
            <span>Workflow</span>
          </TabsTrigger>

          <TabsTrigger value="audit" className="flex items-center gap-2 px-4 py-2">
            <FileText className="h-4 w-4" />
            <span>Audit Logs</span>
          </TabsTrigger>

          <TabsTrigger value="config" className="flex items-center gap-2 px-4 py-2">
            <Settings className="h-4 w-4" />
            <span>Config</span>
          </TabsTrigger>
        </TabsList>


        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <UserManagement currentUserId={user.id} currentUserRole={user.role} />
          </motion.div>
        </TabsContent>

        <TabsContent value="departments">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <DepartmentManagement currentUserId={user.id} currentUserRole={user.role} />
          </motion.div>
        </TabsContent>

        <TabsContent value="budget">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <BudgetManagement currentUserId={user.id} currentUserRole={user.role} />
          </motion.div>
        </TabsContent>

        <TabsContent value="workflow">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <WorkflowConfiguration currentUserId={user.id} currentUserRole={user.role} />
          </motion.div>
        </TabsContent>

        <TabsContent value="audit">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AuditLogViewer
              userRole={user.role as 'Admin' | 'Principal'}
            />
          </motion.div>
        </TabsContent>

        <TabsContent value="config">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 text-center">
              <Settings className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-gray-900 dark:text-white mb-2">System Configuration</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Configure system-wide settings and preferences
              </p>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
