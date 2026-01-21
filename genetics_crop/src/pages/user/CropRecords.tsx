import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { cropApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Leaf,
  Plus,
  Search,
  Upload,
  FileSpreadsheet,
  Filter,
  Download,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialCropRecords = [
  { id: 1, name: 'IR64 Rice', variety: 'Indica', growthDuration: '120 days', avgYield: '0 t/ha', region: 'Tropical', diseaseResistance: 'Moderate', status: 'Active' },
  { id: 2, name: 'BT Cotton', variety: 'Hybrid', growthDuration: '180 days', avgYield: '0 t/ha', region: 'Subtropical', diseaseResistance: 'High', status: 'Active' },
  { id: 3, name: 'NK6240 Maize', variety: 'Hybrid', growthDuration: '95 days', avgYield: '0 t/ha', region: 'Temperate', diseaseResistance: 'Low', status: 'Active' },
  { id: 4, name: 'HD2967 Wheat', variety: 'Aestivum', growthDuration: '140 days', avgYield: '0 t/ha', region: 'Temperate', diseaseResistance: 'High', status: 'Active' },
  { id: 5, name: 'Pusa Basmati', variety: 'Indica', growthDuration: '135 days', avgYield: '0 t/ha', region: 'Subtropical', diseaseResistance: 'Moderate', status: 'Active' },
  { id: 6, name: 'Soybean JS335', variety: 'Determinate', growthDuration: '100 days', avgYield: '0 t/ha', region: 'Tropical', diseaseResistance: 'High', status: 'Inactive' },
];

const cropColumns = [
  { key: 'name', label: 'Crop Name' },
  { key: 'variety', label: 'Variety' },
  { key: 'region', label: 'Region' },
];

export default function CropRecords() {
  const [crops, setCrops] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.variety.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'all' || crop.region.toLowerCase() === filterRegion.toLowerCase();
    return matchesSearch && matchesRegion;
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await cropApi.getAll();
      if (data && data.length > 0) {
        setCrops(data.map((c: any) => ({
          id: c.crop_id,
          name: c.crop_name,
          variety: c.variety,
          region: c.origin_region,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch crops:', error);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const cropData = {
      crop_name: formData.get('cropName'),
      variety: formData.get('variety'),
      origin_region: formData.get('region'),
      description: `Growth Duration: ${formData.get('duration')}, Yield: ${formData.get('yield')}`,
    };

    setIsLoading(true);
    try {
      await cropApi.create(cropData);
      toast({
        title: 'Crop Added',
        description: 'New crop record has been saved to database.',
      });
      setIsAddDialogOpen(false);
      fetchCrops();
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Error saving to database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setUploadedFile(file);
      toast({
        title: 'CSV Uploaded',
        description: `${file.name} ready for import.`,
      });
    }
  };

  const handleBulkUpload = () => {
    if (uploadedFile) {
      toast({
        title: 'Bulk Import Complete',
        description: '0 crop records imported successfully.',
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
              <Leaf className="w-8 h-8 text-primary" />
              Crop Records
            </h1>
            <p className="text-muted-foreground mt-1">Manage crop and variety information</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="w-4 h-4" />
                  Add Crop
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Crop Record</DialogTitle>
                  <DialogDescription>Enter crop variety details</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddCrop} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cropName">Crop Name</Label>
                      <Input id="cropName" name="cropName" placeholder="e.g., Basmati Rice" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="variety">Variety</Label>
                      <Input id="variety" name="variety" placeholder="e.g., Indica" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Growth Duration</Label>
                      <Input id="duration" name="duration" placeholder="e.g., 120 days" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yield">Avg Yield (t/ha)</Label>
                      <Input id="yield" name="yield" type="number" step="0.1" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select defaultValue="tropical" name="region">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tropical">Tropical</SelectItem>
                          <SelectItem value="subtropical">Subtropical</SelectItem>
                          <SelectItem value="temperate">Temperate</SelectItem>
                          <SelectItem value="arid">Arid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resistance">Disease Resistance</Label>
                      <Select defaultValue="moderate">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" variant="hero" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Crop'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* CSV Upload Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Bulk CSV Upload
              </CardTitle>
              <CardDescription>Import multiple crop records at once</CardDescription>
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
                    {uploadedFile ? uploadedFile.name : 'Click to upload CSV'}
                  </p>
                </div>
                {uploadedFile && (
                  <div className="flex items-center gap-2">
                    <Button variant="hero" onClick={handleBulkUpload}>
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
          title="Crop Database"
          description={`${filteredCrops.length} crop varieties`}
          columns={cropColumns}
          data={filteredCrops}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search crops..."
                  className="pl-9 w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={filterRegion} onValueChange={setFilterRegion}>
                <SelectTrigger className="w-36">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="tropical">Tropical</SelectItem>
                  <SelectItem value="subtropical">Subtropical</SelectItem>
                  <SelectItem value="temperate">Temperate</SelectItem>
                  <SelectItem value="arid">Arid</SelectItem>
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
