import React from 'react';
import { Sidebar } from './Sidebar';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center transition-colors duration-300">
          <div>
            <h1 className="text-gray-900 dark:text-white">Procurement Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your procurement requests efficiently</p>
          </div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-all duration-200"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </motion.div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
