import React from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  FileText, 
  PlusCircle, 
  CheckCircle, 
  ShoppingCart,
  LogOut,
  LayoutDashboard 
} from 'lucide-react';
import { Button } from '../ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'My Requests', path: '/requests', icon: <FileText className="h-5 w-5" /> },
  { label: 'Create Request', path: '/create', icon: <PlusCircle className="h-5 w-5" />, roles: ['faculty', 'admin'] },
  { label: 'Pending Approvals', path: '/approvals', icon: <CheckCircle className="h-5 w-5" />, roles: ['hod', 'so', 'po', 'principal', 'payment_officer', 'ao', 'admin'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 h-screen bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 flex flex-col transition-colors duration-300"
    >
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-2xl">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white">Procurement</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">System</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-700 dark:to-slate-600 p-4 rounded-2xl">
          <p className="text-sm text-gray-600 dark:text-gray-300">Logged in as</p>

          {/* UPDATED: changed name → username */}
          <p className="text-gray-900 dark:text-white mt-1">{user?.username}</p>

          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 capitalize">
            {user?.role.replace('_', ' ')}
          </p>

          {user?.department && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {user.department}
            </p>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </motion.div>
  );
};
