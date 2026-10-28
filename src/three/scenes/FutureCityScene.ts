import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';
import { createBuildingFacadeTexture } from '../utils/textureGen';

export class FutureCityScene implements IWorldScene {
  public group = new THREE.Group();

  private cityGround!: THREE.Mesh;
  private buildingGroup = new THREE.Group();
  private turbineBlades: THREE.Mesh[] = [];
  private trafficMesh!: THREE.InstancedMesh;
  private trafficCount = 45;
  private trafficPositions: { pos: THREE.Vector3; speed: number; lane: number }[] = [];

  private buildingFacadeTexture!: THREE.CanvasTexture;
  private buildingMaterials: THREE.MeshStandardMaterial[] = [];
  private neonAccentMat!: THREE.MeshStandardMaterial;

  public init(parentScene: THREE.Scene) {
    this.buildingFacadeTexture = createBuildingFacadeTexture();

    // 1. Grid Ground Plaza
    const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.cityGround = new THREE.Mesh(groundGeo, groundMat);
    this.cityGround.rotation.x = -Math.PI / 2;
    this.group.add(this.cityGround);

    // 2. Neon accents & Skyscrapers
    this.neonAccentMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: new THREE.Color(0x0891b2),
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    this.buildSkyscrapers();
    this.group.add(this.buildingGroup);

    // 3. Clean energy wind turbines (3-part composite)
    this.buildWindTurbines();

    // 4. Autonomous hovercraft traffic (InstancedMesh)
    this.buildTraffic();

    parentScene.add(this.group);
  }

