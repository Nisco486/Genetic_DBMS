import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Database,
  Users,
  Activity,
  CheckCircle2,
  RefreshCw,
  Plus,
  AlertCircle,
  Server,
} from 'lucide-react';
import { cropApi } from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    crops: 0,
    traits: 0,
    climate: 0,
    predictions: 0,
    researchers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const data = await cropApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    await fetchSystemStats();
    setIsLoading(false);
  };

  const systemStats = [
    {
      title: 'Total Records',
      value: (stats.crops + stats.traits + stats.climate).toString(),
      change: 'Across all databases',
      changeType: 'neutral' as const,
      icon: Database
    },
    {
      title: 'Active Researchers',
      value: stats.researchers.toString(),
      change: 'User accounts',
      changeType: 'neutral' as const,
      icon: Users
    },
    {
      title: 'ML Predictions',
      value: stats.predictions.toString(),
      change: 'Total analyses run',
      changeType: 'positive' as const,
      icon: Activity
    },
    {
      title: 'API Status',
      value: 'Online',
      change: 'All services operational',
      changeType: 'positive' as const,
      icon: Server
    },
  ];

  const recentActivity = [
    { action: 'New crop record added', user: 'System', time: '2 hours ago', type: 'success' },
    { action: 'Climate data synced', user: 'Auto-sync', time: '5 hours ago', type: 'success' },
    { action: 'Prediction completed', user: 'Researcher', time: '1 day ago', type: 'info' },
    { action: 'Database backup completed', user: 'System', time: '1 day ago', type: 'success' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Terminal</h1>
            <p className="text-muted-foreground mt-2">
              System overview and data management controls
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSync}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
          {systemStats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Database Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-primary" />
                  Database Overview
                </CardTitle>
                <CardDescription>Current record counts by category</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-foreground">Crop Varieties</p>
                      <p className="text-sm text-muted-foreground">Registered crop information</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{stats.crops}</p>
                      <p className="text-xs text-muted-foreground">records</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-foreground">Genetic Markers</p>
                      <p className="text-sm text-muted-foreground">Trait and gene data</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{stats.traits}</p>
                      <p className="text-xs text-muted-foreground">records</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-foreground">Climate Records</p>
                      <p className="text-sm text-muted-foreground">Environmental observations</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{stats.climate}</p>
                      <p className="text-xs text-muted-foreground">records</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                    <div>
                      <p className="font-medium text-foreground">ML Predictions</p>
                      <p className="text-sm text-muted-foreground">Completed analyses</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{stats.predictions}</p>
                      <p className="text-xs text-muted-foreground">records</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Database className="w-5 h-5" />
                  Manage Records
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Users className="w-5 h-5" />
                  User Accounts
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <RefreshCw className="w-5 h-5" />
                  Backup Database
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Server className="w-5 h-5" />
                  System Logs
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                Recent System Activity
              </CardTitle>
              <CardDescription>Latest operations and updates</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Status Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">All Systems Operational</h3>
                  <p className="text-sm text-muted-foreground">
                    Database connections stable. ML model responding normally.
                    Last system check: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
