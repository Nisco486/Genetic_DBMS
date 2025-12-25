import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  RefreshCw,
  CheckCircle,
  Clock,
  Database,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { trainModel, calculateMetrics } from '@/lib/ml/modelTraining';
import { saveModel, getModelMetadata, deleteModel } from '@/lib/ml/modelStorage';

const featureImportance = [
  { name: 'Soil pH', value: 0 },
  { name: 'Rainfall', value: 0 },
  { name: 'Temperature', value: 0 },
  { name: 'NPK Ratio', value: 0 },
  { name: 'Genetic Markers', value: 0 },
  { name: 'Humidity', value: 0 },
];

export default function MLModel() {
  const { toast } = useToast();
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainProgress, setRetrainProgress] = useState(0);
  const [modelMetadata, setModelMetadata] = useState(getModelMetadata());
  const [currentAccuracy, setCurrentAccuracy] = useState(modelMetadata?.accuracy || 0);
  const [trainingStats, setTrainingStats] = useState(modelMetadata?.trainingStats);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Check CSV accessibility on mount
  useEffect(() => {
    const checkCSV = async () => {
      try {
        const response = await fetch('/Crop_recommendation.csv');
        if (response.ok) {
          setDebugInfo('✅ CSV file accessible');
        } else {
          setDebugInfo(`❌ CSV not found: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setDebugInfo(`❌ Error checking CSV: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    checkCSV();
  }, []);

  const handleRetrain = async () => {
    setIsRetraining(true);
    setRetrainProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setRetrainProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      console.log('🚀 Starting model training...');
      setRetrainProgress(10);
      
      // Train model
      console.log('📊 Loading dataset...');
      const result = await trainModel();
      console.log('✅ Model trained successfully!', result);
      
      // Save model
      console.log('💾 Saving model...');
      saveModel(result);
      console.log('✅ Model saved!');
      
      clearInterval(progressInterval);
      setRetrainProgress(100);
      
      // Update state
      const metadata = getModelMetadata();
      console.log('📋 Model metadata:', metadata);
      setModelMetadata(metadata);
      setCurrentAccuracy(result.accuracy);
      setTrainingStats(result.trainingStats);
      
      // Calculate detailed metrics
      const metrics = calculateMetrics(result.testPredictions, result.testLabels);
      console.log('📈 Metrics:', metrics);
      
      setTimeout(() => {
        setIsRetraining(false);
        setRetrainProgress(0);
        toast({
          title: "Model Retrained Successfully",
          description: `Accuracy: ${result.accuracy.toFixed(2)}% | Trained on ${result.trainingStats.trainSize} samples`,
        });
      }, 500);
    } catch (error) {
      console.error('❌ Training error:', error);
      setIsRetraining(false);
      setRetrainProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : "An error occurred during training";
      console.error('Error details:', errorMessage);
      
      toast({
        title: "Training Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleRollback = () => {
    deleteModel();
    setModelMetadata(null);
    setCurrentAccuracy(0);
    setTrainingStats(undefined);
    toast({
      title: "Model Rolled Back",
      description: "Model has been deleted. Please retrain to create a new model.",
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
            <h1 className="text-3xl font-bold text-foreground">ML Model</h1>
            <p className="text-muted-foreground mt-1">Model monitoring, metrics, and retraining controls</p>
          </div>
          <Button 
            variant="hero" 
            className="gap-2"
            onClick={handleRetrain}
            disabled={isRetraining}
          >
            {isRetraining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Retraining...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Retrain Model
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRollback}
            disabled={isRetraining}
          >
            <AlertTriangle className="w-4 h-4" />
            Rollback Model
          </Button>
        </motion.div>

        {/* Retraining Progress */}
        {isRetraining && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                  <span className="font-medium text-foreground">Retraining in progress...</span>
                </div>
                <Progress value={retrainProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">{retrainProgress}% complete</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Model Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">Operational</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {modelMetadata ? `v${modelMetadata.version}` : 'Not Trained'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Training Data</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {trainingStats?.trainSize.toLocaleString() || '0'}
                    </p>
                    {modelMetadata && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last trained: {new Date(modelMetadata.trainedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Accuracy</p>
                    <p className="text-xl font-bold text-foreground mt-1">
                      {currentAccuracy > 0 ? `${currentAccuracy.toFixed(1)}%` : '0%'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Metrics & Feature Importance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Model Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Model Metrics
                </CardTitle>
                <CardDescription>Performance indicators for the current model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">Accuracy</span>
                      <span className="text-sm font-medium text-foreground">
                        {currentAccuracy > 0 ? `${currentAccuracy.toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                    <Progress value={currentAccuracy} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">Precision</span>
                      <span className="text-sm font-medium text-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">Recall</span>
                      <span className="text-sm font-medium text-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">F1 Score</span>
                      <span className="text-sm font-medium text-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-foreground">Confidence</span>
                      <span className="text-sm font-medium text-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature Importance */}
          <ChartCard
            title="Feature Importance"
            description="Impact of each feature on predictions"
            type="bar"
            data={featureImportance}
          />
        </div>

        {/* Model History */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Model Information</CardTitle>
              <CardDescription>Current model version and training details</CardDescription>
            </CardHeader>
            <CardContent>
              {modelMetadata ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div>
                        <p className="font-medium text-foreground">v{modelMetadata.version}</p>
                        <p className="text-sm text-muted-foreground">
                          Trained: {new Date(modelMetadata.trainedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        Accuracy: {modelMetadata.accuracy.toFixed(1)}%
                      </span>
                      <Badge variant="default">Active</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Training Samples</p>
                      <p className="text-sm font-medium">{modelMetadata.trainingStats.trainSize.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Test Samples</p>
                      <p className="text-sm font-medium">{modelMetadata.trainingStats.testSize.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Features</p>
                      <p className="text-sm font-medium">{modelMetadata.trainingStats.nFeatures}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Classes</p>
                      <p className="text-sm font-medium">{modelMetadata.trainingStats.nClasses}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No model trained yet. Click "Retrain Model" to start training.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Debug Info */}
        {debugInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Debug Information</p>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {debugInfo}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Check browser console (F12) for detailed logs during training.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Alert */}
        {!modelMetadata && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated" className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Model Not Trained</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No trained model found. Click "Retrain Model" to train a new RandomForest model on the crop recommendation dataset.
                    </p>
                    {debugInfo && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {debugInfo}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
