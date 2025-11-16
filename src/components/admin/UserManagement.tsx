import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  UserPlus,
  Edit,
  Trash2,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  Mail,
  Building2,
} from 'lucide-react';
import { User, UserRole } from '../../lib/adminTypes';
import { toast } from 'sonner@2.0.3';
import { auditService } from '../../lib/auditService';

interface UserManagementProps {
  currentUserId: string;
  currentUserRole: UserRole;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUserId,
  currentUserRole,
}) => {
  const [users, setUsers] = useState<User[]>(getMockUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async () => {
    if (!formData.username || !formData.email || !formData.fullName || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      role: formData.role as UserRole,
      department: formData.department || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setUsers([...users, newUser]);
    setIsCreateDialogOpen(false);
    setFormData({});

    await auditService.log(
      'user_created',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        targetUserId: newUser.id,
        targetRole: newUser.role,
        afterValue: { username: newUser.username, role: newUser.role },
      },
      'info'
    );

    toast.success('User created successfully');
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.username || !formData.email || !formData.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedUsers = users.map((user) =>
      user.id === selectedUser.id
        ? { ...user, ...formData, updatedAt: new Date() }
        : user
    );

    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setFormData({});

    await auditService.log(
      'user_updated',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        targetUserId: selectedUser.id,
        beforeValue: selectedUser,
        afterValue: formData,
      },
      'info'
    );

    toast.success('User updated successfully');
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setUsers(users.filter((user) => user.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);

    await auditService.log(
      'user_deleted',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        targetUserId: selectedUser.id,
        beforeValue: selectedUser,
      },
      'warning'
    );

    toast.success('User deleted successfully');
    setSelectedUser(null);
  };

  const handleToggleStatus = async (user: User) => {
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, isActive: !u.isActive, updatedAt: new Date() } : u
    );

    setUsers(updatedUsers);

    await auditService.log(
      'user_updated',
      currentUserId,
      'Admin',
      currentUserRole,
      {
        targetUserId: user.id,
        beforeValue: { isActive: user.isActive },
        afterValue: { isActive: !user.isActive },
      },
      'info'
    );

    toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
  };

  const openCreateDialog = () => {
    setFormData({});
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and permissions
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0"
            />
          </div>

          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Principal">Principal</SelectItem>
              <SelectItem value="Faculty">Faculty</SelectItem>
              <SelectItem value="HOD">HOD</SelectItem>
              <SelectItem value="SO">Store Officer</SelectItem>
              <SelectItem value="PO_Purchase">Purchase Officer</SelectItem>
              <SelectItem value="PO_Payment">Payment Officer</SelectItem>
              <SelectItem value="AO">Accountant Officer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="text-gray-900 dark:text-white">{user.fullName}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <span>{user.username}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.department && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Building2 className="h-3 w-3" />
                          {user.department}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        className="gap-1"
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400">Inactive</span>
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(user)}
                          disabled={user.id === currentUserId}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Add a new user to the system</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter username"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="SO">Store Officer</SelectItem>
                  <SelectItem value="PO_Purchase">Purchase Officer</SelectItem>
                  <SelectItem value="PO_Payment">Payment Officer</SelectItem>
                  <SelectItem value="AO">Accountant Officer</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-username">Username *</Label>
              <Input
                id="edit-username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-fullName">Full Name *</Label>
              <Input
                id="edit-fullName"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="SO">Store Officer</SelectItem>
                  <SelectItem value="PO_Purchase">Purchase Officer</SelectItem>
                  <SelectItem value="PO_Payment">Payment Officer</SelectItem>
                  <SelectItem value="AO">Accountant Officer</SelectItem>
                  <SelectItem value="Principal">Principal</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.fullName}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Mock data
function getMockUsers(): User[] {
  return [
    {
      id: 'user_1',
      username: 'admin',
      email: 'admin@college.edu',
      fullName: 'System Administrator',
      role: 'Admin',
      department: 'IT',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      lastLogin: new Date(),
    },
    {
      id: 'user_2',
      username: 'principal',
      email: 'principal@college.edu',
      fullName: 'Dr. Principal',
      role: 'Principal',
      department: 'Administration',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      lastLogin: new Date('2024-11-14'),
    },
    {
      id: 'user_3',
      username: 'faculty1',
      email: 'faculty@college.edu',
      fullName: 'Dr. Faculty Member',
      role: 'Faculty',
      department: 'Computer Science',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      lastLogin: new Date('2024-11-13'),
    },
    {
      id: 'user_4',
      username: 'hod1',
      email: 'hod@college.edu',
      fullName: 'Dr. HOD',
      role: 'HOD',
      department: 'Computer Science',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      lastLogin: new Date('2024-11-12'),
    },
  ];
}
