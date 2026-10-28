import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  WorldSceneId,
  SimulationParameters,
  DisasterEvents,
  ConditionScores,
} from '../types/simulation';
import { IWorldScene } from './scenes/BaseScene';
import { MiniEarthScene } from './scenes/MiniEarthScene';
import { ForestValleyScene } from './scenes/ForestValleyScene';
import { FutureCityScene } from './scenes/FutureCityScene';
import { OceanWorldScene } from './scenes/OceanWorldScene';
import { MarsColonyScene } from './scenes/MarsColonyScene';
import { WeatherParticles } from './effects/WeatherParticles';
import { CrowdManager } from './people/CrowdManager';

export class SceneManager {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private activeWorldScene: IWorldScene | null = null;
  private currentSceneId: WorldSceneId = 'mini-earth';
  private weatherParticles!: WeatherParticles;
  private crowdManager!: CrowdManager;

  private keyLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;

  private isSoftwareGl = false;
  private frameId: number = 0;
  private lastTime: number = 0;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init() {
    // 1. Detect software WebGL guard
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Initialize Three.js WebGLRenderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene and RoomEnvironment (Zero-404 procedural studio environment)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060d1a);
    this.scene.fog = new THREE.FogExp2(0x060d1a, 0.015);

    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // Fallback
    }

    // 4. Perspective Camera
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 500);
    this.camera.position.set(0, 10, 22);

    // 5. OrbitControls with smooth damping
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 140;
    this.controls.minDistance = 8;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.05;

    // 6. Lighting Rig (Warm Key Light + Cool Hemisphere Fill)
    this.hemiLight = new THREE.HemisphereLight(0xbfdbfe, 0x1e293b, 1.2);
    this.scene.add(this.hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    this.keyLight.position.set(25, 35, 25);
    this.scene.add(this.keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-20, 15, -20);
    this.scene.add(rimLight);

    // 7. Weather and Disaster Particles
    this.weatherParticles = new WeatherParticles();
    this.scene.add(this.weatherParticles.group);

    // 8. Human Demographics and Visible Citizens
    this.crowdManager = new CrowdManager();
    this.scene.add(this.crowdManager.group);

    // 9. Event listeners
    window.addEventListener('resize', this.onResize);

    // 10. Load initial scene
    this.loadScene('mini-earth');

    // 11. Start Animation Loop
    this.lastTime = performance.now();
    this.tick();
  }

  public loadScene(sceneId: WorldSceneId) {
    if (this.activeWorldScene) {
      this.scene.remove(this.activeWorldScene.group);
      this.activeWorldScene.dispose();
      this.activeWorldScene = null;
    }

    this.currentSceneId = sceneId;

    switch (sceneId) {
      case 'mini-earth':
        this.activeWorldScene = new MiniEarthScene();
        this.scene.background = new THREE.Color(0x030712); // Deep cosmic void
        this.scene.fog = new THREE.FogExp2(0x030712, 0.008);
        this.camera.position.set(0, 5, 20);
        this.controls.target.set(0, 0, 0);
        break;

      case 'forest-valley':
        this.activeWorldScene = new ForestValleyScene();
        this.scene.background = new THREE.Color(0x0c1b2a);
        this.scene.fog = new THREE.FogExp2(0x0c1b2a, 0.018);
        this.camera.position.set(0, 12, 28);
        this.controls.target.set(0, 2, 0);
        break;

      case 'future-city':
        this.activeWorldScene = new FutureCityScene();
        this.scene.background = new THREE.Color(0x0c1628);
        this.scene.fog = new THREE.FogExp2(0x0c1628, 0.005);
        this.camera.position.set(0, 50, 70);
        this.controls.target.set(0, 10, 0);
        break;

      case 'ocean-world':
        this.activeWorldScene = new OceanWorldScene();
        this.scene.background = new THREE.Color(0x031d38);
        this.scene.fog = new THREE.FogExp2(0x031d38, 0.022);
        this.camera.position.set(0, 10, 24);
        this.controls.target.set(0, -1, 0);
        break;

      case 'mars-colony':
        this.activeWorldScene = new MarsColonyScene();
        this.scene.background = new THREE.Color(0x2d0e07); // Martian amber-ochre haze
        this.scene.fog = new THREE.FogExp2(0x2d0e07, 0.025);
        this.camera.position.set(0, 12, 26);
        this.controls.target.set(0, 1, 0);
        break;
    }

    if (this.activeWorldScene) {
      this.activeWorldScene.init(this.scene);
    }
    this.crowdManager.configureForScene(sceneId);
    this.controls.update();
  }

  public updateSimulationState(
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const densityFactor = Math.max(0.2, (params.atmosphereDensity ?? 100) / 100);

    // Environmental visual adaptation for background & fog
    if (this.currentSceneId === 'mars-colony') {
      // Mars terraforming shifts sky from red toward pale sky
      const skyFactor = Math.min(1, Math.max(0, (params.oxygen / 21) * 0.8));
      const redSky = new THREE.Color(0x2d0e07);
      const terraSky = new THREE.Color(0x0c2738);
      this.scene.background = redSky.clone().lerp(terraSky, skyFactor);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.copy(this.scene.background);
        this.scene.fog.density = 0.025 * densityFactor;
      }
    } else if (this.currentSceneId !== 'mini-earth') {
      // Pollution, heat wave, and atmosphereDensity effects on atmospheric sky fog
      if (params.airPollution > 50) {
        this.scene.background = new THREE.Color(0x241d18); // Particulate smog
      } else if (events.heatWave) {
        this.scene.background = new THREE.Color(0x271e16);
      } else {
        const baseColor = this.currentSceneId === 'ocean-world' ? 0x031d38 : this.currentSceneId === 'future-city' ? 0x0c1628 : 0x081326;
        this.scene.background = new THREE.Color(baseColor);
      }
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.copy(this.scene.background);
        const baseDensity = this.currentSceneId === 'forest-valley' ? 0.018 : this.currentSceneId === 'future-city' ? 0.006 : 0.022;
        this.scene.fog.density = baseDensity * densityFactor;
      }
    } else {
      // Mini Earth fog density modulation
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.density = 0.008 * densityFactor;
      }
    }
  }

  private onResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private tick = () => {
    if (this.isDisposed) return;

    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.controls.update();

    if (this.activeWorldScene) {
      // Called with current parameters provided by component bridge
      (this.activeWorldScene as any).tickCurrent?.(dt);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  public stepScene(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    if (this.activeWorldScene) {
      this.activeWorldScene.update(dt, params, events, conditions);
    }
    const isMars = this.currentSceneId === 'mars-colony';
    const isForest = this.currentSceneId === 'forest-valley';
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 100) / 100;
    this.weatherParticles.update(
      dt,
      params.rainfall,
      params.temperature,
      events,
      conditions.physics,
      isMars,
      isForest,
      rotSpeed,
      densityFactor
    );
    this.crowdManager.update(dt, params, events, conditions, this.currentSceneId);
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || !gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.isDisposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.onResize);
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    if (this.activeWorldScene) {
      this.activeWorldScene.dispose();
      this.activeWorldScene = null;
    }
    this.crowdManager.dispose();
    this.weatherParticles.dispose();
    this.controls.dispose();
    this.renderer.dispose();
  }
}
