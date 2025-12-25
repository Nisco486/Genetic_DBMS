import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Download,
  Upload,
  Database,
  Bell,
  Shield,
  Sliders,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    minConfidence: [0],
    defaultYieldThreshold: '0',
    refreshInterval: '0',
    autoApprove: false,
    emailNotifications: true,
    maintenanceMode: false,
    loggingEnabled: true,
    monitoringEnabled: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration changes have been applied.",
    });
  };

  const handleBackup = () => {
    toast({
      title: "Backup Started",
      description: "Database backup is in progress. You'll be notified when complete.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing data export. Download will start shortly.",
    });
  };

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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">System configuration and preferences</p>
          </div>
          <Button variant="hero" className="gap-2" onClick={handleSave}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prediction Thresholds */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  Prediction Thresholds
                </CardTitle>
                <CardDescription>Configure recommendation parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Minimum Confidence Score</Label>
                    <span className="text-sm font-medium text-foreground">{settings.minConfidence[0]}%</span>
                  </div>
                  <Slider
                    value={settings.minConfidence}
                    onValueChange={(v) => setSettings({...settings, minConfidence: v})}
                    max={100}
                    step={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Predictions below this threshold will show a warning
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yieldThreshold">Default Yield Threshold (tons/hectare)</Label>
                  <Input
                    id="yieldThreshold"
                    type="number"
                    value={settings.defaultYieldThreshold}
                    onChange={(e) => setSettings({...settings, defaultYieldThreshold: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Default Parameters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  Default Parameters
                </CardTitle>
                <CardDescription>System-wide default values</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Growing Season</Label>
                  <Select defaultValue="kharif">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                      <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                      <SelectItem value="zaid">Zaid (Summer)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Region</Label>
                  <Select defaultValue="punjab">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="punjab">Punjab</SelectItem>
                      <SelectItem value="sindh">Sindh</SelectItem>
                      <SelectItem value="kpk">KPK</SelectItem>
                      <SelectItem value="balochistan">Balochistan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Data Refresh Interval (hours)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings({...settings, refreshInterval: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications & Automation
                </CardTitle>
                <CardDescription>Configure alerts and automated actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts for new uploads and predictions</p>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications}
                    onCheckedChange={(v) => setSettings({...settings, emailNotifications: v})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Auto-Approve Uploads</p>
                    <p className="text-sm text-muted-foreground">Automatically approve validated CSV uploads</p>
                  </div>
                  <Switch 
                    checked={settings.autoApprove}
                    onCheckedChange={(v) => setSettings({...settings, autoApprove: v})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Disable researcher access temporarily</p>
                  </div>
                  <Switch 
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v) => setSettings({...settings, maintenanceMode: v})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable Logging</p>
                    <p className="text-sm text-muted-foreground">Capture admin actions and system events</p>
                  </div>
                  <Switch 
                    checked={settings.loggingEnabled}
                    onCheckedChange={(v) => setSettings({...settings, loggingEnabled: v})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Enable Monitoring</p>
                    <p className="text-sm text-muted-foreground">Track performance and health metrics</p>
                  </div>
                  <Switch 
                    checked={settings.monitoringEnabled}
                    onCheckedChange={(v) => setSettings({...settings, monitoringEnabled: v})}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Export & Backup
                </CardTitle>
                <CardDescription>Data export and system backup options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleBackup}>
                  <RefreshCw className="w-4 h-4" />
                  Create Database Backup
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3" onClick={handleExport}>
                  <Download className="w-4 h-4" />
                  Export All Data (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Upload className="w-4 h-4" />
                  Import Configuration
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated" className="border-l-4 border-l-primary">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Security Notice</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All settings changes are logged and can be reviewed in the activity logs. 
                    For security-sensitive changes, please ensure you have the necessary permissions.
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
