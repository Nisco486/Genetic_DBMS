/**
 * Model Persistence
 * Save and load trained models with metadata
 */

import { RandomForestClassifier } from 'ml-random-forest';
import { LabelEncoder, Scaler } from './preprocessing';
import { TrainingResult } from './modelTraining';

export interface SavedModel {
  modelData: any; // Serialized model
  labelEncoder: any;
  scaler: any;
  metadata: {
    version: string;
    trainedAt: string;
    accuracy: number;
    trainingStats: {
      trainSize: number;
      testSize: number;
      nFeatures: number;
      nClasses: number;
      trainingTime: number;
    };
    featureNames: string[];
  };
}

const STORAGE_KEY = 'ml_crop_model';
const STORAGE_VERSION = '1.0.0';

/**
 * Save trained model to localStorage
 */
export function saveModel(result: TrainingResult): void {
  try {
    const savedModel: SavedModel = {
      modelData: result.model.toJSON(),
      labelEncoder: result.labelEncoder.toJSON(),
      scaler: result.scaler.toJSON(),
      metadata: {
        version: STORAGE_VERSION,
        trainedAt: new Date().toISOString(),
        accuracy: result.accuracy,
        trainingStats: result.trainingStats,
        featureNames: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'],
      },
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedModel));
    console.log('✅ Model saved successfully');
  } catch (error) {
    console.error('❌ Error saving model:', error);
    throw new Error(`Failed to save model: ${error}`);
  }
}

/**
 * Load trained model from localStorage
 */
export function loadModel(): SavedModel | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    
    const savedModel: SavedModel = JSON.parse(stored);
    
    // Validate version compatibility
    if (savedModel.metadata.version !== STORAGE_VERSION) {
      console.warn(`⚠️ Model version mismatch: ${savedModel.metadata.version} vs ${STORAGE_VERSION}`);
    }
    
    return savedModel;
  } catch (error) {
    console.error('❌ Error loading model:', error);
    return null;
  }
}

/**
 * Restore model from saved data
 */
export function restoreModel(savedModel: SavedModel): {
  model: RandomForestClassifier;
  labelEncoder: LabelEncoder;
  scaler: Scaler;
} {
  const model = RandomForestClassifier.load(savedModel.modelData);
  const labelEncoder = LabelEncoder.fromJSON(savedModel.labelEncoder);
  const scaler = Scaler.fromJSON(savedModel.scaler);
  
  return { model, labelEncoder, scaler };
}

/**
 * Check if a trained model exists
 */
export function hasModel(): boolean {
  return loadModel() !== null;
}

/**
 * Get model metadata without loading full model
 */
export function getModelMetadata(): SavedModel['metadata'] | null {
  const saved = loadModel();
  return saved ? saved.metadata : null;
}

/**
 * Delete saved model
 */
export function deleteModel(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Model deleted');
}

