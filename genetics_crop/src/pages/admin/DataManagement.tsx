import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const allRecords = [
  { id: 1, type: 'Crop', category: 'Crop records', name: 'Wheat IR-8', source: 'CSV Upload', status: 'Approved', lastUpdated: '2024-01-15' },
  { id: 2, type: 'Genetic', category: 'Genetic traits', name: 'Drought-R1 Marker', source: 'Manual Entry', status: 'Pending', lastUpdated: '2024-01-14' },
  { id: 3, type: 'Climate', category: 'Climate data', name: 'Punjab Q4 2023', source: 'API Sync', status: 'Approved', lastUpdated: '2024-01-13' },
  { id: 4, type: 'Soil', category: 'Soil data', name: 'Field A-12 Analysis', source: 'CSV Upload', status: 'Pending', lastUpdated: '2024-01-12' },
  { id: 5, type: 'Crop', category: 'Crop records', name: 'Rice Basmati-370', source: 'Manual Entry', status: 'Approved', lastUpdated: '2024-01-11' },
  { id: 6, type: 'Genetic', category: 'Genetic traits', name: 'Yield-G3 SNP', source: 'CSV Upload', status: 'Rejected', lastUpdated: '2024-01-10' },
  { id: 7, type: 'Climate', category: 'Climate data', name: 'Sindh Q3 2023', source: 'API Sync', status: 'Approved', lastUpdated: '2024-01-09' },
  { id: 8, type: 'Soil', category: 'Soil data', name: 'Field B-7 Analysis', source: 'Manual Entry', status: 'Pending', lastUpdated: '2024-01-08' },
];

export default function DataManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRecords = allRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = allRecords.filter(r => r.status === 'Pending').length;

  const handleApprove = (id: number) => {
    toast({
      title: "Record Approved",
      description: "The record has been approved and is now visible to researchers.",
    });
  };

  const handleReject = (id: number) => {
    toast({
      title: "Record Rejected",
      description: "The record has been rejected.",
      variant: "destructive",
    });
  };

  const columns = [
    { key: 'id', label: 'Record ID' },
    { key: 'category', label: 'Category' },
    { key: 'type', label: 'Type', render: (v: string) => (
      <Badge variant="outline" className="font-medium">
        {v}
      </Badge>
    )},
    { key: 'name', label: 'Record Name' },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'actions', label: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleApprove(row.id)}>
          <CheckCircle className="w-4 h-4 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleReject(row.id)}>
          <XCircle className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    )},
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Data Management</h1>
          <p className="text-muted-foreground mt-1">Central control panel for all data records</p>
        </motion.div>

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
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Crop">Crop</SelectItem>
                    <SelectItem value="Genetic">Genetic</SelectItem>
                    <SelectItem value="Climate">Climate</SelectItem>
                    <SelectItem value="Soil">Soil</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="border-l-4 border-l-warning">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-warning" />
                  Pending Approvals ({pendingCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allRecords.filter(r => r.status === 'Pending').map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{record.name}</p>
                        <p className="text-sm text-muted-foreground">{record.type} • {record.source}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleApprove(record.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-primary" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleReject(record.id)}
                        >
                          <XCircle className="w-4 h-4 text-destructive" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Records Table */}
        <DataTable
          title="All Records"
          description="Unified view of all data across categories"
          columns={columns}
          data={filteredRecords}
          actions={
            <Badge variant="secondary" className="gap-1">
              <Database className="w-3 h-3" />
              {filteredRecords.length} Records
            </Badge>
          }
        />
      </div>
    </DashboardLayout>
  );
}
