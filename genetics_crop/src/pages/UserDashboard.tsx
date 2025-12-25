import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Loader2,
  Upload,
  FileText,
  X,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Thermometer,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cropApi } from '@/lib/api';

export default function UserDashboard() {
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<null | {
    crop: string;
    confidence: number;
    yield: string;
    recommendations: string[];
  }>(null);
  const [recentPredictions, setRecentPredictions] = useState<any[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentPredictions();
  }, []);

  const fetchRecentPredictions = async () => {
    try {
      const stats = await cropApi.getDashboardStats();
      // In a real implementation, you'd have a separate endpoint for prediction history
      // For now, we'll just show the count
      setRecentPredictions([]);
    } catch (error) {
      console.error('Failed to fetch predictions:', error);
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
      fetchRecentPredictions();

      toast({
        title: 'Analysis Complete',
        description: `Recommended: ${result.crop} (${result.confidence}% confidence)`,
      });
    } catch (error: any) {
      toast({
        title: 'Prediction Failed',
        description: error.message || 'Could not connect to the ML service.',
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
          title: 'File Ready',
          description: `${file.name} loaded successfully.`,
        });
      } else {
        toast({
          title: 'Invalid Format',
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

      if (!response.ok) throw new Error('CSV processing failed');

      const result = await response.json();
      toast({
        title: 'Batch Analysis Complete',
        description: result.message,
      });
      fetchRecentPredictions();
    } catch (error) {
      toast({
        title: 'Processing Error',
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
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-foreground">Prediction Workspace</h1>
          <p className="text-muted-foreground mt-2">
            Enter environmental parameters to receive ML-powered crop recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-2 border-border shadow-lg">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Brain className="w-6 h-6 text-primary" />
                  Data Input
                </CardTitle>
                <CardDescription className="text-base">
                  Choose manual entry or upload a CSV dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="manual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="manual" className="text-base">Manual Entry</TabsTrigger>
                    <TabsTrigger value="csv" className="text-base">CSV Upload</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual">
                    <form onSubmit={handlePrediction} className="space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Nitrogen (N)</Label>
                          <Input
                            name="nitrogen"
                            type="number"
                            placeholder="kg/ha"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Phosphorus (P)</Label>
                          <Input
                            name="phosphorus"
                            type="number"
                            placeholder="kg/ha"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Potassium (K)</Label>
                          <Input
                            name="potassium"
                            type="number"
                            placeholder="kg/ha"
                            className="h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Thermometer className="w-4 h-4" />
                            Temperature (°C)
                          </Label>
                          <Input
                            name="temp"
                            type="number"
                            step="0.1"
                            placeholder="25.0"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <Droplets className="w-4 h-4" />
                            Humidity (%)
                          </Label>
                          <Input
                            name="humidity"
                            type="number"
                            step="0.1"
                            placeholder="65.0"
                            className="h-11"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Soil pH</Label>
                          <Input
                            name="ph"
                            type="number"
                            step="0.1"
                            placeholder="6.5"
                            className="h-11"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold">Rainfall (mm)</Label>
                          <Input
                            name="rainfall"
                            type="number"
                            step="0.1"
                            placeholder="100.0"
                            className="h-11"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full h-12 text-base"
                        disabled={isPredicting}
                      >
                        {isPredicting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Running Analysis...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Generate Prediction
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="csv">
                    <div className="space-y-6">
                      <div
                        className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-lg font-medium text-foreground mb-2">
                          Upload CSV Dataset
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Click to browse or drag and drop your file here
                        </p>
                      </div>

                      {uploadedFile && (
                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary" />
                            <div>
                              <p className="font-medium text-foreground">{uploadedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={removeFile}>
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      )}

                      <Button
                        variant="hero"
                        size="lg"
                        className="w-full h-12 text-base"
                        disabled={!uploadedFile || isPredicting}
                        onClick={handleCSVPrediction}
                      >
                        {isPredicting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing Dataset...
                          </>
                        ) : (
                          <>
                            <Brain className="w-5 h-5" />
                            Analyze CSV
                          </>
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-border shadow-lg h-full">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Prediction Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {predictionResult ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-2">Recommended Crop</p>
                      <h2 className="text-3xl font-bold text-primary mb-3">
                        {predictionResult.crop}
                      </h2>
                      <div className="flex items-center justify-center gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="font-bold text-foreground">{predictionResult.confidence}%</p>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div>
                          <p className="text-muted-foreground">Yield</p>
                          <p className="font-bold text-foreground">{predictionResult.yield}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Recommendations
                      </h4>
                      {predictionResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <p className="text-sm text-muted-foreground">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Brain className="w-16 h-16 text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground">
                      Enter data and run prediction to see results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
