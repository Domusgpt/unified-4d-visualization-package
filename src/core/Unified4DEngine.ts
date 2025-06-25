/**
 * Unified 4D Visualization Engine
 * 
 * Core engine combining VIB34D reactive editor, PPPkernel shader management,
 * and HyperAV visualization systems into a unified TypeScript package.
 */

// Import shader source files.
// Note: This assumes a build setup (e.g., Rollup with rollup-plugin-string or Webpack with raw-loader)
// that handles .vert and .frag files and makes their content available as string imports.

// @ts-ignore - Assume bundler handles this import
import commonVertexShaderSource from '../shaders/common.vert';
// @ts-ignore - Assume bundler handles this import
import hypercubeFragmentShaderSource from '../shaders/hypercube.frag';
// @ts-ignore - Assume bundler handles this import
import hypersphereFragmentShaderSource from '../shaders/hypersphere.frag';
// @ts-ignore - Assume bundler handles this import
import tetrahedronFragmentShaderSource from '../shaders/tetrahedron.frag';
// @ts-ignore - Assume bundler handles this import
import torusFragmentShaderSource from '../shaders/torus.frag';
// @ts-ignore - Assume bundler handles this import
import kleinBottleFragmentShaderSource from '../shaders/klein_bottle.frag';
// @ts-ignore - Assume bundler handles this import
import fractalFragmentShaderSource from '../shaders/fractal.frag';
// @ts-ignore - Assume bundler handles this import
import waveFunctionFragmentShaderSource from '../shaders/wave_function.frag';
// @ts-ignore - Assume bundler handles this import
import crystalLatticeFragmentShaderSource from '../shaders/crystal_lattice.frag';

export interface GeometryType {
  HYPERCUBE: 'hypercube';
  HYPERSPHERE: 'hypersphere';
  TETRAHEDRON: 'tetrahedron';
  TORUS: 'torus';
  KLEIN_BOTTLE: 'klein';
  FRACTAL: 'fractal';
  WAVE_FUNCTION: 'wave';
  CRYSTAL_LATTICE: 'crystal';
}

export interface ShaderParameters {
  // Core Mathematics & Timing
  time: number;
  resolution: [number, number];
  mouse: [number, number];
  dimension: number;
  morphFactor: number;
  rotationSpeed: number;
  
  // Grid & Lattice Parameters
  gridDensity: number;
  lineThickness: number;
  universeModifier: number;
  patternIntensity: number;
  
  // Geometry-Specific Parameters
  shellWidth: number;
  tetraThickness: number;
  glitchIntensity: number;
  colorShift: number;
  
  // Interaction System (Visual Reactivity)
  audioBass: number;   // Scroll reactivity
  audioMid: number;    // Click reactivity
  audioHigh: number;   // Mouse reactivity
}

export interface InteractionConfig {
  scrollSensitivity: number;
  clickSensitivity: number;
  mouseSensitivity: number;
  decayTime: number;
  idleThreshold: number;
}

export interface PerformanceSettings {
  targetFPS: number;
  maxTurns: number;
  enableWebGL2: boolean;
  enableUBO: boolean;
  memoryLimit: number;
}

export interface ThemeConfiguration {
  primary: [number, number, number];
  secondary: [number, number, number];
  background: [number, number, number];
  accent: [number, number, number];
}

export interface Unified4DConfig {
  geometry: keyof GeometryType;
  parameters: Partial<ShaderParameters>;
  interactions: Partial<InteractionConfig>;
  performance: Partial<PerformanceSettings>;
  theming: Partial<ThemeConfiguration>;
}

export class Unified4DEngine {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext | WebGL2RenderingContext;
  private isWebGL2: boolean;
  private animationFrameId: number | null = null;
  private isRendering: boolean = false;
  
  private config: Required<Unified4DConfig>;
  private startTime: number = 0;
  private lastTime: number = 0;
  
  // Shader and geometry management
  private shaderProgram: WebGLProgram | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  private uniformLocations: Map<string, WebGLUniformLocation> = new Map();

  private shaderSources: Record<keyof GeometryType, string>;
  