  private buildSkyscrapers() {
    const buildingCoords = [
      // Core cluster
      { x: -8, z: -8, h: 18, w: 4, d: 4 },
      { x: 0, z: -8, h: 26, w: 5, d: 5 },
      { x: 8, z: -8, h: 20, w: 4, d: 4 },
      { x: -8, z: 2, h: 22, w: 4.5, d: 4.5 },
      { x: 0, z: 2, h: 32, w: 6, d: 6 }, // Centerpiece tower
      { x: 8, z: 2, h: 24, w: 4.5, d: 4.5 },
      { x: -14, z: -4, h: 14, w: 3.5, d: 3.5 },
      { x: 14, z: -4, h: 16, w: 3.5, d: 3.5 },
      { x: -14, z: 6, h: 12, w: 3.5, d: 3.5 },
      { x: 14, z: 6, h: 15, w: 3.5, d: 3.5 },
    ];

    buildingCoords.forEach((b) => {
      const bldg = new THREE.Group();

      // Part 1: Main Tower Body
      const towerMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        map: this.buildingFacadeTexture,
        roughness: 0.35,
        metalness: 0.7,
      });
      this.buildingMaterials.push(towerMat);

      const towerGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = b.h / 2;
      bldg.add(tower);

      // Part 2: Podium Base
      const baseGeo = new THREE.BoxGeometry(b.w + 1, 1.2, b.d + 1);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.6;
      bldg.add(base);

      // Part 3: Rooftop spire / communication antenna
      const spireGeo = new THREE.CylinderGeometry(0.08, 0.2, 5, 8);
      const spire = new THREE.Mesh(spireGeo, this.neonAccentMat);
      spire.position.y = b.h + 2.5;
      bldg.add(spire);

      // Part 4: Rooftop crown trim
      const crownGeo = new THREE.BoxGeometry(b.w * 0.7, 0.8, b.d * 0.7);
      const crown = new THREE.Mesh(crownGeo, this.neonAccentMat);
      crown.position.y = b.h + 0.4;
      bldg.add(crown);

      bldg.position.set(b.x, 0, b.z);
      this.buildingGroup.add(bldg);
    });
  }

  private buildWindTurbines() {
    const turbineCoords = [
      { x: -22, z: -15 },
      { x: -22, z: -5 },
      { x: -22, z: 5 },
    ];

    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 });

    turbineCoords.forEach((coord) => {
      const turbine = new THREE.Group();

      // Part 1: Mast
      const mastGeo = new THREE.CylinderGeometry(0.2, 0.4, 14, 8);
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 7;
      turbine.add(mast);

      // Part 2: Nacelle
      const nacelleGeo = new THREE.BoxGeometry(0.8, 0.8, 1.6);
      const nacelle = new THREE.Mesh(nacelleGeo, mastMat);
      nacelle.position.set(0, 14, 0);
      turbine.add(nacelle);

      // Part 3: 3 Blades
      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(0, 14, 0.9);
      for (let i = 0; i < 3; i++) {
        const bladeGeo = new THREE.BoxGeometry(0.35, 5, 0.08);
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 2.5;
        const arm = new THREE.Group();
        arm.rotation.z = (i * Math.PI * 2) / 3;
        arm.add(blade);
        bladeGroup.add(arm);
      }
      turbine.add(bladeGroup);
      this.turbineBlades.push(bladeGroup as any);

      turbine.position.set(coord.x, 0, coord.z);
      this.group.add(turbine);
    });
  }

  private buildTraffic() {
    const carGeo = new THREE.BoxGeometry(0.6, 0.25, 1.4);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.9,
    });

    this.trafficMesh = new THREE.InstancedMesh(carGeo, carMat, this.trafficCount);
    const dummy = new THREE.Matrix4();

    for (let i = 0; i < this.trafficCount; i++) {
      const lane = i % 3;
      const x = lane === 0 ? -4 : lane === 1 ? 4 : 10;
      const z = (Math.random() - 0.5) * 50;
      const speed = 12 + Math.random() * 8;
      this.trafficPositions.push({ pos: new THREE.Vector3(x, 1 + lane * 1.5, z), speed, lane });

      dummy.setPosition(x, 1 + lane * 1.5, z);
      this.trafficMesh.setMatrixAt(i, dummy);
    }
    this.trafficMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.trafficMesh);
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 100) / 100;

    // 1. Rotate wind turbine blades bound to rotationSpeed
    const turbineSpeed = (params.energySource === 'renewable' ? 3.5 : 1.2) * rotSpeed;
    this.turbineBlades.forEach((b) => {
      b.rotation.z += turbineSpeed * dt;
    });

    // 2. Animate traffic along aerial transit corridors bound to rotationSpeed
    const dummy = new THREE.Matrix4();
    const trafficActive = Math.max(10, Math.round((params.population / 100) * this.trafficCount));

    for (let i = 0; i < this.trafficCount; i++) {
      if (i < trafficActive) {
        const item = this.trafficPositions[i];
        item.pos.z += item.speed * dt * rotSpeed;
        if (item.pos.z > 28) item.pos.z = -28;

        dummy.setPosition(item.pos);
        this.trafficMesh.setMatrixAt(i, dummy);
      } else {
        dummy.setPosition(0, -100, 0); // Hide offscreen
        this.trafficMesh.setMatrixAt(i, dummy);
      }
    }
    this.trafficMesh.instanceMatrix.needsUpdate = true;

    // 3. React to Energy Source, Temperature & Atmosphere Density
    this.neonAccentMat.emissiveIntensity = 0.5 + densityFactor * 0.45;

    if (params.temperature > 32) {
      // Overheated grid / thermal stress
      this.neonAccentMat.color.setHex(0xf97316);
      this.neonAccentMat.emissive.setHex(0xea580c);
    } else if (params.energySource === 'renewable') {
      this.neonAccentMat.color.setHex(0x10b981); // Emerald
      this.neonAccentMat.emissive.setHex(0x059669);
    } else if (params.energySource === 'fossil') {
      this.neonAccentMat.color.setHex(0xf59e0b); // Amber smog
      this.neonAccentMat.emissive.setHex(0xd97706);
    } else {
      this.neonAccentMat.color.setHex(0x06b6d4); // Cyan
      this.neonAccentMat.emissive.setHex(0x0891b2);
    }
  }

  public dispose() {
    this.buildingFacadeTexture.dispose();
    this.cityGround.geometry.dispose();
    (this.cityGround.material as THREE.Material).dispose();

    this.neonAccentMat.dispose();
    this.buildingMaterials.forEach((m) => m.dispose());

    this.trafficMesh.geometry.dispose();
    (this.trafficMesh.material as THREE.Material).dispose();

    this.buildingGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}
