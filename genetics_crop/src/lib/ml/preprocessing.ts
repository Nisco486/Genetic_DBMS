/**
 * Data Preprocessing Pipeline
 * Handles encoding, normalization, and data transformation
 */

import { Matrix } from 'ml-matrix';

export interface ProcessedData {
  features: number[][];
  labels: string[];
  featureNames: string[];
  labelEncoder: LabelEncoder;
  scaler: Scaler;
}

export class LabelEncoder {
  private labelToIndex: Map<string, number> = new Map();
  private indexToLabel: Map<number, string> = new Map();
  private nextIndex = 0;

  fit(labels: string[]): void {
    const uniqueLabels = Array.from(new Set(labels));
    uniqueLabels.forEach(label => {
      if (!this.labelToIndex.has(label)) {
        this.labelToIndex.set(label, this.nextIndex);
        this.indexToLabel.set(this.nextIndex, label);
        this.nextIndex++;
      }
    });
  }

  transform(labels: string[]): number[] {
    return labels.map(label => {
      const index = this.labelToIndex.get(label);
      if (index === undefined) {
        throw new Error(`Unknown label: ${label}`);
      }
      return index;
    });
  }

  inverseTransform(indices: number[]): string[] {
    return indices.map(idx => {
      const label = this.indexToLabel.get(idx);
      if (label === undefined) {
        throw new Error(`Unknown index: ${idx}`);
      }
      return label;
    });
  }

  getClasses(): string[] {
    return Array.from(this.labelToIndex.keys());
  }

  toJSON() {
    return {
      labelToIndex: Array.from(this.labelToIndex.entries()),
      indexToLabel: Array.from(this.indexToLabel.entries()),
      nextIndex: this.nextIndex,
    };
  }

  static fromJSON(json: any): LabelEncoder {
    const encoder = new LabelEncoder();
    encoder.labelToIndex = new Map(json.labelToIndex);
    encoder.indexToLabel = new Map(json.indexToLabel);
    encoder.nextIndex = json.nextIndex;
    return encoder;
  }
}

export class Scaler {
  private mean: number[] = [];
  private std: number[] = [];

  fit(features: number[][]): void {
    if (features.length === 0) return;
    
    const nFeatures = features[0].length;
    this.mean = new Array(nFeatures).fill(0);
    this.std = new Array(nFeatures).fill(0);

    // Calculate mean
    features.forEach(row => {
      row.forEach((val, idx) => {
        this.mean[idx] += val;
      });
    });
    this.mean = this.mean.map(m => m / features.length);

    // Calculate standard deviation
    features.forEach(row => {
      row.forEach((val, idx) => {
        this.std[idx] += Math.pow(val - this.mean[idx], 2);
      });
    });
    this.std = this.std.map(s => Math.sqrt(s / features.length));

    // Avoid division by zero
    this.std = this.std.map(s => s === 0 ? 1 : s);
  }

  transform(features: number[][]): number[][] {
    return features.map(row =>
      row.map((val, idx) => (val - this.mean[idx]) / this.std[idx])
    );
  }

  toJSON() {
    return {
      mean: this.mean,
      std: this.std,
    };
  }

  static fromJSON(json: any): Scaler {
    const scaler = new Scaler();
    scaler.mean = json.mean;
    scaler.std = json.std;
    return scaler;
  }
}

/**
 * Preprocess raw data: encode labels and normalize features
 */
export function preprocessData(
  features: number[][],
  labels: string[],
  labelEncoder?: LabelEncoder,
  scaler?: Scaler
): ProcessedData {
  // Fit or use existing label encoder
  const encoder = labelEncoder || new LabelEncoder();
  if (!labelEncoder) {
    encoder.fit(labels);
  }
  const encodedLabels = encoder.transform(labels);

  // Fit or use existing scaler
  const featureScaler = scaler || new Scaler();
  if (!scaler) {
    featureScaler.fit(features);
  }
  const scaledFeatures = featureScaler.transform(features);

  return {
    features: scaledFeatures,
    labels: encodedLabels.map(idx => encoder.inverseTransform([idx])[0]),
    featureNames: ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'],
    labelEncoder: encoder,
    scaler: featureScaler,
  };
}

