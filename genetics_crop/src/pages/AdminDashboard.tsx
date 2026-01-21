import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Database,
  Users,
  Activity,
  Plus,
  Server,
  RefreshCw,
} from 'lucide-react';
import { cropApi } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    crops: 0,
    traits: 0,
    climate: 0,
    predictions: 0,
    researchers: 0,
  });
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const fetchSystemStats = async () => {
    try {
      const data = await cropApi.getDashboardStats();
      setStats(data);

      const preds = await cropApi.getAllPredictions();
      setPredictions(preds);
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
      value: (stats.crops + stats.traits).toString(),
      change: 'Crops and Traits',
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
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => navigate('/admin/data-management')}
                >
                  <Database className="w-5 h-5" />
                  Manage Records
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="w-5 h-5" />
                  User Accounts
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* User Predictions Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 shadow-lg">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-primary" />
                User Prediction Log
              </CardTitle>
              <CardDescription>Real-time feed of user activities and ML predictions</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Recommended Crop</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.length > 0 ? (
                    predictions.map((pred: any) => (
                      <TableRow key={pred.id}>
                        <TableCell className="font-medium">
                          {pred.user && typeof pred.user === 'object' ? (
                            <div>
                              <div className="font-bold text-primary">ID: {pred.user.id}</div>
                              <div className="text-xs text-muted-foreground">{pred.user.name || pred.user.username}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Guest</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            {pred.crop}
                          </div>
                        </TableCell>
                        <TableCell>{pred.confidence}%</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{pred.date}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{pred.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No predictions recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>


      </div>
    </DashboardLayout>
  );
}
