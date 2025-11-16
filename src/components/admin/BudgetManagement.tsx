import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { BudgetConfig, UserRole } from '../../lib/adminTypes';
import { toast } from 'sonner@2.0.3';
import { auditService } from '../../lib/auditService';

interface BudgetManagementProps {
  currentUserId: string;
  currentUserRole: UserRole;
}

export const BudgetManagement: React.FC<BudgetManagementProps> = ({
  currentUserId,
  currentUserRole,
}) => {
  const [budgets, setBudgets] = useState<BudgetConfig[]>(getMockBudgets());
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2024-2025');

  const filteredBudgets = budgets.filter(
    (budget) =>
      (selectedDepartment === 'all' || budget.departmentId === selectedDepartment) &&
      budget.fiscalYear === selectedYear
  );

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.totalBudget, 0);
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalAvailable = filteredBudgets.reduce((sum, b) => sum + b.available, 0);

  const handleUpdateBudget = async (budgetId: string, field: string, value: number) => {
    const updatedBudgets = budgets.map((budget) => {
      if (budget.id === budgetId) {
        const oldBudget = { ...budget };
        const newBudget = { ...budget, [field]: value, updatedAt: new Date() };

        // Recalculate available
        newBudget.available =
          newBudget.totalBudget - newBudget.allocated - newBudget.spent - newBudget.reserved;

        auditService.log(
          'budget_updated',
          currentUserId,
          'Admin',
          currentUserRole,
          {
            beforeValue: oldBudget,
            afterValue: newBudget,
          },
          'info'
        );

        return newBudget;
      }
      return budget;
    });

    setBudgets(updatedBudgets);
    toast.success('Budget updated successfully');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">Budget Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage department budgets
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Fiscal Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Department</Label>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="dept_1">Computer Science</SelectItem>
                <SelectItem value="dept_2">Electronics & Communication</SelectItem>
                <SelectItem value="dept_3">Mechanical Engineering</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Budget</div>
            <div className="text-2xl text-gray-900 dark:text-white">
              {formatCurrency(totalBudget)}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/20">
                <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm text-orange-600">
                {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</div>
            <div className="text-2xl text-gray-900 dark:text-white">
              {formatCurrency(totalSpent)}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-green-600">
                {totalBudget > 0 ? ((totalAvailable / totalBudget) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available</div>
            <div className="text-2xl text-gray-900 dark:text-white">
              {formatCurrency(totalAvailable)}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Budget Details */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Department
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Total Budget
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Allocated
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Spent
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Reserved
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Available
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredBudgets.map((budget) => {
                const utilization =
                  budget.totalBudget > 0
                    ? ((budget.spent / budget.totalBudget) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr
                    key={budget.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {getDepartmentName(budget.departmentId)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900 dark:text-white">
                      {formatCurrency(budget.totalBudget)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(budget.allocated)}
                    </td>
                    <td className="px-6 py-4 text-right text-orange-600">
                      {formatCurrency(budget.spent)}
                    </td>
                    <td className="px-6 py-4 text-right text-blue-600">
                      {formatCurrency(budget.reserved)}
                    </td>
                    <td className="px-6 py-4 text-right text-green-600">
                      {formatCurrency(budget.available)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              Number(utilization) > 90
                                ? 'bg-red-600'
                                : Number(utilization) > 75
                                ? 'bg-orange-600'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(Number(utilization), 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                          {utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// Helper functions
function getDepartmentName(departmentId: string): string {
  const departments: Record<string, string> = {
    dept_1: 'Computer Science',
    dept_2: 'Electronics & Communication',
    dept_3: 'Mechanical Engineering',
  };
  return departments[departmentId] || 'Unknown';
}

function getMockBudgets(): BudgetConfig[] {
  return [
    {
      id: 'budget_1',
      departmentId: 'dept_1',
      fiscalYear: '2024-2025',
      totalBudget: 500000,
      allocated: 150000,
      spent: 325000,
      reserved: 0,
      available: 25000,
      updatedAt: new Date(),
      updatedBy: 'user_1',
    },
    {
      id: 'budget_2',
      departmentId: 'dept_2',
      fiscalYear: '2024-2025',
      totalBudget: 450000,
      allocated: 120000,
      spent: 280000,
      reserved: 20000,
      available: 30000,
      updatedAt: new Date(),
      updatedBy: 'user_1',
    },
    {
      id: 'budget_3',
      departmentId: 'dept_3',
      fiscalYear: '2024-2025',
      totalBudget: 600000,
      allocated: 180000,
      spent: 420000,
      reserved: 0,
      available: 0,
      updatedAt: new Date(),
      updatedBy: 'user_1',
    },
  ];
}
