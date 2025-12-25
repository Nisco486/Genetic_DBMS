import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Leaf,
  Dna,
  CloudSun,
  FlaskConical,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const uploadCategories = [
  { id: 'crops', label: 'Crop Data', icon: Leaf, description: 'Crop varieties, yields, growth duration' },
  { id: 'genetic', label: 'Genetic Traits', icon: Dna, description: 'GWAS, SNP markers, gene data' },
  { id: 'climate', label: 'Climate Data', icon: CloudSun, description: 'Temperature, rainfall, humidity' },
  { id: 'soil', label: 'Soil Data', icon: FlaskConical, description: 'pH, NPK values, soil types' },
];

const recentUploads = [
  { id: 1, name: 'wheat_varieties_2024.csv', category: 'Crop Data', records: 0, status: 'success', errors: 0, date: '2024-01-15' },
  { id: 2, name: 'genetic_markers_batch3.csv', category: 'Genetic Traits', records: 0, status: 'processing', errors: 0, date: '2024-01-14' },
  { id: 3, name: 'punjab_climate_q4.csv', category: 'Climate Data', records: 0, status: 'failed', errors: 0, date: '2024-01-13' },
  { id: 4, name: 'soil_samples_fieldA.csv', category: 'Soil Data', records: 0, status: 'pending', errors: 0, date: '2024-01-12' },
];

const validationErrors = [
  { row: 0, field: 'yield', message: 'Invalid numeric value' },
  { row: 0, field: 'growth_duration', message: 'Missing required field' },
  { row: 0, field: 'temperature', message: 'Value out of range (-50 to 60)' },
];

export default function BulkUpload() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowPreview(true);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile || !selectedCategory) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast({
            title: "Upload Complete",
            description: `Successfully uploaded ${uploadedFile.name}`,
          });
          setUploadedFile(null);
          setShowPreview(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'failed': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'processing': return <Clock className="w-4 h-4 text-warning animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      success: 'default',
      failed: 'destructive',
      processing: 'secondary',
      pending: 'outline',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Bulk Upload</h1>
          <p className="text-muted-foreground mt-1">Mass dataset ingestion for crops, genetics, climate, and soil</p>
        </motion.div>

        {/* Upload Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {uploadCategories.map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                variant="elevated"
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedCategory === category.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <category.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{category.label}</h3>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload CSV File
              </CardTitle>
              <CardDescription>
                {selectedCategory 
                  ? `Upload ${uploadCategories.find(c => c.id === selectedCategory)?.label} dataset`
                  : 'Select a category above to start uploading'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCategory ? (
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileSpreadsheet className="w-10 h-10 text-muted-foreground mb-3" />
                      <p className="mb-2 text-sm text-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">CSV files only (MAX. 50MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </label>

                  {uploadedFile && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-8 h-8 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{uploadedFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {uploading && (
                        <div className="mt-4">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-2">
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {uploadedFile && !uploading && (
                    <Button variant="hero" className="w-full" onClick={handleUpload}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload and Process
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a data category above to enable upload
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Validation Errors */}
        {showPreview && validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="border-l-4 border-l-warning">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Validation Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationErrors.map((error, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-warning/10 rounded text-sm">
                      <span className="font-mono text-muted-foreground">Row {error.row}</span>
                      <span className="font-medium text-foreground">{error.field}:</span>
                      <span className="text-muted-foreground">{error.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Uploads */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Recent Uploads</CardTitle>
              <CardDescription>History of uploaded datasets and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentUploads.map(upload => (
                  <div key={upload.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(upload.status)}
                      <div>
                        <p className="font-medium text-foreground">{upload.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {upload.category} • {upload.records.toLocaleString()} records • {upload.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {upload.errors > 0 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {upload.errors} errors
                        </Badge>
                      )}
                      {getStatusBadge(upload.status)}
                    </div>
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
