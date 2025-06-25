/**
 * Utility functions for Unified4D visualization engine
 */

import { Unified4DEngine, Unified4DConfig, InteractionConfig } from '../core/Unified4DEngine';

/**
 * Create a visualization with smart defaults based on container size
 */
export function createVisualization(
  container: HTMLElement | HTMLCanvasElement,
  config: Partial<Unified4DConfig> = {}
): Unified4DEngine {
  let canvas: HTMLCanvasElement;
  
  if (container instanceof HTMLCanvasElement) {
    canvas = container;
  } else {
    // Create canvas and append to container
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
  }
  
  // Set canvas size to match container
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    // Scale down to maintain resolution
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
  };
  
  // Initial resize
  resizeCanvas();
  
  // Create engine
  const engine = new Unified4DEngine(canvas, config);
  
  // Handle window resize
  const resizeObserver = new ResizeObserver(() => {
    resizeCanvas();
  });
  
  if (container !== canvas) {
    resizeObserver.observe(container);
  } else {
    resizeObserver.observe(canvas.parentElement || document.body);
  }
  
  return engine;
}

/**
 * Configure interaction settings with smart defaults
 */
export function configureInteractions(
  baseConfig: Partial<InteractionConfig> = {}
): Required<InteractionConfig> {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const defaults: Required<InteractionConfig> = {
    scrollSensitivity: isMobile ? 1.0 : 2.0,
    clickSensitivity: 5.0,
    mouseSensitivity: isMobile ? 3.0 : 5.0,
    decayTime: 3000,
    idleThreshold: isMobile ? 5000 : 3000, // Longer idle time on mobile
  };
  
  return { ...defaults, ...baseConfig };
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private updateInterval = 1000; // Update FPS every second
  
  public getFPS(): number {
    return Math.round(this.fps);
  }
  
  public update(timestamp: number): void {
    this.frameCount++;
    
    if (timestamp - this.lastTime >= this.updateInterval) {
      this.fps = (this.frameCount * 1000) / (timestamp - this.lastTime);
      this.frameCount = 0;
      this.lastTime = timestamp;
    }
  }
  
  public isPerformanceGood(): boolean {
    return this.fps >= 55; // Consider 55+ FPS as good performance
  }
}

/**
 * Color utility functions
 */
export const ColorUtils = {
  /**
   * Convert HSL to RGB
   */
  hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [r, g, b];
  },
  
  /**
   * Create theme colors with proper contrast
   */
  createTheme(baseHue: number, saturation = 80, lightness = 60) {
    const primary = this.hslToRgb(baseHue, saturation, lightness);
    const secondary = this.hslToRgb((baseHue + 180) % 360, saturation, lightness);
    const background = this.hslToRgb(baseHue, 100, 5);
    const accent = this.hslToRgb((baseHue + 60) % 360, 100, 70);
    
    return { primary, secondary, background, accent };
  }
};

/**
 * Geometry-specific parameter presets
 */
export const GeometryPresets = {
  hypercube: {
    stable: { morphFactor: 0.2, rotationSpeed: 0.1, gridDensity: 6.0 },
    dynamic: { morphFactor: 0.8, rotationSpeed: 0.5, gridDensity: 12.0 },
    chaotic: { morphFactor: 1.2, rotationSpeed: 1.0, gridDensity: 20.0 }
  },
  
  tetrahedron: {
    minimal: { morphFactor: 0.1, rotationSpeed: 0.05, gridDensity: 4.0 },
    balanced: { morphFactor: 0.3, rotationSpeed: 0.15, gridDensity: 6.0 },
    intense: { morphFactor: 0.6, rotationSpeed: 0.3, gridDensity: 10.0 }
  },
  
  hypersphere: {
    calm: { morphFactor: 0.3, rotationSpeed: 0.1, shellWidth: 0.03 },
    flowing: { morphFactor: 0.7, rotationSpeed: 0.2, shellWidth: 0.02 },
    turbulent: { morphFactor: 1.0, rotationSpeed: 0.4, shellWidth: 0.015 }
  }
};

/**
 * Validation utilities
 */
export const Validation = {
  /**
   * Clamp a value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  },
  
  /**
   * Validate and sanitize shader parameters
   */
  sanitizeParameters(params: any): any {
    const sanitized: any = {};
    
    // Define parameter bounds
    const bounds = {
      dimension: [3.0, 5.0],
      morphFactor: [0.0, 2.0],
      rotationSpeed: [0.0, 3.0],
      gridDensity: [1.0, 25.0],
      lineThickness: [0.001, 0.1],
      shellWidth: [0.005, 0.1],
      audioBass: [0.0, 1.0],
      audioMid: [0.0, 1.0],
      audioHigh: [0.0, 1.0]
    };
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'number' && bounds[key as keyof typeof bounds]) {
        const [min, max] = bounds[key as keyof typeof bounds];
        sanitized[key] = this.clamp(value, min, max);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
};

/**
 * WebGL capability detection
 */
export const WebGLUtils = {
  /**
   * Check WebGL support and capabilities
   */
  getCapabilities(): {
    webgl1: boolean;
    webgl2: boolean;
    maxTextureSize: number;
    maxViewportDims: [number, number];
    extensions: string[];
  } {
    const canvas = document.createElement('canvas');
    
    // Test WebGL 1
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const webgl1 = !!gl1;
    
    // Test WebGL 2
    const gl2 = canvas.getContext('webgl2');
    const webgl2 = !!gl2;
    
    const gl = gl2 || gl1;
    
    if (!gl) {
      return {
        webgl1: false,
        webgl2: false,
        maxTextureSize: 0,
        maxViewportDims: [0, 0],
        extensions: []
      };
    }
    
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
    const extensions = gl.getSupportedExtensions() || [];
    
    return {
      webgl1,
      webgl2,
      maxTextureSize,
      maxViewportDims,
      extensions
    };
  },
  
  /**
   * Check if device can handle high-performance rendering
   */
  isHighPerformanceDevice(): boolean {
    const caps = this.getCapabilities();
    return caps.webgl2 && caps.maxTextureSize >= 4096;
  }
};