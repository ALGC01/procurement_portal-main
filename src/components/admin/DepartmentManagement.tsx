import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Building2, Plus, Edit, Trash2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Department, UserRole } from '../../lib/adminTypes';
import { toast } from 'sonner@2.0.3';
import { auditService } from '../../lib/auditService';

interface DepartmentManagementProps {
  currentUserId: string;
  currentUserRole: UserRole;
}

export const DepartmentManagement: React.FC<DepartmentManagementProps> = ({
  currentUserId,
  currentUserRole,
}) => {
  const [departments, setDepartments] = useState<Department[]>(getMockDepartments());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});

  const handleCreateDepartment = async () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newDepartment: Department = {
      id: `dept_${Date.now()}`,
      name: formData.name,
      code: formData.code,
      budgetAllocated: formData.budgetAllocated || 0,
      budgetSpent: 0,
      budgetRemaining: formData.budgetAllocated || 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDepartments([...departments, newDepartment]);
    setIsCreateDialogOpen(false);
    setFormData({});

    await auditService.log(
      'department_created',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        afterValue: newDepartment,
      },
      'info'
    );

    toast.success('Department created successfully');
  };

  const handleUpdateDepartment = async () => {
    if (!selectedDepartment || !formData.name || !formData.code) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedDepartments = departments.map((dept) =>
      dept.id === selectedDepartment.id
        ? {
            ...dept,
            ...formData,
            budgetRemaining:
              (formData.budgetAllocated || dept.budgetAllocated) - dept.budgetSpent,
            updatedAt: new Date(),
          }
        : dept
    );

    setDepartments(updatedDepartments);
    setIsEditDialogOpen(false);
    setSelectedDepartment(null);
    setFormData({});

    await auditService.log(
      'department_updated',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        beforeValue: selectedDepartment,
        afterValue: formData,
      },
      'info'
    );

    toast.success('Department updated successfully');
  };

  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;

    setDepartments(departments.filter((dept) => dept.id !== selectedDepartment.id));
    setIsDeleteDialogOpen(false);

    await auditService.log(
      'department_deleted',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        beforeValue: selectedDepartment,
      },
      'warning'
    );

    toast.success('Department deleted successfully');
    setSelectedDepartment(null);
  };

  const openCreateDialog = () => {
    setFormData({});
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (dept: Department) => {
    setSelectedDepartment(dept);
    setFormData(dept);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (dept: Department) => {
    setSelectedDepartment(dept);
    setIsDeleteDialogOpen(true);
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
          <h2 className="text-gray-900 dark:text-white">Department Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage departments and their budgets
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const utilization = dept.budgetAllocated > 0
            ? (dept.budgetSpent / dept.budgetAllocated) * 100
            : 0;

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 dark:text-white">{dept.name}</h3>
                      <Badge variant="outline" className="mt-1">
                        {dept.code}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(dept)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(dept)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Budget
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(dept.budgetAllocated)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Spent
                    </span>
                    <span className="text-orange-600">
                      {formatCurrency(dept.budgetSpent)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Remaining
                    </span>
                    <span className="text-green-600">
                      {formatCurrency(dept.budgetRemaining)}
                    </span>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Utilization
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {utilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(utilization, 100)}%` }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          utilization > 90
                            ? 'bg-red-600'
                            : utilization > 75
                            ? 'bg-orange-600'
                            : 'bg-green-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Create Department Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
            <DialogDescription>Add a new department to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Computer Science"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="code">Department Code *</Label>
              <Input
                id="code"
                value={formData.code || ''}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                placeholder="e.g., CS"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="budget">Budget Allocation</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budgetAllocated || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetAllocated: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment}>Create Department</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Department Name *</Label>
              <Input
                id="edit-name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-code">Department Code *</Label>
              <Input
                id="edit-code"
                value={formData.code || ''}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value.toUpperCase() })
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-budget">Budget Allocation</Label>
              <Input
                id="edit-budget"
                type="number"
                value={formData.budgetAllocated || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budgetAllocated: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDepartment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDepartment?.name}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDepartment}>
              Delete Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mock data
function getMockDepartments(): Department[] {
  return [
    {
      id: 'dept_1',
      name: 'Computer Science',
      code: 'CS',
      budgetAllocated: 500000,
      budgetSpent: 325000,
      budgetRemaining: 175000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'dept_2',
      name: 'Electronics & Communication',
      code: 'ECE',
      budgetAllocated: 450000,
      budgetSpent: 280000,
      budgetRemaining: 170000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'dept_3',
      name: 'Mechanical Engineering',
      code: 'ME',
      budgetAllocated: 600000,
      budgetSpent: 420000,
      budgetRemaining: 180000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
  ];
}
