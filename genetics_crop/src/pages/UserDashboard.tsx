import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable, StatusBadge } from '@/components/dashboard/DataTable';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Leaf,
  Dna,
  CloudSun,
  FlaskConical,
  Brain,
  TrendingUp,
  Search,
  Loader2,
  Upload,
  FileText,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cropApi } from '@/lib/api';

const cropColumns = [
  { key: 'name', label: 'Crop Name' },
  { key: 'variety', label: 'Variety' },
  { key: 'yieldPotential', label: 'Yield Potential' },
  { key: 'diseaseResistance', label: 'Disease Resistance' },
  { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
];

const yieldTrends = [
  { name: 'Week 1', value: 0 },
  { name: 'Week 2', value: 0 },
  { name: 'Week 3', value: 0 },
  { name: 'Week 4', value: 0 },
  { name: 'Week 5', value: 0 },
  { name: 'Week 6', value: 0 },
];

export default function UserDashboard() {
  const [stats, setStats] = useState<{
    title: string;
    value: string;
    change: string;
    changeType: 'positive' | 'neutral' | 'negative';
    icon: any;
  }[]>([
    { title: 'Crop Varieties', value: '0', change: 'Loading...', changeType: 'neutral', icon: Leaf },
    { title: 'Genetic Markers', value: '0', change: 'Loading...', changeType: 'neutral', icon: Dna },
    { title: 'Climate Records', value: '0', change: 'Loading...', changeType: 'neutral', icon: CloudSun },
    { title: 'Predictions Made', value: '0', change: 'Loading...', changeType: 'neutral', icon: Brain },
  ]);
  const [crops, setCrops] = useState<any[]>([]);
  const [isPrediciting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<null | {
    crop: string;
    confidence: number;
    yield: string;
    recommendations: string[];
  }>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, cropsData] = await Promise.all([
        cropApi.getDashboardStats(),
        cropApi.getAll()
      ]);

      setStats([
        { title: 'Crop Varieties', value: statsData.crops.toString(), change: '+0 this month', changeType: 'positive' as const, icon: Leaf },
        { title: 'Genetic Markers', value: statsData.traits.toString(), change: 'Active database', changeType: 'neutral' as const, icon: Dna },
        { title: 'Climate Records', value: statsData.climate.toString(), change: 'Updated daily', changeType: 'positive' as const, icon: CloudSun },
        { title: 'Predictions Made', value: statsData.predictions.toString(), change: 'Your analyses', changeType: 'neutral' as const, icon: Brain },
      ]);
      setCrops(cropsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const handlePrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      N: parseFloat(formData.get('nitrogen') as string) || 0,
      P: parseFloat(formData.get('phosphorus') as string) || 0,
      K: parseFloat(formData.get('potassium') as string) || 0,
      temperature: parseFloat(formData.get('temp') as string) || 0,
      humidity: parseFloat(formData.get('humidity') as string) || 0,
      ph: parseFloat(formData.get('ph') as string) || 0,
      rainfall: parseFloat(formData.get('rainfall') as string) || 0,
    };

    try {
      const result = await cropApi.predict(data);
      setPredictionResult(result);
      fetchDashboardData(); // Refresh stats

      toast({
        title: 'Prediction Complete',
        description: `Recommended crop: ${result.crop}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Could not connect to the prediction backend.',
        variant: 'destructive',
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setUploadedFile(file);
        toast({
          title: 'File Uploaded',
          description: `${file.name} is ready for analysis.`,
        });
      } else {
        toast({
          title: 'Invalid File',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCSVPrediction = async () => {
    if (!uploadedFile) return;

    setIsPredicting(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await fetch('http://localhost:8000/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('CSV upload failed');

      const result = await response.json();
      toast({
        title: 'CSV Analysis Complete',
        description: result.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not process CSV file.',
        variant: 'destructive',
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Research Dashboard</h1>
          <p className="text-muted-foreground mt-1">Analyze data and get crop recommendations</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={stat.title} {...stat} delay={i * 0.1} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Crop Prediction
                </CardTitle>
                <CardDescription>
                  Enter environmental data or upload CSV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="manual">Manual Input</TabsTrigger>
                    <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    <form onSubmit={handlePrediction} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="soilType">Soil Type</Label>
                        <Select defaultValue="loamy">
                          <SelectTrigger>
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="loamy">Loamy Soil</SelectItem>
                            <SelectItem value="clay">Clay Soil</SelectItem>
                            <SelectItem value="sandy">Sandy Soil</SelectItem>
                            <SelectItem value="silt">Silt Soil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="nitrogen">N (kg/ha)</Label>
                          <Input id="nitrogen" name="nitrogen" type="number" placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phosphorus">P (kg/ha)</Label>
                          <Input id="phosphorus" name="phosphorus" type="number" placeholder="0" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="potassium">K (kg/ha)</Label>
                          <Input id="potassium" name="potassium" type="number" placeholder="0" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ph">Soil pH</Label>
                          <Input id="ph" name="ph" type="number" step="0.1" placeholder="0" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="temp">Avg Temp (°C)</Label>
                          <Input id="temp" name="temp" type="number" step="0.1" placeholder="25" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="humidity">Humidity (%)</Label>
                          <Input id="humidity" name="humidity" type="number" step="0.1" placeholder="50" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rainfall">Rainfall (mm)</Label>
                        <Input id="rainfall" name="rainfall" type="number" step="0.1" placeholder="100" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region">Region</Label>
                        <Select defaultValue="tropical">
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tropical">Tropical</SelectItem>
                            <SelectItem value="subtropical">Subtropical</SelectItem>
                            <SelectItem value="temperate">Temperate</SelectItem>
                            <SelectItem value="arid">Arid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        className="w-full"
                        disabled={isPrediciting}
                      >
                        {isPrediciting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Get Prediction
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="csv">
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium text-foreground">
                          Click to upload CSV file
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports CSV files with soil, climate, and genetic data
                        </p>
                      </div>

                      {uploadedFile && (
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="hero"
                        className="w-full"
                        disabled={!uploadedFile || isPrediciting}
                        onClick={handleCSVPrediction}
                      >
                        {isPrediciting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing CSV...
                          </>
                        ) : (
                          <>
                            <Brain className="w-4 h-4" />
                            Analyze CSV Data
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Prediction Result */}
                {predictionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">Recommended Crop</h4>
                      <span className="text-sm text-primary font-medium">
                        {predictionResult.confidence}% confidence
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {predictionResult.crop}
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Expected Yield: {predictionResult.yield}
                    </p>
                    <div className="space-y-2">
                      {predictionResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <TrendingUp className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts & Data */}
          <div className="lg:col-span-2 space-y-6">
            <ChartCard
              title="Yield Trend Analysis"
              description="Weekly yield predictions based on current conditions"
              type="bar"
              data={yieldTrends}
            />

            <DataTable
              title="Crop Database"
              description="Browse available crop varieties"
              columns={cropColumns}
              data={crops}
              actions={
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search crops..." className="pl-9 w-48" />
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
