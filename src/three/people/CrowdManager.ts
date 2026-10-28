import * as THREE from 'three';
import { WorldSceneId, SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';

export class CrowdManager {
  public group: THREE.Group;
  private citizenMesh!: THREE.InstancedMesh;
  private umbrellaMesh!: THREE.InstancedMesh;
  private maskMesh!: THREE.InstancedMesh;

  private citizenCount = 90;
  private citizens: {
    pos: THREE.Vector3;
    target: THREE.Vector3;
    speed: number;
    walkCycle: number;
    sceneType: WorldSceneId;
    isIndoors: boolean;
  }[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.initMeshes();
  }

  private initMeshes() {
    // Humanoid figure: composite capsule body + head
    // Body (torso + legs)
    const bodyGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.9, 8);
    bodyGeo.translate(0, 0.45, 0);

    const headGeo = new THREE.SphereGeometry(0.15, 8, 8);
    headGeo.translate(0, 1.05, 0);

    // Merge body + head into single humanoid geometry
    const personGeo = new THREE.BufferGeometry();
    const pos1 = bodyGeo.attributes.position;
    const pos2 = headGeo.attributes.position;
    const totalVerts = pos1.count + pos2.count;
    const combinedPositions = new Float32Array(totalVerts * 3);
    combinedPositions.set(pos1.array, 0);
    combinedPositions.set(pos2.array, pos1.count * 3);
    personGeo.setAttribute('position', new THREE.BufferAttribute(combinedPositions, 3));
    personGeo.computeVertexNormals();

    const personMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.35,
      roughness: 0.4,
      metalness: 0.2,
    });
    this.citizenMesh = new THREE.InstancedMesh(personGeo, personMat, this.citizenCount);
    this.citizenMesh.castShadow = true;
    this.group.add(this.citizenMesh);

    // Umbrellas for rain
    const umbrellaGeo = new THREE.ConeGeometry(0.65, 0.25, 12, 1, true);
    umbrellaGeo.translate(0, 1.35, 0);
    const umbrellaMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.4,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    this.umbrellaMesh = new THREE.InstancedMesh(umbrellaGeo, umbrellaMat, this.citizenCount);
    this.group.add(this.umbrellaMesh);

    // Respirator masks for pollution / hypoxia
    const maskGeo = new THREE.BoxGeometry(0.2, 0.12, 0.14);
    maskGeo.translate(0, 1.02, 0.1);
    const maskMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      emissive: new THREE.Color(0xeab308),
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    this.maskMesh = new THREE.InstancedMesh(maskGeo, maskMat, this.citizenCount);
    this.group.add(this.maskMesh);

    // Pre-populate citizens
    for (let i = 0; i < this.citizenCount; i++) {
      this.citizens.push({
        pos: new THREE.Vector3(0, 0, 0),
        target: new THREE.Vector3(0, 0, 0),
        speed: 1.2 + Math.random() * 0.8,
        walkCycle: Math.random() * Math.PI * 2,
        sceneType: 'future-city',
        isIndoors: false,
      });
    }
  }

  public configureForScene(sceneId: WorldSceneId) {
    const dummy = new THREE.Matrix4();

    this.citizens.forEach((c, idx) => {
      c.sceneType = sceneId;
      c.isIndoors = false;

      if (sceneId === 'future-city') {
        // Sidewalks & avenues along streets (x = -10 to 10, z = -35 to 35)
        const sidewalkX = idx % 2 === 0 ? (Math.random() > 0.5 ? 6.5 : -6.5) : (Math.random() > 0.5 ? 12.5 : -12.5);
        c.pos.set(sidewalkX + (Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 60);
        c.target.set(sidewalkX, 0, c.pos.z > 0 ? -35 : 35);
        c.speed = 1.4 + Math.random() * 0.9;
      } else if (sceneId === 'mars-colony') {
        // Colonists walking along pressurized dome transit paths
        const angle = Math.random() * Math.PI * 2;
        const rad = 2 + Math.random() * 7;
        c.pos.set(Math.cos(angle) * rad, 0, Math.sin(angle) * rad);
        c.target.set(-c.pos.x, 0, -c.pos.z);
        c.speed = 0.8 + Math.random() * 0.4;
      } else if (sceneId === 'forest-valley') {
        // Hikers along river trail and observation lodge
        c.pos.set(4 + Math.random() * 4, 0.4, (Math.random() - 0.5) * 30);
        c.target.set(c.pos.x, 0.4, -c.pos.z);
        c.speed = 1.0 + Math.random() * 0.6;
      } else if (sceneId === 'ocean-world') {
        // Scientists on the research vessel deck
        c.pos.set(-6 + (Math.random() - 0.5) * 1.8, 0.8, -8 + (Math.random() - 0.5) * 1.8);
        c.target.set(-6 + (Math.random() - 0.5) * 1.8, 0.8, -8 + (Math.random() - 0.5) * 1.8);
        c.speed = 0.6 + Math.random() * 0.4;
      } else {
        // Mini Earth: Citizens represented as planetary population clusters
        c.isIndoors = true;
      }

      dummy.setPosition(c.pos);
      this.citizenMesh.setMatrixAt(idx, dummy);
    });

    this.citizenMesh.instanceMatrix.needsUpdate = true;
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores,
    sceneId: WorldSceneId
  ) {
    if (sceneId === 'mini-earth') {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    const dummy = new THREE.Matrix4();
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const aqi = conditions.physics.airQualityIndex;
    const isEmergency = conditions.demographics.evacuationStatus === 'emergency';
    const isRaining = events.heavyRain || params.rainfall > 55;
    const shouldWearMask = conditions.demographics.maskCompliancePercent > 40 || aqi > 120 || params.oxygen < 16;

    // Density of people outdoors: toxic air or extreme storm drives citizens indoors
    const outdoorRatio = isEmergency
      ? 0.15
      : aqi > 250 || events.heatWave
      ? 0.35
      : Math.min(1.0, 0.3 + (conditions.demographics.healthyPercent / 100) * 0.7);

    const activeCount = Math.round(this.citizenCount * outdoorRatio);

    for (let i = 0; i < this.citizenCount; i++) {
      const c = this.citizens[i];

      if (i < activeCount) {
        c.walkCycle += dt * 4 * rotSpeed;
        const currentSpeed = isEmergency ? c.speed * 2.8 : c.speed * rotSpeed;

        // Walk toward target
        const dir = new THREE.Vector3().subVectors(c.target, c.pos);
        if (dir.length() < 1.0) {
          // Pick new target
          c.target.set(c.pos.x, c.pos.y, -c.target.z);
        } else {
          dir.normalize();
          c.pos.addScaledVector(dir, currentSpeed * dt);
        }

        // Slight vertical bounce during walk
        const bounce = Math.abs(Math.sin(c.walkCycle)) * 0.06;

        dummy.makeRotationY(Math.atan2(dir.x, dir.z));
        dummy.setPosition(c.pos.x, c.pos.y + bounce, c.pos.z);
        this.citizenMesh.setMatrixAt(i, dummy);

        // Umbrella handling
        if (isRaining && sceneId !== 'mars-colony') {
          this.umbrellaMesh.setMatrixAt(i, dummy);
        } else {
          dummy.setPosition(0, -999, 0);
          this.umbrellaMesh.setMatrixAt(i, dummy);
        }

        // Respirator Mask handling
        if (shouldWearMask || sceneId === 'mars-colony') {
          this.maskMesh.setMatrixAt(i, dummy);
        } else {
          dummy.setPosition(0, -999, 0);
          this.maskMesh.setMatrixAt(i, dummy);
        }
      } else {
        // Hide indoors
        dummy.setPosition(0, -999, 0);
        this.citizenMesh.setMatrixAt(i, dummy);
        this.umbrellaMesh.setMatrixAt(i, dummy);
        this.maskMesh.setMatrixAt(i, dummy);
      }
    }

    this.citizenMesh.instanceMatrix.needsUpdate = true;
    this.umbrellaMesh.instanceMatrix.needsUpdate = true;
    this.maskMesh.instanceMatrix.needsUpdate = true;
  }

  public dispose() {
    this.citizenMesh.geometry.dispose();
    (this.citizenMesh.material as THREE.Material).dispose();
    this.umbrellaMesh.geometry.dispose();
    (this.umbrellaMesh.material as THREE.Material).dispose();
    this.maskMesh.geometry.dispose();
    (this.maskMesh.material as THREE.Material).dispose();
  }
}
