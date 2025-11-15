import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole, useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { ShoppingCart, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const roles: { value: UserRole; label: string; description: string }[] = [
  { value: 'faculty', label: 'Faculty', description: 'Create and submit procurement requests' },
  { value: 'hod', label: 'HOD', description: 'Review and approve department requests' },
  { value: 'so', label: 'Store Officer', description: 'Review stock and inventory requirements' },
  { value: 'po', label: 'Purchase Officer', description: 'Review and process procurement orders' },
  { value: 'principal', label: 'Principal', description: 'Review and approve major purchases' },
  { value: 'ao', label: 'Accountant Officer', description: 'Make and Payemnt' },
  { value: 'admin', label: 'Admin', description: 'Full system access to all requests' },
];

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogin = () => {
    if (selectedRole && username && password) {
      login(
        selectedRole,
        username,
        password,
        selectedRole === 'faculty' || selectedRole === 'hod' ? department : undefined
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="absolute top-4 right-4 rounded-full hover:scale-110 transition-transform duration-200"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-3xl">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-blue-900 dark:text-blue-100 mb-2">Procurement Management System</h1>
          <p className="text-gray-600 dark:text-gray-400">Select your role to continue</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all duration-300 rounded-2xl ${
                  selectedRole === role.value
                    ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-xl scale-105'
                    : 'bg-white dark:bg-slate-800 hover:shadow-lg hover:scale-102 border-gray-200 dark:border-slate-700'
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <h3 className={selectedRole === role.value ? 'text-white' : 'text-gray-900 dark:text-white'}>
                  {role.label}
                </h3>
                <p
                  className={`text-sm mt-2 ${
                    selectedRole === role.value ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {role.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedRole ? 1 : 0 }}
          className="max-w-md mx-auto"
        >
          {selectedRole && (
            <Card className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-gray-200 dark:border-slate-700">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>

                {(selectedRole === 'faculty' || selectedRole === 'hod') && (
                  <div>
                    <Label htmlFor="department" className="text-gray-700 dark:text-gray-300">
                      Department
                    </Label>
                    <Input
                      id="department"
                      placeholder="Enter your department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="mt-2 rounded-xl border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={
                    !username ||
                    !password ||
                    ((selectedRole === 'faculty' || selectedRole === 'hod') && !department)
                  }
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105"
                >
                  Login
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};
