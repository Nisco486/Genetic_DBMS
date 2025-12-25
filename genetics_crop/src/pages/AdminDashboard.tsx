import React from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Database,
  Users,
  Upload,
  Activity,
  Plus,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

const stats = [
  { title: 'Total Records', value: '0', change: '+0% from last month', changeType: 'positive' as const, icon: Database },
  { title: 'Active Users', value: '0', change: '+0 new users', changeType: 'positive' as const, icon: Users },
  { title: 'Pending Uploads', value: '0', change: 'Requires review', changeType: 'neutral' as const, icon: Upload },
  { title: 'System Health', value: '0%', change: 'All systems operational', changeType: 'positive' as const, icon: Activity },
];

const recentUploads = [
  { id: 1, name: 'crop_traits_2024.csv', records: 0, uploadedBy: 'Dr. Chen', status: 'Completed', date: '2024-01-15' },
  { id: 2, name: 'soil_samples_batch3.csv', records: 0, uploadedBy: 'James W.', status: 'Processing', date: '2024-01-14' },
  { id: 3, name: 'climate_data_q4.csv', records: 0, uploadedBy: 'Maria L.', status: 'Pending', date: '2024-01-13' },
  { id: 4, name: 'genetic_markers_v2.csv', records: 0, uploadedBy: 'Dr. Chen', status: 'Completed', date: '2024-01-12' },
];

const uploadColumns = [
  { key: 'name', label: 'File Name' },
  { key: 'records', label: 'Records', render: (v: number) => v.toLocaleString() },
  { key: 'uploadedBy', label: 'Uploaded By' },
  { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
  { key: 'date', label: 'Date' },
];

const systemMetrics = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
];

const dataDistribution = [
  { name: 'Crop Data', value: 0 },
  { name: 'Genetic Traits', value: 0 },
  { name: 'Soil Analysis', value: 0 },
  { name: 'Climate Data', value: 0 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your system and monitor performance</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Sync Data
            </Button>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Record
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="System Activity"
            description="Monthly data processing count"
            type="area"
            data={systemMetrics}
          />
          <ChartCard
            title="Data Distribution"
            description="By category (crops, genetics, climate, soil)"
            type="pie"
            data={dataDistribution}
          />
        </div>

        {/* Quick Actions & Recent Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Upload className="w-4 h-4" />
                  Upload Dataset
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <RefreshCw className="w-4 h-4" />
                  Retrain ML Model
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Database className="w-4 h-4" />
                  Database Backup
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="w-4 h-4" />
                  Manage Users
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <DataTable
              title="Recent Uploads"
              description="Latest dataset uploads and their status"
              columns={uploadColumns}
              data={recentUploads}
              actions={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
          </div>
        </div>

        {/* System Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card variant="elevated" className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">ML Model Performance Update</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The prediction model accuracy has improved to 0% after the latest training cycle. 
                    Consider scheduling a model update to incorporate recent genetic trait data.
                  </p>
                  <Button variant="link" className="px-0 mt-2 h-auto">
                    View Details →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
