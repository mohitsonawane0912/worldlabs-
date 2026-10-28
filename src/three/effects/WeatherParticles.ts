import * as THREE from 'three';
import { DisasterEvents, AtmospherePhysics } from '../../types/simulation';

export class WeatherParticles {
  public group: THREE.Group;

  // Rain system
  private rainMesh: THREE.Points | null = null;
  private rainCount = 2800;
  private rainPositions: Float32Array;
  private rainVelocities: Float32Array;

  // Splash rings
  private splashMesh: THREE.Points | null = null;
  private splashCount = 400;
  private splashPositions: Float32Array;
  private splashLifetimes: Float32Array;

  // Snow & blizzard
  private snowMesh: THREE.Points | null = null;
  private snowCount = 1800;
  private snowPositions: Float32Array;

  // Sand / dust storm
  private dustMesh: THREE.Points | null = null;
  private dustCount = 2000;
  private dustPositions: Float32Array;

  // Meteors
  private meteorGroup: THREE.Group;
  private meteors: { mesh: THREE.Line; velocity: THREE.Vector3; life: number }[] = [];

  // Lightning system
  private lightningLight: THREE.DirectionalLight;
  private lightningFlashTimer = 0;
  private nextLightningTime = 3.0;

  constructor() {
    this.group = new THREE.Group();
    this.meteorGroup = new THREE.Group();
    this.group.add(this.meteorGroup);

    // 1. Rain Particles
    this.rainPositions = new Float32Array(this.rainCount * 3);
    this.rainVelocities = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.rainPositions[i * 3 + 1] = Math.random() * 50;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      this.rainVelocities[i * 3] = -4 + Math.random() * 2; // Wind drift
      this.rainVelocities[i * 3 + 1] = -38 - Math.random() * 15; // Fast terminal fall
      this.rainVelocities[i * 3 + 2] = -2 + Math.random() * 1;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.35,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.rainMesh = new THREE.Points(rainGeo, rainMat);
    this.rainMesh.visible = false;
    this.group.add(this.rainMesh);

    // 2. Splash Particles on Ground
    this.splashPositions = new Float32Array(this.splashCount * 3);
    this.splashLifetimes = new Float32Array(this.splashCount);
    for (let i = 0; i < this.splashCount; i++) {
      this.splashPositions[i * 3] = (Math.random() - 0.5) * 70;
      this.splashPositions[i * 3 + 1] = 0.05;
      this.splashPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
      this.splashLifetimes[i] = Math.random();
    }
    const splashGeo = new THREE.BufferGeometry();
    splashGeo.setAttribute('position', new THREE.BufferAttribute(this.splashPositions, 3));
    const splashMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.5,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.splashMesh = new THREE.Points(splashGeo, splashMat);
    this.splashMesh.visible = false;
    this.group.add(this.splashMesh);

    // 3. Snow & Blizzard Particles
    this.snowPositions = new Float32Array(this.snowCount * 3);
    for (let i = 0; i < this.snowCount; i++) {
      this.snowPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.snowPositions[i * 3 + 1] = Math.random() * 45;
      this.snowPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const snowGeo = new THREE.BufferGeometry();
    snowGeo.setAttribute('position', new THREE.BufferAttribute(this.snowPositions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.45,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.snowMesh = new THREE.Points(snowGeo, snowMat);
    this.snowMesh.visible = false;
    this.group.add(this.snowMesh);

    // 4. Dust Storm Particles
    this.dustPositions = new Float32Array(this.dustCount * 3);
    for (let i = 0; i < this.dustCount; i++) {
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 80;
      this.dustPositions[i * 3 + 1] = Math.random() * 30;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd97706,
      size: 0.55,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    this.dustMesh = new THREE.Points(dustGeo, dustMat);
    this.dustMesh.visible = false;
    this.group.add(this.dustMesh);

    // 5. Lightning Light
    this.lightningLight = new THREE.DirectionalLight(0xe0f2fe, 0);
    this.lightningLight.position.set(10, 40, 10);
    this.group.add(this.lightningLight);
  }

  public update(
    dt: number,
    rainfall: number,
    temperature: number,
    events: DisasterEvents,
    physics: AtmospherePhysics,
    isMars: boolean,
    isForest: boolean,
    rotSpeed: number = 1.0,
    densityFactor: number = 1.0
  ) {
    const isFreezing = temperature < 0 && !isMars;
    const isRaining = (rainfall > 35 || events.heavyRain) && !isFreezing && !isMars;
    const isSnowing = isFreezing && (rainfall > 20 || events.heavyRain);

    // 1. Rain & Splash update
    if (this.rainMesh && this.splashMesh) {
      this.rainMesh.visible = isRaining;
      this.splashMesh.visible = isRaining;

      if (isRaining) {
        const speedMult = (events.heavyRain ? 1.6 : 1.0) * rotSpeed;
        const positions = this.rainMesh.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3] += this.rainVelocities[i * 3] * dt * speedMult;
          positions[i * 3 + 1] += this.rainVelocities[i * 3 + 1] * dt * speedMult;
          positions[i * 3 + 2] += this.rainVelocities[i * 3 + 2] * dt * speedMult;

          if (positions[i * 3 + 1] < 0) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = 45 + Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
          }
        }
        this.rainMesh.geometry.attributes.position.needsUpdate = true;

        // Splashes
        const splashPos = this.splashMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.splashCount; i++) {
          this.splashLifetimes[i] += dt * 3.5;
          if (this.splashLifetimes[i] > 1.0) {
            this.splashLifetimes[i] = 0;
            splashPos[i * 3] = (Math.random() - 0.5) * 70;
            splashPos[i * 3 + 2] = (Math.random() - 0.5) * 70;
          }
        }
        this.splashMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 2. Snow / Blizzard update
    if (this.snowMesh) {
      this.snowMesh.visible = isSnowing;
      if (isSnowing) {
        const positions = this.snowMesh.geometry.attributes.position.array as Float32Array;
        const windX = Math.sin(Date.now() * 0.001) * 6 * rotSpeed;
        for (let i = 0; i < this.snowCount; i++) {
          positions[i * 3] += windX * dt;
          positions[i * 3 + 1] -= (6 + Math.sin(i)) * dt * rotSpeed;
          positions[i * 3 + 2] += Math.cos(i) * 2 * dt;

          if (positions[i * 3 + 1] < 0) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = 42 + Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
          }
        }
        this.snowMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 3. Dust / Sand Storm update
    const shouldDust = isMars || (events.drought && rainfall < 25);
    if (this.dustMesh) {
      this.dustMesh.visible = shouldDust;
      if (shouldDust) {
        const swirlSpeed = (isMars ? 32 : 18) * dt * rotSpeed;
        (this.dustMesh.material as THREE.PointsMaterial).opacity = Math.min(
          0.85,
          Math.max(0.2, 0.5 * densityFactor)
        );
        const positions = this.dustMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.dustCount; i++) {
          positions[i * 3] += Math.sin(positions[i * 3 + 2] * 0.04) * swirlSpeed;
          positions[i * 3 + 2] += swirlSpeed;
          if (positions[i * 3 + 2] > 40) {
            positions[i * 3 + 2] = -40;
          }
        }
        this.dustMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 4. Realistic Lightning & Thunder
    if (physics.lightningActive && !isMars) {
      this.lightningFlashTimer += dt;
      if (this.lightningFlashTimer >= this.nextLightningTime) {
        // Flash trigger!
        this.lightningLight.intensity = 4.5 + Math.random() * 3.5;
        this.lightningFlashTimer = 0;
        this.nextLightningTime = 2.5 + Math.random() * 5.0; // Random intervals
      } else if (this.lightningLight.intensity > 0) {
        // Rapid exponential decay for natural lightning strobe
        this.lightningLight.intensity *= 0.65;
        if (this.lightningLight.intensity < 0.05) {
          this.lightningLight.intensity = 0;
        }
      }
    } else {
      this.lightningLight.intensity = 0;
    }

    // 5. Meteors
    if (events.meteorShower) {
      if (Math.random() < 0.2 && this.meteors.length < 10) {
        this.spawnMeteor();
      }
    }
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.mesh.position.addScaledVector(m.velocity, dt * rotSpeed);
      m.life -= dt;
      if (m.life <= 0) {
        this.meteorGroup.remove(m.mesh);
        m.mesh.geometry.dispose();
        (m.mesh.material as THREE.Material).dispose();
        this.meteors.splice(i, 1);
      }
    }
  }

  private spawnMeteor() {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-6, -8, -6),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
    });
    const line = new THREE.Line(geo, mat);
    line.position.set(
      (Math.random() - 0.5) * 70,
      35 + Math.random() * 20,
      (Math.random() - 0.5) * 70
    );
    const velocity = new THREE.Vector3(-24 - Math.random() * 12, -32 - Math.random() * 10, -24);
    this.meteors.push({ mesh: line, velocity, life: 0.75 });
    this.meteorGroup.add(line);
  }

  public dispose() {
    if (this.rainMesh) {
      this.rainMesh.geometry.dispose();
      (this.rainMesh.material as THREE.Material).dispose();
    }
    if (this.splashMesh) {
      this.splashMesh.geometry.dispose();
      (this.splashMesh.material as THREE.Material).dispose();
    }
    if (this.snowMesh) {
      this.snowMesh.geometry.dispose();
      (this.snowMesh.material as THREE.Material).dispose();
    }
    if (this.dustMesh) {
      this.dustMesh.geometry.dispose();
      (this.dustMesh.material as THREE.Material).dispose();
    }
    this.meteors.forEach((m) => {
      m.mesh.geometry.dispose();
      (m.mesh.material as THREE.Material).dispose();
    });
  }
}
