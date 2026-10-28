import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';
import { createMarsTerrainTexture } from '../utils/textureGen';

export class MarsColonyScene implements IWorldScene {
  public group = new THREE.Group();

  private terrainMesh!: THREE.Mesh;
  private terrainMat!: THREE.MeshStandardMaterial;
  private marsTexture!: THREE.CanvasTexture;

  private domeGroup = new THREE.Group();
  private solarFarm = new THREE.Group();
  private roverGroup = new THREE.Group();
  private bioPlants: THREE.Mesh[] = [];

  private domeGlassMat!: THREE.MeshStandardMaterial;
  private domeGreenMat!: THREE.MeshStandardMaterial;

  public init(parentScene: THREE.Scene) {
    this.marsTexture = createMarsTerrainTexture();

    // 1. Martian cratered terrain
    const terrainGeo = new THREE.PlaneGeometry(60, 60, 36, 36);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const distCenter = Math.sqrt(x * x + y * y);
      // Flatten colony center
      let z = Math.sin(x * 0.12) * Math.cos(y * 0.12) * 2.2 + Math.sin(x * 0.3) * 0.8;
      if (distCenter < 12) {
        z *= distCenter / 12;
      }
      pos.setZ(i, z);
    }
    terrainGeo.computeVertexNormals();

    this.terrainMat = new THREE.MeshStandardMaterial({
      map: this.marsTexture,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true,
    });
    this.terrainMesh = new THREE.Mesh(terrainGeo, this.terrainMat);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.group.add(this.terrainMesh);

    // 2. Colony Biodomes (Composite geodesic domes)
    this.buildColonyDomes();
    this.group.add(this.domeGroup);

    // 3. Solar Panel Farm
    this.buildSolarFarm();
    this.group.add(this.solarFarm);

    // 4. Mars Exploration Rover (6-wheel composite)
    this.buildRover();
    this.group.add(this.roverGroup);

    parentScene.add(this.group);
  }

  private buildColonyDomes() {
    this.domeGlassMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.85,
    });

    this.domeGreenMat = new THREE.MeshStandardMaterial({
      color: 0x16a34a,
      roughness: 0.7,
    });

    const foundationMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.5,
      metalness: 0.7,
    });

    const domeConfigs = [
      { x: 0, z: 0, r: 4.5, h: 3.5 }, // Central bio-hub
      { x: -6, z: -4, r: 3.2, h: 2.6 }, // Habitat Alpha
      { x: 6, z: -3, r: 3.0, h: 2.4 }, // Hydroponics
      { x: 1, z: 6, r: 2.8, h: 2.2 }, // Lab Dome
    ];

    domeConfigs.forEach((cfg) => {
      const dome = new THREE.Group();

      // Part 1: Foundation airlock ring
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(cfg.r * 1.05, cfg.r * 1.08, 0.5, 24), foundationMat);
      ring.position.y = 0.25;
      dome.add(ring);

      // Part 2: Glass biodome
      const glass = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), this.domeGlassMat);
      glass.position.y = 0.35;
      dome.add(glass);

      // Part 3: Interior hydroponic trees/flora
      for (let i = 0; i < 4; i++) {
        const flora = new THREE.Mesh(new THREE.ConeGeometry(cfg.r * 0.25, cfg.r * 0.6, 6), this.domeGreenMat);
        const a = (i / 4) * Math.PI * 2;
        flora.position.set(Math.cos(a) * cfg.r * 0.45, (cfg.r * 0.6) / 2 + 0.35, Math.sin(a) * cfg.r * 0.45);
        dome.add(flora);
        this.bioPlants.push(flora);
      }

      dome.position.set(cfg.x, 0, cfg.z);
      this.domeGroup.add(dome);
    });

    // Connecting pressurized tunnels
    const tunnelGeo = new THREE.CylinderGeometry(0.4, 0.4, 6.2, 12);
    const t1 = new THREE.Mesh(tunnelGeo, foundationMat);
    t1.rotation.z = Math.PI / 2;
    t1.position.set(-3, 0.4, -2);
    t1.rotation.y = 0.6;
    this.domeGroup.add(t1);

    const t2 = new THREE.Mesh(tunnelGeo, foundationMat);
    t2.rotation.z = Math.PI / 2;
    t2.position.set(3, 0.4, -1.5);
    t2.rotation.y = -0.5;
    this.domeGroup.add(t2);
  }

  private buildSolarFarm() {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const cellMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: new THREE.Color(0x172554),
      emissiveIntensity: 0.3,
      metalness: 0.9,
      roughness: 0.1,
    });

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const panel = new THREE.Group();
        // Stand
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6), metalMat);
        stand.position.y = 0.6;
        panel.add(stand);

        // Panel plate
        const plate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.4), cellMat);
        plate.position.set(0, 1.2, 0);
        plate.rotation.x = 0.35; // Sun tilt
        panel.add(plate);

        panel.position.set(-14 + col * 2.8, 0, 8 + row * 2.2);
        this.solarFarm.add(panel);
      }
    }
  }

  private buildRover() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.7 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 2.0), bodyMat);
    chassis.position.y = 0.65;
    this.roverGroup.add(chassis);

    // 6 Wheels
    for (let side of [-0.85, 0.85]) {
      for (let dz of [-0.7, 0, 0.7]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 10), wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side, 0.35, dz);
        this.roverGroup.add(wheel);
      }
    }

    // Camera mast & dish
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), bodyMat);
    mast.position.set(0.4, 1.15, -0.6);
    this.roverGroup.add(mast);

    const dish = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.1, 8, 1, true), bodyMat);
    dish.position.set(-0.3, 1.05, 0.5);
    dish.rotation.x = Math.PI / 4;
    this.roverGroup.add(dish);

    this.roverGroup.position.set(6, 0, 10);
    this.roverGroup.rotation.y = -0.5;
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 20) / 100;

    // 1. Terraforming visual reaction bound to Oxygen, Temperature & Atmosphere Density:
    // Warmer temp and thicker atmosphere encourage hydroponic growth
    const tempFactor = Math.max(0.2, (params.temperature + 60) / 80);
    const terraformFactor = Math.min(
      2.2,
      Math.max(0.4, (params.oxygen / 21) * 0.7 + (params.rainfall / 50) * 0.3 + tempFactor * 0.5 + densityFactor * 0.4)
    );

    this.bioPlants.forEach((p) => {
      p.scale.set(terraformFactor, terraformFactor, terraformFactor);
    });

    // Biodome glass clarity and atmosphere diffusion
    this.domeGlassMat.opacity = Math.max(0.25, Math.min(0.7, 0.35 + densityFactor * 0.25));

    // 2. Rover patrol animation bound to rotationSpeed
    this.roverGroup.rotation.y += 0.05 * dt * rotSpeed;
  }

  public dispose() {
    this.marsTexture.dispose();
    this.terrainMesh.geometry.dispose();
    this.terrainMat.dispose();

    this.domeGlassMat.dispose();
    this.domeGreenMat.dispose();

    this.domeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });

    this.solarFarm.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });

    this.roverGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) child.material.dispose();
      }
    });
  }
}
