import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Search,
  UserPlus,
  Shield,
  ShieldCheck,
  Activity,
  MoreVertical,
  Ban,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const users = [
  { id: 1, name: 'Dr. Sarah Chen', email: 'sarah.chen@uni.edu', role: 'Researcher', status: 'Active', lastActive: '2024-01-15 14:32', predictions: 0 },
  { id: 2, name: 'James Wilson', email: 'j.wilson@agri.org', role: 'Researcher', status: 'Active', lastActive: '2024-01-15 12:18', predictions: 0 },
  { id: 3, name: 'Maria Lopez', email: 'm.lopez@farm.co', role: 'Researcher', status: 'Inactive', lastActive: '2024-01-10 09:45', predictions: 0 },
  { id: 4, name: 'Admin User', email: 'admin@cropgen.ai', role: 'Admin', status: 'Active', lastActive: '2024-01-15 16:00', predictions: 0 },
  { id: 5, name: 'John Doe', email: 'john.doe@research.edu', role: 'Researcher', status: 'Active', lastActive: '2024-01-14 11:20', predictions: 0 },
];

const activityLogs = [
  { id: 1, user: 'Dr. Sarah Chen', action: 'Ran prediction', details: 'Wheat yield prediction for Punjab region', time: '0 mins ago' },
  { id: 2, user: 'James Wilson', action: 'Uploaded CSV', details: 'soil_samples_batch4.csv', time: '0 mins ago' },
  { id: 3, user: 'Maria Lopez', action: 'Viewed report', details: 'Seasonal Crop Suitability Q4 2023', time: '0 days ago' },
  { id: 4, user: 'Dr. Sarah Chen', action: 'Added crop data', details: 'New rice variety: Basmati-385', time: '0 days ago' },
];

export default function UserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleStatus = (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    toast({
      title: `User ${newStatus === 'Active' ? 'Activated' : 'Deactivated'}`,
      description: `User status changed to ${newStatus}`,
    });
  };

  const handleChangeRole = (userId: number, newRole: string) => {
    toast({
      title: "Role Updated",
      description: `User role changed to ${newRole}`,
    });
  };

  const columns = [
    { key: 'name', label: 'User', render: (v: string, row: any) => (
      <div>
        <p className="font-medium text-foreground">{v}</p>
        <p className="text-sm text-muted-foreground">{row.email}</p>
      </div>
    )},
    { key: 'role', label: 'Role', render: (v: string) => (
      <Badge variant={v === 'Admin' ? 'default' : 'secondary'} className="gap-1">
        {v === 'Admin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
        {v}
      </Badge>
    )},
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'predictions', label: 'Predictions', render: (v: number) => v.toLocaleString() },
    { key: 'actions', label: '', render: (_: any, row: any) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleChangeRole(row.id, row.role === 'Admin' ? 'Researcher' : 'Admin')}>
            <Shield className="w-4 h-4 mr-2" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(row.id, row.status)}>
            {row.status === 'Active' ? (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const totalPredictions = users.reduce((sum, u) => sum + u.predictions, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage platform users and permissions</p>
          </div>
          <Button variant="hero" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{users.length}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totalPredictions.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Predictions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Researcher">Researcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <DataTable
          title="Users"
          description="All registered platform users"
          columns={columns}
          data={filteredUsers}
        />

        {/* Activity Logs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>User activity logs from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{log.user}</span>
                        <span className="text-muted-foreground"> {log.action}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
