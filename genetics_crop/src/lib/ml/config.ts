/**
 * ML Pipeline Configuration
 * Configure dataset path and model storage
 */

export const ML_CONFIG = {
  // Dataset path (configurable)
  datasetPath: '/Crop_recommendation.csv',
  
  // Model storage directory
  modelDir: './models',
  
  // Training parameters
  training: {
    testSplit: 0.2, // 20% for testing
    randomSeed: 42,
    nEstimators: 100, // Number of trees in RandomForest
    maxDepth: 10,
  },
  
  // Feature columns (input features)
  features: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'],
  
  // Target column
  target: 'label',
} as const;

