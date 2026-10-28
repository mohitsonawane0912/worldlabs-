import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';

export class ForestValleyScene implements IWorldScene {
  public group = new THREE.Group();

  private terrainMesh!: THREE.Mesh;
  private riverMesh!: THREE.Mesh;
  private terrainMat!: THREE.MeshStandardMaterial;
  private riverMat!: THREE.MeshStandardMaterial;
  private treeGroup = new THREE.Group();
  private observationTower = new THREE.Group();
  private leavesMaterials: THREE.MeshStandardMaterial[] = [];

  private riverFlow = 0;

  public init(parentScene: THREE.Scene) {
    // 1. Rolling terrain geometry with river valley depression
    const terrainGeo = new THREE.PlaneGeometry(60, 60, 48, 48);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Carve river gorge down the center (x ~ 0)
      const riverDist = Math.abs(x + Math.sin(y * 0.15) * 4);
      let height = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 3 + Math.sin(x * 0.25) * 1.5;
      if (riverDist < 5) {
        height = -1.2 + (riverDist / 5) * 0.8;
      }
      pos.setZ(i, height);
    }
    terrainGeo.computeVertexNormals();

    this.terrainMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    this.terrainMesh = new THREE.Mesh(terrainGeo, this.terrainMat);
    this.terrainMesh.rotation.x = -Math.PI / 2;
    this.group.add(this.terrainMesh);

    // 2. River water ribbon
    const riverGeo = new THREE.PlaneGeometry(8, 60, 16, 32);
    this.riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    this.riverMesh = new THREE.Mesh(riverGeo, this.riverMat);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.y = -0.6;
    this.group.add(this.riverMesh);

    // 3. Composite Trees (3-5 parts each: trunk, roots, 2-3 canopy layers)
    this.populateTrees();
    this.group.add(this.treeGroup);

    // 4. Observation Tower / Research Lodge (multi-part model)
    this.buildObservationTower();
    this.group.add(this.observationTower);

    parentScene.add(this.group);
  }

  private populateTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5c4033,
      roughness: 0.9,
    });

    const treePositions = [
      [-16, -12], [-14, -8], [-18, 4], [-22, 10], [-12, 16],
      [-8, -18], [-9, 14], [10, -14], [14, -8], [18, -4],
      [15, 8], [12, 18], [20, 14], [22, -16], [-10, -4],
      [9, -2], [14, 2], [-16, 20], [18, -20], [-22, -18],
    ];

    treePositions.forEach(([x, z], idx) => {
      const tree = new THREE.Group();
      // Part 1: Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 2.4, 8);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.2;
      tree.add(trunk);

      // Part 2 & 3 & 4: Multi-tier canopy cones
      const leavesMat = new THREE.MeshStandardMaterial({
        color: 0x388e3c,
        roughness: 0.75,
        flatShading: true,
      });
      this.leavesMaterials.push(leavesMat);

      const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 7), leavesMat);
      tier1.position.y = 2.6;
      tree.add(tier1);

      const tier2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 7), leavesMat);
      tier2.position.y = 3.6;
      tree.add(tier2);

      const tier3 = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.4, 7), leavesMat);
      tier3.position.y = 4.4;
      tree.add(tier3);

      const scale = 0.8 + (idx % 5) * 0.12;
      tree.scale.set(scale, scale, scale);
      tree.position.set(x, 0.4, z);
      this.treeGroup.add(tree);
    });
  }

  private buildObservationTower() {
    // 5-part wooden research tower overlooking the river
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 });

    // 4 Stilts
    for (let dx of [-0.8, 0.8]) {
      for (let dz of [-0.8, 0.8]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), woodMat);
        post.position.set(dx, 2, dz);
        this.observationTower.add(post);
      }
    }
    // Cabin deck
    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, 2.2), woodMat);
    deck.position.y = 4.1;
    this.observationTower.add(deck);

    // Cabin walls
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 1.8), woodMat);
    cabin.position.y = 4.9;
    this.observationTower.add(cabin);

    // Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 1, 4), metalMat);
    roof.position.y = 6.1;
    roof.rotation.y = Math.PI / 4;
    this.observationTower.add(roof);

    // Anemometer / weather instrument
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), metalMat);
    mast.position.y = 7;
    this.observationTower.add(mast);

    this.observationTower.position.set(7, 0, 4);
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 100) / 100;

    // 1. Animate river flow and tree wind sway bound to rotationSpeed
    this.riverFlow += 0.8 * dt * rotSpeed;

    this.treeGroup.children.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(this.riverFlow * 1.5 + idx) * 0.04 * rotSpeed;
      tree.rotation.x = Math.cos(this.riverFlow * 1.2 + idx) * 0.02 * rotSpeed;
    });

    // 2. Temperature feedback on foliage & terrain
    let leafColor = 0x388e3c;
    let groundColor = 0x2e7d32;

    if (params.temperature < -5) {
      // Freezing / Frost glaze
      leafColor = 0x86efac; // Frosted mint
      groundColor = 0xdcfce7; // Snow dusted
    } else if (events.drought || params.rainfall < 25 || params.temperature > 35) {
      leafColor = 0x854d0e; // Dried brown
      groundColor = 0x713f12; // Arid dirt
    } else if (params.temperature > 26) {
      leafColor = 0xb45309; // Warm autumn amber
      groundColor = 0x4d7c0f;
    } else if (params.airPollution > 50) {
      leafColor = 0x4d7c0f; // Sickly olive
      groundColor = 0x3f6212;
    } else if (params.oxygen < 14) {
      leafColor = 0x15803d; // Stunted
    }

    this.leavesMaterials.forEach((mat) => {
      mat.color.setHex(leafColor);
    });
    this.terrainMat.color.setHex(groundColor);

    // 3. Atmosphere Density & Rainfall on river water & ground wetness
    const wetness = conditions.physics.surfaceWetness;
    this.terrainMat.roughness = THREE.MathUtils.lerp(0.85, 0.38, wetness);
    this.terrainMat.metalness = THREE.MathUtils.lerp(0.05, 0.4, wetness);

    let waterHeight = -0.6;
    let waterScaleX = 1.0;
    if (events.drought) {
      waterHeight = -0.9;
      waterScaleX = 0.5;
      this.riverMat.opacity = 0.45;
    } else if (events.heavyRain || params.rainfall > 80) {
      waterHeight = -0.2;
      waterScaleX = 1.4;
      this.riverMat.opacity = Math.min(0.98, 0.85 * densityFactor);
    } else {
      this.riverMat.opacity = Math.min(0.92, 0.75 * densityFactor);
    }
    this.riverMesh.position.y = waterHeight;
    this.riverMesh.scale.x = waterScaleX;
  }

  public dispose() {
    this.terrainMesh.geometry.dispose();
    this.terrainMat.dispose();

    this.riverMesh.geometry.dispose();
    this.riverMat.dispose();

    this.leavesMaterials.forEach((mat) => mat.dispose());

    this.treeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });

    this.observationTower.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}
