/**
 * @unified4d/visualization-engine
 * 
 * Unified 4D visualization engine combining VIB34D reactive editor,
 * PPPkernel shader management, and HyperAV visualization systems.
 */

// Core engine
export { Unified4DEngine } from './core/Unified4DEngine';

// Types and interfaces
export type {
  GeometryType,
  ShaderParameters,
  InteractionConfig,
  PerformanceSettings,
  ThemeConfiguration,
  Unified4DConfig
} from './core/Unified4DEngine';

// Utility functions
export { createVisualization, configureInteractions } from './utils/helpers';

// Version info
export const VERSION = '1.0.0';

// Default configurations
export const DEFAULT_CONFIGS = {
  HYPERCUBE: {
    geometry: 'hypercube' as const,
    parameters: {
      dimension: 4.0,
      morphFactor: 0.5,
      gridDensity: 8.0,
      lineThickness: 0.03,
      rotationSpeed: 0.2
    },
    theming: {
      primary: [1.0, 0.2, 0.8] as [number, number, number], // Magenta
      secondary: [0.2, 1.0, 1.0] as [number, number, number], // Cyan
      background: [0.05, 0.0, 0.2] as [number, number, number],
      accent: [1.0, 1.0, 0.0] as [number, number, number]
    }
  },
  
  TETRAHEDRON: {
    geometry: 'tetrahedron' as const,
    parameters: {
      dimension: 3.5,
      morphFactor: 0.3,
      gridDensity: 6.0,
      lineThickness: 0.025,
      rotationSpeed: 0.15
    },
    theming: {
      primary: [0.2, 1.0, 1.0] as [number, number, number], // Cyan
      secondary: [1.0, 1.0, 1.0] as [number, number, number], // White
      background: [0.0, 0.1, 0.2] as [number, number, number],
      accent: [0.0, 1.0, 0.5] as [number, number, number]
    }
  },
  
  SPHERE: {
    geometry: 'hypersphere' as const,
    parameters: {
      dimension: 4.0,
      morphFactor: 0.7,
      gridDensity: 12.0,
      shellWidth: 0.02,
      rotationSpeed: 0.1
    },
    theming: {
      primary: [1.0, 1.0, 0.0] as [number, number, number], // Yellow
      secondary: [1.0, 0.5, 0.0] as [number, number, number], // Orange
      background: [0.1, 0.1, 0.0] as [number, number, number],
      accent: [1.0, 1.0, 1.0] as [number, number, number]
    }
  }
};

// Quick setup functions
export function createHypercubeVisualization(canvas: HTMLCanvasElement, options = {}) {
  return new Unified4DEngine(canvas, {
    ...DEFAULT_CONFIGS.HYPERCUBE,
    ...options
  });
}

export function createTetrahedronVisualization(canvas: HTMLCanvasElement, options = {}) {
  return new Unified4DEngine(canvas, {
    ...DEFAULT_CONFIGS.TETRAHEDRON,
    ...options
  });
}

export function createSphereVisualization(canvas: HTMLCanvasElement, options = {}) {
  return new Unified4DEngine(canvas, {
    ...DEFAULT_CONFIGS.SPHERE,
    ...options
  });
}