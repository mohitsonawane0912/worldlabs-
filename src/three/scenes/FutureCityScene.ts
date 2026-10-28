import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';
import { createBuildingFacadeTexture } from '../utils/textureGen';

export class FutureCityScene implements IWorldScene {
  public group = new THREE.Group();

  private cityGround!: THREE.Mesh;
  private roadMesh!: THREE.Mesh;
  private buildingGroup = new THREE.Group();
  private skybridgeGroup = new THREE.Group();
  private streetLampsGroup = new THREE.Group();
  private turbineBlades: THREE.Mesh[] = [];

  private trafficMesh!: THREE.InstancedMesh;
  private trafficCount = 75;
  private trafficPositions: { pos: THREE.Vector3; speed: number; lane: number }[] = [];

  private buildingFacadeTexture!: THREE.CanvasTexture;
  private buildingMaterials: THREE.MeshStandardMaterial[] = [];
  private neonAccentMat!: THREE.MeshStandardMaterial;
  private roadMat!: THREE.MeshStandardMaterial;
  private groundMat!: THREE.MeshStandardMaterial;

  private billboardMesh!: THREE.Mesh;
  private billboardMat!: THREE.MeshBasicMaterial;

  public init(parentScene: THREE.Scene) {
    this.buildingFacadeTexture = createBuildingFacadeTexture();

    // 1. Sprawling City Ground & Road Network (80x80m district)
    const groundGeo = new THREE.PlaneGeometry(90, 90, 32, 32);
    this.groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.85,
      metalness: 0.2,
    });
    this.cityGround = new THREE.Mesh(groundGeo, this.groundMat);
    this.cityGround.rotation.x = -Math.PI / 2;
    this.group.add(this.cityGround);

    // Multi-lane asphalt avenues
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.75,
      metalness: 0.35,
    });
    const roadGeo = new THREE.PlaneGeometry(88, 88);
    this.roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
    this.roadMesh.rotation.x = -Math.PI / 2;
    this.roadMesh.position.y = 0.02;
    this.group.add(this.roadMesh);

    // 2. High-Tech Neon Architectural Accent Material
    this.neonAccentMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: new THREE.Color(0x0891b2),
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.8,
    });

    // 3. Sprawling Realistic Metropolis with 80+ Skyscrapers
    this.buildDenseMetropolis();
    this.group.add(this.buildingGroup);

    // 4. Elevated Skybridges connecting towers
    this.buildSkybridges();
    this.group.add(this.skybridgeGroup);

    // 5. Street Lighting & Civic Billboards
    this.buildStreetInfrastructure();
    this.group.add(this.streetLampsGroup);

    // 6. Perimeter Clean Energy Wind Turbines
    this.buildPerimeterTurbines();

    // 7. Multi-lane Highway Traffic with Headlights
    this.buildDenseTraffic();

    // 8. Dedicated Metropolis High-Visibility Lighting
    const cityAmbient = new THREE.AmbientLight(0x93c5fd, 0.9);
    this.group.add(cityAmbient);

    const cityKeyLight = new THREE.DirectionalLight(0xffedd5, 2.6);
    cityKeyLight.position.set(40, 70, 50);
    this.group.add(cityKeyLight);

    const cityRimLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
    cityRimLight.position.set(-40, 50, -40);
    this.group.add(cityRimLight);

    parentScene.add(this.group);
  }

  private buildDenseMetropolis() {
    // Generate an 80+ building district across structured city blocks with avenues and alleys
    const blockGrid: { x: number; z: number; w: number; d: number; h: number; type: string }[] = [];

    // Define 4 major avenues: Central boulevard at x = 0, Cross avenue at z = 0
    // Quad 1: Top-Left, Quad 2: Top-Right, Quad 3: Bottom-Left, Quad 4: Bottom-Right
    const quads = [
      { minX: -38, maxX: -6, minZ: -38, maxZ: -6 },
      { minX: 6, maxX: 38, minZ: -38, maxZ: -6 },
      { minX: -38, maxX: -6, minZ: 6, maxZ: 38 },
      { minX: 6, maxX: 38, minZ: 6, maxZ: 38 },
    ];

    quads.forEach((quad, qIdx) => {
      for (let bx = quad.minX + 3; bx <= quad.maxX - 3; bx += 6.5) {
        for (let bz = quad.minZ + 3; bz <= quad.maxZ - 3; bz += 6.5) {
          const distCenter = Math.sqrt(bx * bx + bz * bz);
          // Realistic skyline profile: taller near core (35-46m), mid-rises (18-28m) toward outskirts
          let height = Math.max(14, 46 - distCenter * 0.55 + (Math.sin(bx * 0.5) * 6));
          if (distCenter < 16) height = 38 + Math.random() * 12;

          const width = 3.6 + Math.random() * 1.6;
          const depth = 3.6 + Math.random() * 1.6;
          blockGrid.push({ x: bx, z: bz, w: width, d: depth, h: height, type: qIdx === 0 ? 'corp' : 'res' });
        }
      }
    });

    // Centerpiece Supertall Mega-Towers flanking the central crossroads
    blockGrid.push({ x: -9, z: -9, w: 5.5, d: 5.5, h: 56, type: 'apex' });
    blockGrid.push({ x: 9, z: 9, w: 5.0, d: 5.0, h: 52, type: 'apex' });

    blockGrid.forEach((b) => {
      const bldg = new THREE.Group();

      // Main tower body
      const towerMat = new THREE.MeshStandardMaterial({
        color: b.type === 'apex' ? 0x24344d : 0x334460,
        map: this.buildingFacadeTexture,
        roughness: 0.4,
        metalness: 0.25,
      });
      this.buildingMaterials.push(towerMat);

      const towerGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.y = b.h / 2;
      bldg.add(tower);

      // Base Podium
      const baseGeo = new THREE.BoxGeometry(b.w + 0.8, 1.4, b.d + 0.8);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.7;
      bldg.add(base);

      // Architectural top crowns / antennas for tall towers
      if (b.h > 35) {
        const crown = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.7, 1.2, b.d * 0.7), this.neonAccentMat);
        crown.position.y = b.h + 0.6;
        bldg.add(crown);

        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.22, 6.5, 6), this.neonAccentMat);
        spire.position.y = b.h + 4.2;
        bldg.add(spire);
      }

      bldg.position.set(b.x, 0, b.z);
      this.buildingGroup.add(bldg);
    });
  }

  private buildSkybridges() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
    });

    const bridgeCoords = [
      { x1: -10, z1: -12, x2: -10, z2: -6, y: 22 },
      { x1: 10, z1: -12, x2: 10, z2: -6, y: 26 },
      { x1: -12, z1: 10, x2: -6, z1: 10, y: 18 },
      { x1: 8, z1: 14, x2: 14, z1: 14, y: 24 },
      { x1: -2.5, z1: -2.5, x2: 2.5, z1: 2.5, y: 36 }, // Apex Skybridge
    ];

    bridgeCoords.forEach((bc) => {
      const bridge = new THREE.Group();
      const length = 7.5;
      const span = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, length), glassMat);
      bridge.add(span);

      const rail1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, length), metalMat);
      rail1.position.set(0.65, 0.6, 0);
      bridge.add(rail1);

      const rail2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, length), metalMat);
      rail2.position.set(-0.65, 0.6, 0);
      bridge.add(rail2);

      bridge.position.set((bc.x1 + (bc.x2 || bc.x1)) / 2, bc.y, (bc.z1 + (bc.z2 || bc.z1)) / 2);
      this.skybridgeGroup.add(bridge);
    });
  }

  private buildStreetInfrastructure() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let z = -36; z <= 36; z += 12) {
      for (let side of [-4.5, 4.5]) {
        const lamp = new THREE.Group();
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.5, 6), metalMat);
        post.position.y = 1.75;
        lamp.add(post);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.5), metalMat);
        head.position.set(0, 3.5, 0.2);
        lamp.add(head);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), lampGlowMat);
        bulb.position.set(0, 3.4, 0.35);
        lamp.add(bulb);

        lamp.position.set(side, 0, z);
        this.streetLampsGroup.add(lamp);
      }
    }

    // Civic Holographic Billboard
    const boardGeo = new THREE.PlaneGeometry(12, 6);
    this.billboardMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    this.billboardMesh = new THREE.Mesh(boardGeo, this.billboardMat);
    this.billboardMesh.position.set(0, 24, 0);
    this.billboardMesh.rotation.y = Math.PI / 4;
    this.group.add(this.billboardMesh);
  }

  private buildPerimeterTurbines() {
    const turbineCoords = [
      { x: -42, z: -25 },
      { x: -42, z: 0 },
      { x: -42, z: 25 },
      { x: 42, z: -20 },
      { x: 42, z: 15 },
    ];

    const mastMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.8 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 });

    turbineCoords.forEach((coord) => {
      const turbine = new THREE.Group();
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 18, 8), mastMat);
      mast.position.y = 9;
      turbine.add(mast);

      const nacelle = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 2.0), mastMat);
      nacelle.position.set(0, 18, 0);
      turbine.add(nacelle);

      const bladeGroup = new THREE.Group();
      bladeGroup.position.set(0, 18, 1.1);
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.5, 0.1), bladeMat);
        blade.position.y = 3.2;
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

  private buildDenseTraffic() {
    const carGeo = new THREE.BoxGeometry(0.65, 0.28, 1.5);
    const carMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.9,
    });

    this.trafficMesh = new THREE.InstancedMesh(carGeo, carMat, this.trafficCount);
    const dummy = new THREE.Matrix4();

    for (let i = 0; i < this.trafficCount; i++) {
      const lane = i % 6;
      // 3 Northbound lanes, 3 Southbound lanes
      const laneX = lane === 0 ? -2.2 : lane === 1 ? -1.0 : lane === 2 ? -3.2 : lane === 3 ? 1.0 : lane === 4 ? 2.2 : 3.2;
      const z = (Math.random() - 0.5) * 80;
      const speed = (lane < 3 ? -1 : 1) * (14 + Math.random() * 8);

      this.trafficPositions.push({ pos: new THREE.Vector3(laneX, 0.25, z), speed, lane });
      dummy.setPosition(laneX, 0.25, z);
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

    // 1. Rotate wind turbine blades
    const turbineSpeed = (params.energySource === 'renewable' ? 3.5 : 1.2) * rotSpeed;
    this.turbineBlades.forEach((b) => {
      b.rotation.z += turbineSpeed * dt;
    });

    // 2. Animate dense multi-lane traffic
    const dummy = new THREE.Matrix4();
    const trafficActive = Math.max(15, Math.round((params.population / 100) * this.trafficCount));

    for (let i = 0; i < this.trafficCount; i++) {
      if (i < trafficActive) {
        const item = this.trafficPositions[i];
        item.pos.z += item.speed * dt * rotSpeed;
        if (item.pos.z > 42) item.pos.z = -42;
        if (item.pos.z < -42) item.pos.z = 42;

        dummy.setPosition(item.pos);
        this.trafficMesh.setMatrixAt(i, dummy);
      } else {
        dummy.setPosition(0, -999, 0);
        this.trafficMesh.setMatrixAt(i, dummy);
      }
    }
    this.trafficMesh.instanceMatrix.needsUpdate = true;

    // 3. Realistic Surface Wetness (Asphalt reflectivity in rain)
    const wetness = conditions.physics.surfaceWetness;
    this.roadMat.roughness = Math.max(0.12, 0.75 - wetness * 0.6); // Glossy wet street reflections
    this.roadMat.metalness = 0.35 + wetness * 0.45;

    // 4. Billboard pulse & civic alerts
    const time = Date.now() * 0.003;
    if (conditions.physics.aqiCategory === 'Hazardous' || conditions.physics.oxygenPartialPressureKPa < 14) {
      this.billboardMat.color.setHex(0xef4444); // Red emergency broadcast
      this.billboardMesh.scale.set(1.05 + Math.sin(time * 3) * 0.05, 1, 1);
    } else {
      this.billboardMat.color.setHex(0x06b6d4);
      this.billboardMesh.scale.set(1, 1, 1);
    }

    // 5. Environmental Lighting & Smog response
    this.neonAccentMat.emissiveIntensity = 0.5 + densityFactor * 0.45;
    if (params.temperature > 32) {
      this.neonAccentMat.color.setHex(0xf97316);
      this.neonAccentMat.emissive.setHex(0xea580c);
    } else if (params.energySource === 'renewable') {
      this.neonAccentMat.color.setHex(0x10b981);
      this.neonAccentMat.emissive.setHex(0x059669);
    } else if (params.energySource === 'fossil') {
      this.neonAccentMat.color.setHex(0xf59e0b);
      this.neonAccentMat.emissive.setHex(0xd97706);
    } else {
      this.neonAccentMat.color.setHex(0x06b6d4);
      this.neonAccentMat.emissive.setHex(0x0891b2);
    }
  }

  public dispose() {
    this.buildingFacadeTexture.dispose();
    this.cityGround.geometry.dispose();
    this.groundMat.dispose();
    this.roadMesh.geometry.dispose();
    this.roadMat.dispose();
    this.neonAccentMat.dispose();
    this.billboardMesh.geometry.dispose();
    this.billboardMat.dispose();

    this.trafficMesh.geometry.dispose();
    (this.trafficMesh.material as THREE.Material).dispose();

    this.buildingGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });

    this.skybridgeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });

    this.streetLampsGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}