  // Interaction tracking
  private interactionState = {
    scroll: { velocity: 0, intensity: 0 },
    click: { frequency: 0, intensity: 0 },
    mouse: { position: [0.5, 0.5], velocity: 0, intensity: 0 },
    idle: { duration: 0, isIdle: false }
  };

  constructor(canvas: HTMLCanvasElement, config: Partial<Unified4DConfig> = {}) {
    this.canvas = canvas;

    this.shaderSources = {
      HYPERCUBE: hypercubeFragmentShaderSource,
      HYPERSPHERE: hypersphereFragmentShaderSource,
      TETRAHEDRON: tetrahedronFragmentShaderSource,
      TORUS: torusFragmentShaderSource,
      KLEIN_BOTTLE: kleinBottleFragmentShaderSource,
      FRACTAL: fractalFragmentShaderSource,
      WAVE_FUNCTION: waveFunctionFragmentShaderSource,
      CRYSTAL_LATTICE: crystalLatticeFragmentShaderSource,
    };
    
    // Initialize WebGL context
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      this.gl = gl2;
      this.isWebGL2 = true;
      console.log('Unified4D: WebGL2 context initialized');
    } else {
      const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl1) {
        throw new Error('Unified4D: WebGL not supported');
      }
      this.gl = gl1;
      this.isWebGL2 = false;
      console.log('Unified4D: WebGL1 context initialized');
    }
    
    // Merge config with defaults
    this.config = this.mergeConfig(config);
    
    // Initialize engine
    this.initialize();
  }

  private mergeConfig(config: Partial<Unified4DConfig>): Required<Unified4DConfig> {
    return {
      geometry: config.geometry || 'hypercube',
      parameters: {
        time: 0,
        resolution: [this.canvas.width, this.canvas.height],
        mouse: [0.5, 0.5],
        dimension: 4.0,
        morphFactor: 0.5,
        rotationSpeed: 0.2,
        gridDensity: 8.0,
        lineThickness: 0.03,
        universeModifier: 1.0,
        patternIntensity: 1.0,
        shellWidth: 0.025,
        tetraThickness: 0.035,
        glitchIntensity: 0.0,
        colorShift: 0.0,
        audioBass: 0.0,
        audioMid: 0.0,
        audioHigh: 0.0,
        ...config.parameters
      },
      interactions: {
        scrollSensitivity: 2.0,
        clickSensitivity: 5.0,
        mouseSensitivity: 5.0,
        decayTime: 3000,
        idleThreshold: 3000,
        ...config.interactions
      },
      performance: {
        targetFPS: 60,
        maxTurns: 100,
        enableWebGL2: true,
        enableUBO: true,
        memoryLimit: 100,
        ...config.performance
      },
      theming: {
        primary: [1.0, 0.2, 0.8],
        secondary: [0.2, 1.0, 1.0],
        background: [0.05, 0.0, 0.2],
        accent: [1.0, 1.0, 0.0],
        ...config.theming
      }
    };
  }

  private initialize(): void {
    this.setupWebGL();
    this.createBuffers();
    this.compileShaders();
    this.setupInteractionHandlers();
    console.log('Unified4D: Engine initialized successfully');
  }

  private setupWebGL(): void {
    const gl = this.gl;
    
    // Set clear color to theme background
    const bg = this.config.theming.background;
    gl.clearColor(bg[0], bg[1], bg[2], 1.0);
    
    // Set viewport
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    
    // Disable depth testing for 2D rendering
    gl.disable(gl.DEPTH_TEST);
    
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  private createBuffers(): void {
    const gl = this.gl;
    
    // Create fullscreen quad vertices
    const vertices = new Float32Array([
      -1, -1,  // Bottom left
       1, -1,  // Bottom right
      -1,  1,  // Top left
       1,  1   // Top right
    ]);
    
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  private compileShaders(): void {
    const gl = this.gl;
    
    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    
    // Fragment shader source (basic hypercube implementation)
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_dimension;
      uniform float u_morphFactor;
      uniform float u_rotationSpeed;
      uniform float u_gridDensity;
      uniform float u_lineThickness;
      uniform float u_audioBass;
      uniform float u_audioMid;
      uniform float u_audioHigh;
      uniform vec3 u_primaryColor;
      uniform vec3 u_secondaryColor;
      uniform vec3 u_backgroundColor;
      
      // 4D rotation matrices
      mat4 rotXW(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat4(
          c, 0, 0, -s,
          0, 1, 0, 0,
          0, 0, 1, 0,
          s, 0, 0, c
        );
      }
      
      mat4 rotYZ(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat4(
          1, 0, 0, 0,
          0, c, -s, 0,
          0, s, c, 0,
          0, 0, 0, 1
        );
      }
      
      vec3 project4Dto3D(vec4 p4d) {
        float w = p4d.w + 2.5;
        return p4d.xyz / max(0.1, w);
      }
      
      float calculateLattice(vec3 p) {
        float dynamicGridDensity = max(0.1, u_gridDensity * (1.0 + u_audioBass * 0.7));
        float dynamicLineThickness = max(0.002, u_lineThickness * (1.0 - u_audioMid * 0.6));
        
        // 3D lattice calculation
        vec3 p_grid3D = fract(p * dynamicGridDensity * 0.5 + u_time * 0.01);
        vec3 dist3D = abs(p_grid3D - 0.5);
        float box3D = max(dist3D.x, max(dist3D.y, dist3D.z));
        float lattice3D = smoothstep(0.5, 0.5 - dynamicLineThickness, box3D);
        
        // 4D extension
        float dim_factor = smoothstep(3.0, 4.5, u_dimension);
        if (dim_factor > 0.01) {
          float w_coord = sin(p.x*1.4 - p.y*0.7 + p.z*1.5 + u_time * 0.25)
                        * cos(length(p) * 1.1 - u_time * 0.35 + u_audioMid * 2.5)
                        * dim_factor * (0.4 + u_morphFactor * 0.6 + u_audioHigh * 0.6);
          
          vec4 p4d = vec4(p, w_coord);
          p4d = rotXW(u_time * 0.33 * u_rotationSpeed) * 
                rotYZ(u_time * 0.28 * u_rotationSpeed) * p4d;
          
          vec3 projectedP = project4Dto3D(p4d);
          vec3 p_grid4D = fract(projectedP * dynamicGridDensity * 0.5 + u_time * 0.015);
          vec3 dist4D = abs(p_grid4D - 0.5);
          float box4D = max(dist4D.x, max(dist4D.y, dist4D.z));
          float lattice4D = smoothstep(0.5, 0.5 - dynamicLineThickness, box4D);
          
          return mix(lattice3D, lattice4D, smoothstep(0.0, 1.0, u_morphFactor));
        }
        
        return lattice3D;
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        // Apply mouse offset
        vec2 mouseOffset = (u_mouse - 0.5) * 2.0;
        uv += mouseOffset * 0.5;
        
        vec3 p = vec3(uv * 2.0, 0.0);
        float lattice = calculateLattice(p);
        
        // Color mixing based on lattice intensity
        vec3 color = mix(u_backgroundColor, u_primaryColor, lattice);
        color = mix(color, u_secondaryColor, lattice * u_audioHigh);
        
        // Apply glow effect
        float glow = lattice * (1.0 + u_audioHigh * 0.5);
        color *= glow;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
    
    // Compile shaders
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    // Create and link program
    this.shaderProgram = gl.createProgram()!;
    gl.attachShader(this.shaderProgram, vertexShader);
    gl.attachShader(this.shaderProgram, fragmentShader);
    gl.linkProgram(this.shaderProgram);
    
    if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
      throw new Error('Unified4D: Shader program linking failed: ' + gl.getProgramInfoLog(this.shaderProgram));
    }
    
    // Get uniform locations
    this.getUniformLocations();
    
    // Clean up
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const shader = gl.createShader(type)!;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error('Unified4D: Shader compilation failed: ' + error);
    }
    
    return shader;
  }

  private getUniformLocations(): void {
    const gl = this.gl;
    if (!this.shaderProgram) return;
    
    const uniforms = [
      'u_resolution', 'u_time', 'u_mouse', 'u_dimension', 'u_morphFactor',
      'u_rotationSpeed', 'u_gridDensity', 'u_lineThickness', 'u_audioBass',
      'u_audioMid', 'u_audioHigh', 'u_primaryColor', 'u_secondaryColor',
      'u_backgroundColor'
    ];
    
    uniforms.forEach(name => {
      const location = gl.getUniformLocation(this.shaderProgram!, name);
      if (location) {
        this.uniformLocations.set(name, location);
      }
    });
  }

  private setupInteractionHandlers(): void {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      
      this.config.parameters.mouse = [x, 1.0 - y]; // Flip Y coordinate
      this.updateInteractionIntensity('mouse', x, y);
    });
    
    // Mouse click
    this.canvas.addEventListener('click', () => {
      this.updateInteractionIntensity('click');
    });
    
    // Scroll handling
    this.canvas.addEventListener('wheel', (event) => {
      event.preventDefault();
      const velocity = Math.abs(event.deltaY) / 100;
      this.updateInteractionIntensity('scroll', velocity);
    });
  }

  private updateInteractionIntensity(type: string, ...args: number[]): void {
    const now = performance.now();
    
    switch (type) {
      case 'scroll':
        const velocity = args[0] || 0;
        this.interactionState.scroll.velocity = velocity;
        this.interactionState.scroll.intensity = Math.min(1.0, velocity / this.config.interactions.scrollSensitivity);
        this.config.parameters.audioBass = this.interactionState.scroll.intensity;
        break;
        
      case 'click':
        this.interactionState.click.intensity = 1.0;
        this.config.parameters.audioMid = this.interactionState.click.intensity;
        break;
        
      case 'mouse':
        const x = args[0] || 0;
        const y = args[1] || 0;
        const mouseVel = Math.sqrt(x * x + y * y);
        this.interactionState.mouse.velocity = mouseVel;
        this.interactionState.mouse.intensity = Math.min(1.0, mouseVel / this.config.interactions.mouseSensitivity);
        this.config.parameters.audioHigh = this.interactionState.mouse.intensity;
        break;
    }
    
    // Reset idle state
    this.interactionState.idle.duration = 0;
    this.interactionState.idle.isIdle = false;
  }

  private updateInteractionDecay(deltaTime: number): void {
    const decayFactor = Math.max(0.0, 1.0 - (deltaTime / this.config.interactions.decayTime));
    
    // Apply decay to interaction intensities
    this.interactionState.scroll.intensity *= decayFactor;
    this.interactionState.click.intensity *= decayFactor;
    this.interactionState.mouse.intensity *= decayFactor;
    
    // Update audio parameters
    this.config.parameters.audioBass = this.interactionState.scroll.intensity;
    this.config.parameters.audioMid = this.interactionState.click.intensity;
    this.config.parameters.audioHigh = this.interactionState.mouse.intensity;
    
    // Update idle state
    this.interactionState.idle.duration += deltaTime;
    this.interactionState.idle.isIdle = this.interactionState.idle.duration > this.config.interactions.idleThreshold;
  }

  private setUniforms(): void {
    const gl = this.gl;
    if (!this.shaderProgram) return;
    
    gl.useProgram(this.shaderProgram);
    
    // Set uniform values
    const setUniform = (name: string, setValue: () => void) => {
      const location = this.uniformLocations.get(name);
      if (location) setValue();
    };
    
    setUniform('u_resolution', () => 
      gl.uniform2f(this.uniformLocations.get('u_resolution')!, this.config.parameters.resolution[0], this.config.parameters.resolution[1]));
    
    setUniform('u_time', () => 
      gl.uniform1f(this.uniformLocations.get('u_time')!, this.config.parameters.time));
    
    setUniform('u_mouse', () => 
      gl.uniform2f(this.uniformLocations.get('u_mouse')!, this.config.parameters.mouse[0], this.config.parameters.mouse[1]));
    
    setUniform('u_dimension', () => 
      gl.uniform1f(this.uniformLocations.get('u_dimension')!, this.config.parameters.dimension));
    
    setUniform('u_morphFactor', () => 
      gl.uniform1f(this.uniformLocations.get('u_morphFactor')!, this.config.parameters.morphFactor));
    
    setUniform('u_rotationSpeed', () => 
      gl.uniform1f(this.uniformLocations.get('u_rotationSpeed')!, this.config.parameters.rotationSpeed));
    
    setUniform('u_gridDensity', () => 
      gl.uniform1f(this.uniformLocations.get('u_gridDensity')!, this.config.parameters.gridDensity));
    
    setUniform('u_lineThickness', () => 
      gl.uniform1f(this.uniformLocations.get('u_lineThickness')!, this.config.parameters.lineThickness));
    
    setUniform('u_audioBass', () => 
      gl.uniform1f(this.uniformLocations.get('u_audioBass')!, this.config.parameters.audioBass));
    
    setUniform('u_audioMid', () => 
      gl.uniform1f(this.uniformLocations.get('u_audioMid')!, this.config.parameters.audioMid));
    
    setUniform('u_audioHigh', () => 
      gl.uniform1f(this.uniformLocations.get('u_audioHigh')!, this.config.parameters.audioHigh));
    
    setUniform('u_primaryColor', () => 
      gl.uniform3f(this.uniformLocations.get('u_primaryColor')!, ...this.config.theming.primary));
    
    setUniform('u_secondaryColor', () => 
      gl.uniform3f(this.uniformLocations.get('u_secondaryColor')!, ...this.config.theming.secondary));
    
    setUniform('u_backgroundColor', () => 
      gl.uniform3f(this.uniformLocations.get('u_backgroundColor')!, ...this.config.theming.background));
  }

  private render(timestamp: number): void {
    if (!this.isRendering) return;
    
    // Calculate time delta
    if (!this.startTime) this.startTime = timestamp;
    const currentTime = (timestamp - this.startTime) * 0.001;
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.config.parameters.time = currentTime;
    
    // Update interaction decay
    this.updateInteractionDecay(deltaTime * 1000);
    
    // Check for canvas resize
    this.checkResize();
    
    // Set uniforms
    this.setUniforms();
    
    // Clear and draw
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if (this.vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      
      const positionAttribute = gl.getAttribLocation(this.shaderProgram!, 'a_position');
      gl.enableVertexAttribArray(positionAttribute);
      gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    
    // Continue animation loop
    this.animationFrameId = requestAnimationFrame((ts) => this.render(ts));
  }

  private checkResize(): void {
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
      this.gl.viewport(0, 0, displayWidth, displayHeight);
      this.config.parameters.resolution = [displayWidth, displayHeight];
    }
  }

  // Public API methods
  public start(): void {
    if (this.isRendering) return;
    
    console.log('Unified4D: Starting render loop');
    this.isRendering = true;
    this.startTime = 0;
    this.lastTime = 0;
    this.animationFrameId = requestAnimationFrame((ts) => this.render(ts));
  }

  public stop(): void {
    if (!this.isRendering) return;
    
    console.log('Unified4D: Stopping render loop');
    this.isRendering = false;
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public updateParameters(params: Partial<ShaderParameters>): void {
    Object.assign(this.config.parameters, params);
  }

  public updateConfig(config: Partial<Unified4DConfig>): void {
    // Deep merge config
    if (config.parameters) {
      Object.assign(this.config.parameters, config.parameters);
    }
    if (config.interactions) {
      Object.assign(this.config.interactions, config.interactions);
    }
    if (config.performance) {
      Object.assign(this.config.performance, config.performance);
    }
    if (config.theming) {
      Object.assign(this.config.theming, config.theming);
    }
    if (config.geometry) {
      this.config.geometry = config.geometry;
      // Note: Geometry switching would require shader recompilation
    }
  }

  public getConfig(): Required<Unified4DConfig> {
    return { ...this.config };
  }

  public dispose(): void {
    console.log('Unified4D: Disposing engine');
    this.stop();
    
    const gl = this.gl;
    if (gl && !gl.isContextLost()) {
      if (this.vertexBuffer) {
        gl.deleteBuffer(this.vertexBuffer);
      }
      if (this.shaderProgram) {
        gl.deleteProgram(this.shaderProgram);
      }
    }
    
    // Clear references
    this.vertexBuffer = null;
    this.shaderProgram = null;
    this.uniformLocations.clear();
  }
}