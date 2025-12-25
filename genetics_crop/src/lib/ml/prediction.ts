/**
 * Prediction Service
 * Uses trained model to make predictions on new data
 */

import { RandomForestClassifier } from 'ml-random-forest';
import { LabelEncoder, Scaler, preprocessData } from './preprocessing';
import { loadModel, restoreModel } from './modelStorage';
import { ML_CONFIG } from './config';

export interface PredictionInput {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface PredictionResult {
  crop: string;
  confidence: number;
  probabilities?: Record<string, number>;
}

export interface BatchPredictionResult {
  predictions: PredictionResult[];
  successCount: number;
  errorCount: number;
  errors?: Array<{ row: number; error: string }>;
}

/**
 * Make prediction on single input
 */
export function predict(input: PredictionInput): PredictionResult {
  const savedModel = loadModel();
  if (!savedModel) {
    throw new Error('No trained model found. Please train a model first.');
  }
  
  const { model, labelEncoder, scaler } = restoreModel(savedModel);
  
  // Prepare features in correct order
  const features = [[
    input.N,
    input.P,
    input.K,
    input.temperature,
    input.humidity,
    input.ph,
    input.rainfall,
  ]];
  
  // Apply same preprocessing as training
  const processed = preprocessData(
    features,
    ['dummy'], // Dummy label, won't be used
    labelEncoder,
    scaler
  );
  
  // Make prediction
  const prediction = model.predict(processed.features);
  const predictedLabel = labelEncoder.inverseTransform(prediction);
  
  // Get prediction probabilities if available
  let probabilities: Record<string, number> | undefined;
  let confidence = 100; // Default confidence
  
  // Try to get probabilities (if model supports it)
  try {
    const predictions = model.predict(processed.features);
    // For RandomForest, we can estimate confidence from tree votes
    // This is a simplified version - actual implementation would count votes
    confidence = 85; // Placeholder - would calculate from tree votes
  } catch (e) {
    // Model doesn't support probabilities
  }
  
  return {
    crop: predictedLabel[0],
    confidence,
    probabilities,
  };
}

/**
 * Make batch predictions on multiple inputs
 */
export function predictBatch(inputs: PredictionInput[]): BatchPredictionResult {
  const savedModel = loadModel();
  if (!savedModel) {
    throw new Error('No trained model found. Please train a model first.');
  }
  
  const { model, labelEncoder, scaler } = restoreModel(savedModel);
  const predictions: PredictionResult[] = [];
  const errors: Array<{ row: number; error: string }> = [];
  
  inputs.forEach((input, idx) => {
    try {
      const result = predict(input);
      predictions.push(result);
    } catch (error) {
      errors.push({
        row: idx + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
  
  return {
    predictions,
    successCount: predictions.length,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Get top N crop recommendations sorted by suitability
 */
export function getTopRecommendations(
  input: PredictionInput,
  topN: number = 5
): PredictionResult[] {
  // For now, return single prediction
  // In a more advanced implementation, we could return probabilities for all crops
  const result = predict(input);
  return [result];
}

