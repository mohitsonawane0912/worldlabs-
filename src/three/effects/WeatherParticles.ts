import * as THREE from 'three';
import { DisasterEvents } from '../../types/simulation';

export class WeatherParticles {
  public group: THREE.Group;
  private rainMesh: THREE.Points | null = null;
  private rainCount = 1200;
  private rainPositions: Float32Array;

  private meteorGroup: THREE.Group;
  private meteors: { mesh: THREE.Line; velocity: THREE.Vector3; life: number }[] = [];

  private dustMesh: THREE.Points | null = null;
  private dustCount = 800;
  private dustPositions: Float32Array;

  private fireflyMesh: THREE.Points | null = null;
  private fireflyCount = 60;
  private fireflyPositions: Float32Array;

  constructor() {
    this.group = new THREE.Group();
    this.meteorGroup = new THREE.Group();
    this.group.add(this.meteorGroup);

    // 1. Rain setup
    this.rainPositions = new Float32Array(this.rainCount * 3);
    for (let i = 0; i < this.rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 60;
      this.rainPositions[i * 3 + 1] = Math.random() * 40;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    this.rainMesh = new THREE.Points(rainGeo, rainMat);
    this.rainMesh.visible = false;
    this.group.add(this.rainMesh);

    // 2. Dust storm setup
    this.dustPositions = new Float32Array(this.dustCount * 3);
    for (let i = 0; i < this.dustCount; i++) {
      this.dustPositions[i * 3] = (Math.random() - 0.5) * 70;
      this.dustPositions[i * 3 + 1] = Math.random() * 25;
      this.dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xd97706,
      size: 0.45,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.dustMesh = new THREE.Points(dustGeo, dustMat);
    this.dustMesh.visible = false;
    this.group.add(this.dustMesh);

    // 3. Fireflies / Wildlife setup
    this.fireflyPositions = new Float32Array(this.fireflyCount * 3);
    for (let i = 0; i < this.fireflyCount; i++) {
      this.fireflyPositions[i * 3] = (Math.random() - 0.5) * 35;
      this.fireflyPositions[i * 3 + 1] = 1 + Math.random() * 6;
      this.fireflyPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;
    }
    const flyGeo = new THREE.BufferGeometry();
    flyGeo.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));
    const flyMat = new THREE.PointsMaterial({
      color: 0xa3e635,
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.fireflyMesh = new THREE.Points(flyGeo, flyMat);
    this.fireflyMesh.visible = false;
    this.group.add(this.fireflyMesh);
  }

  public update(
    dt: number,
    rainfall: number,
    events: DisasterEvents,
    isMars: boolean,
    isForest: boolean,
    rotSpeed: number = 1.0,
    densityFactor: number = 1.0
  ) {
    // 1. Rain update bound to rotationSpeed and density
    const shouldRain = rainfall > 40 || events.heavyRain;
    if (this.rainMesh) {
      this.rainMesh.visible = shouldRain && !isMars;
      if (this.rainMesh.visible) {
        const fallSpeed = (events.heavyRain ? 35 : 18) * dt * rotSpeed;
        const positions = this.rainMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3 + 1] -= fallSpeed;
          if (positions[i * 3 + 1] < 0) {
            positions[i * 3 + 1] = 35 + Math.random() * 5;
          }
        }
        this.rainMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 2. Dust Storm update bound to rotationSpeed and atmosphereDensity
    const shouldDust = isMars || (events.drought && rainfall < 20);
    if (this.dustMesh) {
      this.dustMesh.visible = shouldDust;
      if (this.dustMesh.visible) {
        const swirlSpeed = 22 * dt * rotSpeed;
        (this.dustMesh.material as THREE.PointsMaterial).opacity = Math.min(0.85, Math.max(0.15, 0.45 * densityFactor));
        const positions = this.dustMesh.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < this.dustCount; i++) {
          positions[i * 3] += Math.sin(positions[i * 3 + 2] * 0.05) * swirlSpeed;
          positions[i * 3 + 2] += swirlSpeed;
          if (positions[i * 3 + 2] > 35) {
            positions[i * 3 + 2] = -35;
          }
        }
        this.dustMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 3. Wildlife / Fireflies update (Forest Valley)
    if (this.fireflyMesh) {
      this.fireflyMesh.visible = isForest && !events.drought && !events.heatWave;
      if (this.fireflyMesh.visible) {
        const positions = this.fireflyMesh.geometry.attributes.position.array as Float32Array;
        const time = Date.now() * 0.002;
        for (let i = 0; i < this.fireflyCount; i++) {
          positions[i * 3] += Math.sin(time + i) * 0.03;
          positions[i * 3 + 1] += Math.cos(time + i * 2) * 0.02;
          positions[i * 3 + 2] += Math.sin(time + i * 3) * 0.03;
        }
        this.fireflyMesh.geometry.attributes.position.needsUpdate = true;
      }
    }

    // 4. Meteor Shower update
    if (events.meteorShower) {
      if (Math.random() < 0.15 && this.meteors.length < 8) {
        this.spawnMeteor();
      }
    }
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.mesh.position.addScaledVector(m.velocity, dt);
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
      new THREE.Vector3(-4, -5, -4),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geo, mat);
    line.position.set(
      (Math.random() - 0.5) * 60,
      25 + Math.random() * 15,
      (Math.random() - 0.5) * 60
    );
    const velocity = new THREE.Vector3(-18 - Math.random() * 10, -22 - Math.random() * 8, -18);
    this.meteors.push({ mesh: line, velocity, life: 0.8 });
    this.meteorGroup.add(line);
  }

  public dispose() {
    if (this.rainMesh) {
      this.rainMesh.geometry.dispose();
      (this.rainMesh.material as THREE.Material).dispose();
    }
    if (this.dustMesh) {
      this.dustMesh.geometry.dispose();
      (this.dustMesh.material as THREE.Material).dispose();
    }
    if (this.fireflyMesh) {
      this.fireflyMesh.geometry.dispose();
      (this.fireflyMesh.material as THREE.Material).dispose();
    }
    this.meteors.forEach((m) => {
      m.mesh.geometry.dispose();
      (m.mesh.material as THREE.Material).dispose();
    });
  }
}
