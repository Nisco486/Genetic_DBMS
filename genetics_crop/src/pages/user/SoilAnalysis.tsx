import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  FlaskConical,
  Loader2,
  CheckCircle2,
  XCircle,
  Leaf,
  Droplets,
  Beaker,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const cropCompatibility = [
  { crop: 'Rice', score: 0, suitable: true },
  { crop: 'Wheat', score: 0, suitable: true },
  { crop: 'Maize', score: 0, suitable: true },
  { crop: 'Cotton', score: 0, suitable: false },
  { crop: 'Sugarcane', score: 0, suitable: true },
  { crop: 'Soybean', score: 0, suitable: false },
  { crop: 'Groundnut', score: 0, suitable: true },
  { crop: 'Mustard', score: 0, suitable: false },
];

export default function SoilAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    healthScore: number;
    status: string;
    recommendations: string[];
  } | null>(null);
  const [formData, setFormData] = useState({
    ph: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    soilType: 'loamy',
    moisture: '',
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalysisResult({
      healthScore: 0,
      status: 'Pending Analysis',
      recommendations: [
        'Add nitrogen fertilizer: 0 kg/ha',
        'Maintain pH between 0.0-0.0',
        'Improve organic matter content',
        'Consider crop rotation for soil health',
      ],
    });
    
    setIsAnalyzing(false);
    toast({
      title: 'Soil Analysis Complete',
      description: 'View your soil health report below.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-primary" />
            Soil Analysis
          </h1>
          <p className="text-muted-foreground mt-1">Analyze soil suitability for crops</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Soil Input Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-primary" />
                  Soil Parameters
                </CardTitle>
                <CardDescription>Enter soil sample values</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ph">pH Value</Label>
                    <Input 
                      id="ph" 
                      type="number" 
                      step="0.1" 
                      placeholder="0.0"
                      value={formData.ph}
                      onChange={(e) => handleInputChange('ph', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>NPK Values (kg/ha)</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        placeholder="N: 0" 
                        type="number"
                        value={formData.nitrogen}
                        onChange={(e) => handleInputChange('nitrogen', e.target.value)}
                      />
                      <Input 
                        placeholder="P: 0" 
                        type="number"
                        value={formData.phosphorus}
                        onChange={(e) => handleInputChange('phosphorus', e.target.value)}
                      />
                      <Input 
                        placeholder="K: 0" 
                        type="number"
                        value={formData.potassium}
                        onChange={(e) => handleInputChange('potassium', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="soilType">Soil Type</Label>
                    <Select 
                      value={formData.soilType} 
                      onValueChange={(value) => handleInputChange('soilType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loamy">Loamy</SelectItem>
                        <SelectItem value="clay">Clay</SelectItem>
                        <SelectItem value="sandy">Sandy</SelectItem>
                        <SelectItem value="silt">Silt</SelectItem>
                        <SelectItem value="peat">Peat</SelectItem>
                        <SelectItem value="chalky">Chalky</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moisture">Moisture Level (%)</Label>
                    <Input 
                      id="moisture" 
                      type="number" 
                      placeholder="0"
                      value={formData.moisture}
                      onChange={(e) => handleInputChange('moisture', e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Soil...
                      </>
                    ) : (
                      <>
                        <FlaskConical className="w-4 h-4" />
                        Analyze Soil
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Soil Health Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-primary" />
                  Soil Health Indicator
                </CardTitle>
                <CardDescription>Overall soil quality assessment</CardDescription>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                        <span className="text-4xl font-bold text-primary">
                          {analysisResult.healthScore}%
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{analysisResult.status}</p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Recommendations</h4>
                      {analysisResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <Leaf className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Enter soil parameters and click "Analyze Soil" to see health assessment
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Crop Compatibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Crop Compatibility
                </CardTitle>
                <CardDescription>Suitability scores for various crops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cropCompatibility.map((crop, i) => (
                    <motion.div 
                      key={crop.crop}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {crop.suitable ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-sm font-medium text-foreground">{crop.crop}</span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          crop.suitable ? 'text-primary' : 'text-destructive'
                        }`}>
                          {crop.score}%
                        </span>
                      </div>
                      <Progress 
                        value={crop.score} 
                        className={`h-2 ${crop.suitable ? '' : '[&>div]:bg-destructive'}`}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
