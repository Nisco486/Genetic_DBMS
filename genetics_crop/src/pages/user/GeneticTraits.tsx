import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dna,
  Search,
  Upload,
  FileSpreadsheet,
  Filter,
  Download,
  X,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cropApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const markerColumns = [
  { key: 'crop', label: 'Crop' },
  { key: 'markerId', label: 'Gene/Marker ID' },
  { key: 'traitAffected', label: 'Trait Affected' },
];

export default function GeneticTraits() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterTrait, setFilterTrait] = useState('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarkers();
  }, []);

  const fetchMarkers = async () => {
    try {
      const data = await cropApi.getTraits();
      setMarkers(data);
    } catch (error) {
      console.error('Failed to fetch markers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const traitImportanceData = [
    { name: 'Yield', value: markers.filter(m => m.traitAffected.includes('Yield') || m.traitAffected.includes('Size')).length },
    { name: 'Resistance', value: markers.filter(m => m.traitAffected.toLowerCase().includes('resistance') || m.traitAffected.toLowerCase().includes('tolerance')).length },
    { name: 'Quality', value: markers.filter(m => m.traitAffected.toLowerCase().includes('quality')).length },
    { name: 'Others', value: markers.length - markers.filter(m => /Yield|Size|Resistance|Tolerance|Quality/i.test(m.traitAffected)).length },
  ];

  const uniqueCrops = [...new Set(markers.map(m => m.crop))];
  const uniqueTraits = [...new Set(markers.map(m => m.traitAffected))];

  const filteredMarkers = markers.filter(marker => {
    const matchesSearch = marker.markerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      marker.crop.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCrop = filterCrop === 'all' || marker.crop === filterCrop;
    const matchesTrait = filterTrait === 'all' || marker.traitAffected === filterTrait;
    return matchesSearch && matchesCrop && matchesTrait;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
      toast({
        title: 'GWAS/SNP Data Uploaded',
        description: `${file.name} ready for processing.`,
      });
    }
  };

  const handleProcessUpload = () => {
    if (uploadedFile) {
      toast({
        title: 'Genetic Data Processed',
        description: '0 markers imported from dataset.',
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
              <Dna className="w-8 h-8 text-primary" />
              Genetic Traits
            </h1>
            <p className="text-muted-foreground mt-1">Store and analyze genetic markers affecting crop traits</p>
          </div>
        </motion.div>

        {/* Upload and Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Upload Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Genetic Datasets
                </CardTitle>
                <CardDescription>Import GWAS or SNP CSV files</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileSpreadsheet className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    {uploadedFile ? uploadedFile.name : 'Upload GWAS/SNP Dataset'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports CSV files with genetic marker data
                  </p>
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2">
                    <Button variant="hero" onClick={handleProcessUpload} className="flex-1">
                      Process Dataset
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setUploadedFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Trait Importance Chart */}
          <ChartCard
            title="Trait Importance Analysis"
            description="Relative importance of genetic traits"
            type="bar"
            data={traitImportanceData}
          />
        </div>

        {/* Data Table */}
        <DataTable
          title="Genetic Markers Database"
          description={`${filteredMarkers.length} markers found`}
          columns={markerColumns}
          data={filteredMarkers}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search markers..."
                  className="pl-9 w-40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterCrop} onValueChange={setFilterCrop}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  {uniqueCrops.map(crop => (
                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTrait} onValueChange={setFilterTrait}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trait" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Traits</SelectItem>
                  {uniqueTraits.map(trait => (
                    <SelectItem key={trait} value={trait}>{trait}</SelectItem>
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
