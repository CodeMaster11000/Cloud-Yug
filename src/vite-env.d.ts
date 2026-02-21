/// <reference types="vite/client" />
/// <reference types="chrome" />

// Vite Worker Module Types
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

// Chrome Extension API types
declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

// TensorFlow Models - Worker context type fix
declare module '@tensorflow-models/face-landmarks-detection' {
  export interface Keypoint {
    x: number;
    y: number;
    z?: number;
    name?: string;
  }

  export interface Face {
    keypoints: Keypoint[];
    box?: {
      xMin: number;
      yMin: number;
      xMax: number;
      yMax: number;
      width: number;
      height: number;
    };
  }

  export interface FaceLandmarksDetector {
    estimateFaces(input: any, config?: any): Promise<Face[]>;
    reset(): void;
    dispose(): void;
  }

  export interface MediaPipeFaceMeshTfjsModelConfig {
    runtime?: 'tfjs' | 'mediapipe';
    maxFaces?: number;
    refineLandmarks?: boolean;
    detectorModelUrl?: string;
    landmarkModelUrl?: string;
  }

  export interface MediaPipeFaceMeshMediaPipeModelConfig {
    runtime: 'mediapipe';
    maxFaces?: number;
    refineLandmarks?: boolean;
    solutionPath?: string;
  }

  export interface MediaPipeFaceMeshTfjsEstimationConfig {
    flipHorizontal?: boolean;
    staticImageMode?: boolean;
  }

  export interface MediaPipeFaceMeshMediaPipeEstimationConfig {
    flipHorizontal?: boolean;
    staticImageMode?: boolean;
  }
  
  export function createDetector(
    model: any,
    config?: MediaPipeFaceMeshTfjsModelConfig | MediaPipeFaceMeshMediaPipeModelConfig
  ): Promise<FaceLandmarksDetector>;
  
  export const SupportedModels: {
    MediaPipeFaceMesh: any;
  };
}
