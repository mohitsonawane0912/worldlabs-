import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';

export class OceanWorldScene implements IWorldScene {
  public group = new THREE.Group();

  private oceanWaterMesh!: THREE.Mesh;
  private seabedMesh!: THREE.Mesh;
  private iceCapMesh!: THREE.Mesh;
  private oceanWaterMat!: THREE.MeshStandardMaterial;
  private iceMat!: THREE.MeshStandardMaterial;
  private coralGroup = new THREE.Group();
  private coralMaterials: THREE.MeshStandardMaterial[] = [];
  private researchPlatform = new THREE.Group();

  private fishMesh!: THREE.InstancedMesh;
  private fishCount = 35;
  private fishData: { angle: number; radius: number; speed: number; y: number }[] = [];

  private waveTimer = 0;

  public init(parentScene: THREE.Scene) {
    // 1. Underwater Seabed with depth contours
    const seabedGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const pos = seabedGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, -6 + Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.8);
    }
    seabedGeo.computeVertexNormals();
    const seabedMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.9,
      metalness: 0.1,
    });
    this.seabedMesh = new THREE.Mesh(seabedGeo, seabedMat);
    this.seabedMesh.rotation.x = -Math.PI / 2;
    this.group.add(this.seabedMesh);

    // 2. Translucent Ocean Water Surface
    const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    this.oceanWaterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.75,
    });
    this.oceanWaterMesh = new THREE.Mesh(waterGeo, this.oceanWaterMat);
    this.oceanWaterMesh.rotation.x = -Math.PI / 2;
    this.oceanWaterMesh.position.y = 0;
    this.group.add(this.oceanWaterMesh);

    // 3. Polar Ice Shelf / Icebergs (responsive to temperature)
    const iceGeo = new THREE.CylinderGeometry(8, 10, 3.5, 12);
    this.iceMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });
    this.iceCapMesh = new THREE.Mesh(iceGeo, this.iceMat);
    this.iceCapMesh.position.set(16, 1.2, -14);
    this.group.add(this.iceCapMesh);

    // 4. Underwater Glowing Coral Reef
    this.buildCoralReef();
    this.group.add(this.coralGroup);

    // 5. Schooling Fish (InstancedMesh)
    this.buildFish();

    // 6. Marine Research Platform (Floating station)
    this.buildResearchPlatform();
    this.group.add(this.researchPlatform);

    parentScene.add(this.group);
  }

  private buildCoralReef() {
    const coralCoords = [
      [-10, -5], [-8, 2], [-14, 8], [-4, -8], [-12, -12],
      [2, -14], [6, -8], [-2, 10], [-6, 14],
    ];

    coralCoords.forEach(([cx, cz]) => {
      const coral = new THREE.Group();

      const coralMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: new THREE.Color(0xe11d48),
        emissiveIntensity: 0.4,
        roughness: 0.6,
      });
      this.coralMaterials.push(coralMat);

      // Branch 1
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.35, 2.2, 6), coralMat);
      b1.position.y = 1.1;
      b1.rotation.z = 0.2;
      coral.add(b1);

      // Branch 2
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.25, 1.8, 6), coralMat);
      b2.position.set(0.4, 0.9, 0.2);
      b2.rotation.z = -0.35;
      coral.add(b2);

      // Branch 3
      const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 1.4, 6), coralMat);
      b3.position.set(-0.3, 0.7, -0.3);
      b3.rotation.x = 0.3;
      coral.add(b3);

      coral.position.set(cx, -5.5, cz);
      this.coralGroup.add(coral);
    });
  }

  private buildFish() {
    const fishGeo = new THREE.ConeGeometry(0.15, 0.6, 5);
    const fishMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    this.fishMesh = new THREE.InstancedMesh(fishGeo, fishMat, this.fishCount);

    const dummy = new THREE.Matrix4();
    for (let i = 0; i < this.fishCount; i++) {
      const angle = (i / this.fishCount) * Math.PI * 2;
      const radius = 6 + Math.random() * 8;
      const speed = 0.8 + Math.random() * 0.6;
      const y = -4 + Math.random() * 2.5;
      this.fishData.push({ angle, radius, speed, y });

      dummy.setPosition(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      this.fishMesh.setMatrixAt(i, dummy);
    }
    this.fishMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.fishMesh);
  }

  private buildResearchPlatform() {
    const matMetal = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const matYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });

    // Floats
    const pontoon = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.8, 16), matYellow);
    pontoon.position.y = 0.2;
    this.researchPlatform.add(pontoon);

    // Deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.15, 2.4), matMetal);
    deck.position.y = 0.7;
    this.researchPlatform.add(deck);

    // Weather mast
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8), matMetal);
    mast.position.y = 2;
    this.researchPlatform.add(mast);

    // Flashing green beacon
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    beacon.position.y = 3.3;
    this.researchPlatform.add(beacon);

    this.researchPlatform.position.set(-6, 0, -8);
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 100) / 100;

    // 1. Wave oscillation and platform buoyancy bound to rotationSpeed
    this.waveTimer += dt * 1.5 * rotSpeed;

    // Ocean surface reacts to seaLevel and atmosphereDensity
    this.oceanWaterMesh.position.y = (params.seaLevel / 50) * 1.5;
    this.oceanWaterMat.opacity = Math.min(0.92, Math.max(0.4, 0.7 * densityFactor));
    this.researchPlatform.position.y = this.oceanWaterMesh.position.y + Math.sin(this.waveTimer) * 0.08;

    // 2. Iceberg reaction to Temperature:
    // If temp > 15°C, ice caps shrink and melt dynamically; freezing temps expand massive ice shelves
    let iceScale = 1.0;
    if (params.temperature > 15) {
      iceScale = Math.max(0.05, 1 - ((params.temperature - 15) / 45) * 0.95);
    } else if (params.temperature < 0) {
      iceScale = Math.min(2.1, 1 + Math.abs(params.temperature) / 20);
    }
    this.iceCapMesh.scale.set(iceScale, iceScale, iceScale);

    // Dynamic water color from temperature (deep icy cyan-blue to warmer tropical teal)
    if (params.temperature > 28) {
      this.oceanWaterMat.color.setHex(0x0e7490); // Tropical turquoise
    } else if (params.temperature < 0) {
      this.oceanWaterMat.color.setHex(0x0c4a6e); // Arctic deep blue
    } else {
      this.oceanWaterMat.color.setHex(0x0284c7);
    }

    // 3. Coral bleaching reaction to heat wave, high temp, or pollution
    const isBleached = events.heatWave || params.temperature > 30 || params.airPollution > 55;
    this.coralMaterials.forEach((m) => {
      if (isBleached) {
        m.color.setHex(0xe2e8f0); // Bleached chalky white
        m.emissive.setHex(0x94a3b8);
        m.emissiveIntensity = 0.1;
      } else {
        m.color.setHex(0xf43f5e); // Radiant pink coral
        m.emissive.setHex(0xe11d48);
        m.emissiveIntensity = 0.5;
      }
    });

    // 4. Schooling fish animation bound to rotationSpeed
    const dummy = new THREE.Matrix4();
    const fishActive = Math.max(8, Math.round((conditions.ecosystemHealth / 100) * this.fishCount));

    for (let i = 0; i < this.fishCount; i++) {
      if (i < fishActive) {
        const f = this.fishData[i];
        f.angle += f.speed * dt * rotSpeed;
        const x = Math.cos(f.angle) * f.radius;
        const z = Math.sin(f.angle) * f.radius;
        dummy.setPosition(x, f.y + Math.sin(this.waveTimer + i) * 0.2, z);
        this.fishMesh.setMatrixAt(i, dummy);
      } else {
        dummy.setPosition(0, -100, 0);
        this.fishMesh.setMatrixAt(i, dummy);
      }
    }
    this.fishMesh.instanceMatrix.needsUpdate = true;
  }

  public dispose() {
    this.oceanWaterMesh.geometry.dispose();
    this.oceanWaterMat.dispose();

    this.seabedMesh.geometry.dispose();
    (this.seabedMesh.material as THREE.Material).dispose();

    this.iceCapMesh.geometry.dispose();
    this.iceMat.dispose();

    this.coralMaterials.forEach((m) => m.dispose());
    this.coralGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) child.geometry.dispose();
    });

    this.fishMesh.geometry.dispose();
    (this.fishMesh.material as THREE.Material).dispose();

    this.researchPlatform.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}
