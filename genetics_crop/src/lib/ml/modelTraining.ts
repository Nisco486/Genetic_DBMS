/**
 * Model Training Pipeline
 * Trains RandomForest model and evaluates performance
 */

import { RandomForestClassifier } from 'ml-random-forest';
import { loadDataset, trainTestSplit } from './dataLoader';
import { preprocessData, LabelEncoder, Scaler } from './preprocessing';
import { ML_CONFIG } from './config';

export interface TrainingResult {
  model: RandomForestClassifier;
  accuracy: number;
  testPredictions: string[];
  testLabels: string[];
  labelEncoder: LabelEncoder;
  scaler: Scaler;
  trainingStats: {
    trainSize: number;
    testSize: number;
    nFeatures: number;
    nClasses: number;
    trainingTime: number;
  };
}

export interface ModelMetrics {
  accuracy: number;
  confusionMatrix?: Record<string, Record<string, number>>;
  classReport?: Record<string, { precision: number; recall: number; f1: number }>;
}

/**
 * Train RandomForest model on dataset
 */
export async function trainModel(
  csvPath?: string,
  options?: {
    testSplit?: number;
    nEstimators?: number;
    maxDepth?: number;
    randomSeed?: number;
  }
): Promise<TrainingResult> {
  const startTime = Date.now();
  
  // Load and validate dataset
  console.log('📊 Loading dataset...');
  const dataset = await loadDataset(csvPath);
  console.log(`✅ Loaded ${dataset.stats.validRows} valid rows`);
  console.log(`📈 Label distribution:`, dataset.stats.labelDistribution);
  
  // Split dataset
  const split = trainTestSplit(
    dataset.features,
    dataset.labels,
    options?.testSplit ?? ML_CONFIG.training.testSplit,
    options?.randomSeed ?? ML_CONFIG.training.randomSeed
  );
  
  console.log(`📦 Train: ${split.trainFeatures.length}, Test: ${split.testFeatures.length}`);
  
  // Preprocess training data
  console.log('🔄 Preprocessing data...');
  const trainProcessed = preprocessData(split.trainFeatures, split.trainLabels);
  
  // Preprocess test data using same encoders/scalers
  const testProcessed = preprocessData(
    split.testFeatures,
    split.testLabels,
    trainProcessed.labelEncoder,
    trainProcessed.scaler
  );
  
  // Train model
  console.log('🌲 Training RandomForest model...');
  const model = new RandomForestClassifier({
    nEstimators: options?.nEstimators ?? ML_CONFIG.training.nEstimators,
    maxDepth: options?.maxDepth ?? ML_CONFIG.training.maxDepth,
    seed: options?.randomSeed ?? ML_CONFIG.training.randomSeed,
  });
  
  model.train(trainProcessed.features, trainProcessed.labels.map((_, idx) => 
    trainProcessed.labelEncoder.transform([trainProcessed.labels[idx]])[0]
  ));
  
  // Evaluate on test set
  console.log('📊 Evaluating model...');
  const testPredictions = model.predict(testProcessed.features);
  const predictedLabels = trainProcessed.labelEncoder.inverseTransform(testPredictions);
  
  // Calculate accuracy
  let correct = 0;
  testProcessed.labels.forEach((trueLabel, idx) => {
    if (trueLabel === predictedLabels[idx]) {
      correct++;
    }
  });
  const accuracy = (correct / testProcessed.labels.length) * 100;
  
  const trainingTime = Date.now() - startTime;
  
  console.log(`✅ Training complete! Accuracy: ${accuracy.toFixed(2)}%`);
  console.log(`⏱️  Training time: ${trainingTime}ms`);
  
  return {
    model,
    accuracy,
    testPredictions: predictedLabels,
    testLabels: testProcessed.labels,
    labelEncoder: trainProcessed.labelEncoder,
    scaler: trainProcessed.scaler,
    trainingStats: {
      trainSize: split.trainFeatures.length,
      testSize: split.testFeatures.length,
      nFeatures: trainProcessed.features[0].length,
      nClasses: trainProcessed.labelEncoder.getClasses().length,
      trainingTime,
    },
  };
}

/**
 * Calculate detailed metrics
 */
export function calculateMetrics(
  predictions: string[],
  trueLabels: string[]
): ModelMetrics {
  let correct = 0;
  const confusionMatrix: Record<string, Record<string, number>> = {};
  
  // Initialize confusion matrix
  const uniqueLabels = Array.from(new Set([...predictions, ...trueLabels]));
  uniqueLabels.forEach(label => {
    confusionMatrix[label] = {};
    uniqueLabels.forEach(otherLabel => {
      confusionMatrix[label][otherLabel] = 0;
    });
  });
  
  // Build confusion matrix
  predictions.forEach((pred, idx) => {
    const trueLabel = trueLabels[idx];
    confusionMatrix[trueLabel][pred] = (confusionMatrix[trueLabel][pred] || 0) + 1;
    if (pred === trueLabel) {
      correct++;
    }
  });
  
  const accuracy = (correct / predictions.length) * 100;
  
  // Calculate per-class metrics
  const classReport: Record<string, { precision: number; recall: number; f1: number }> = {};
  uniqueLabels.forEach(label => {
    const tp = confusionMatrix[label][label] || 0;
    const fp = uniqueLabels.reduce((sum, other) => 
      sum + (other !== label ? (confusionMatrix[other][label] || 0) : 0), 0
    );
    const fn = uniqueLabels.reduce((sum, other) => 
      sum + (other !== label ? (confusionMatrix[label][other] || 0) : 0), 0
    );
    
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    
    classReport[label] = { precision, recall, f1 };
  });
  
  return {
    accuracy,
    confusionMatrix,
    classReport,
  };
}

