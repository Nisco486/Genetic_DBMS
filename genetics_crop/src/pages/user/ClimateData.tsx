import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable } from '@/components/dashboard/DataTable';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CloudSun,
  Search,
  Upload,
  FileSpreadsheet,
  Filter,
  Download,
  X,
  Thermometer,
  Droplets,
  Wind,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cropApi } from '@/lib/api';

const temperatureTrends = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
  { name: 'Aug', value: 0 },
  { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 },
  { name: 'Nov', value: 0 },
  { name: 'Dec', value: 0 },
];

const rainfallTrends = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
  { name: 'Apr', value: 0 },
  { name: 'May', value: 0 },
  { name: 'Jun', value: 0 },
  { name: 'Jul', value: 0 },
  { name: 'Aug', value: 0 },
  { name: 'Sep', value: 0 },
  { name: 'Oct', value: 0 },
  { name: 'Nov', value: 0 },
  { name: 'Dec', value: 0 },
];

const climateColumns = [
  { key: 'location', label: 'Location' },
  { key: 'tempAvg', label: 'Avg Temp' },
  { key: 'tempMin', label: 'Min Temp' },
  { key: 'tempMax', label: 'Max Temp' },
  { key: 'rainfall', label: 'Rainfall' },
  { key: 'humidity', label: 'Humidity' },
  { key: 'season', label: 'Season' },
  { key: 'year', label: 'Year' },
];

export default function ClimateData() {
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeason, setFilterSeason] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClimateData();
  }, []);

  const fetchClimateData = async () => {
    try {
      const data = await cropApi.getClimate();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch climate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const avgTemp = records.length > 0
    ? (records.reduce((acc, r) => acc + parseFloat(r.tempAvg), 0) / records.length).toFixed(1)
    : '0';

  const totalRainfall = records.reduce((acc, r) => acc + parseFloat(r.rainfall), 0).toFixed(0);

  const avgHumidity = records.length > 0
    ? (records.reduce((acc, r) => acc + parseFloat(r.humidity), 0) / records.length).toFixed(1)
    : '0';

  const uniqueSeasons = [...new Set(records.map(r => r.season))];
  const uniqueYears = [...new Set(records.map(r => r.year))];

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeason = filterSeason === 'all' || record.season === filterSeason;
    const matchesYear = filterYear === 'all' || record.year === filterYear;
    return matchesSearch && matchesSeason && matchesYear;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
      toast({
        title: 'Climate Data Uploaded',
        description: `${file.name} ready for import.`,
      });
    }
  };

  const handleProcessUpload = () => {
    if (uploadedFile) {
      toast({
        title: 'Climate Data Imported',
        description: '0 records added to database.',
      });
      setUploadedFile(null);
    }
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
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <CloudSun className="w-8 h-8 text-primary" />
              Climate Data
            </h1>
            <p className="text-muted-foreground mt-1">Manage environmental and weather data</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Thermometer className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Temperature</p>
                    <p className="text-2xl font-bold text-foreground">{avgTemp}°C</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <Droplets className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rainfall</p>
                    <p className="text-2xl font-bold text-foreground">{totalRainfall} mm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <Wind className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Humidity</p>
                    <p className="text-2xl font-bold text-foreground">{avgHumidity}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Temperature Trends"
            description="Monthly average temperature"
            type="area"
            data={temperatureTrends}
          />
          <ChartCard
            title="Rainfall Patterns"
            description="Monthly rainfall (mm)"
            type="bar"
            data={rainfallTrends}
          />
        </div>

        {/* Upload Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                CSV Upload for Climate Datasets
              </CardTitle>
              <CardDescription>Import weather and climate data in bulk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className="flex-1 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {uploadedFile ? uploadedFile.name : 'Click to upload climate CSV'}
                  </p>
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2">
                    <Button variant="hero" onClick={handleProcessUpload}>
                      Import Data
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Table */}
        <DataTable
          title="Climate Records"
          description={`${filteredRecords.length} records found`}
          columns={climateColumns}
          data={filteredRecords}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search location..."
                  className="pl-9 w-44"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterSeason} onValueChange={setFilterSeason}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Seasons</SelectItem>
                  {uniqueSeasons.map(season => (
                    <SelectItem key={season} value={season}>{season}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
}
