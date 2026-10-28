import * as THREE from 'three';
import { IWorldScene } from './BaseScene';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';
import { createEarthTexture, createCloudsTexture, createCityNightLightsTexture } from '../utils/textureGen';

export class MiniEarthScene implements IWorldScene {
  public group = new THREE.Group();

  private globeMesh!: THREE.Mesh;
  private cloudsMesh!: THREE.Mesh;
  private atmosphereGlowMesh!: THREE.Mesh;
  private auroraRings!: THREE.Mesh;
  private spaceStationGroup = new THREE.Group();

  private globeMat!: THREE.MeshStandardMaterial;
  private cloudsMat!: THREE.MeshStandardMaterial;
  private atmosphereMat!: THREE.MeshBasicMaterial;
  private auroraMat!: THREE.MeshBasicMaterial;

  private earthTexture!: THREE.CanvasTexture;
  private cloudsTexture!: THREE.CanvasTexture;
  private nightTexture!: THREE.CanvasTexture;

  private orbitAngle = 0;

  public init(parentScene: THREE.Scene) {
    // 1. Globe with procedural textures
    this.earthTexture = createEarthTexture(0, 0.4);
    this.nightTexture = createCityNightLightsTexture();

    const globeGeo = new THREE.SphereGeometry(6, 48, 48);
    this.globeMat = new THREE.MeshStandardMaterial({
      map: this.earthTexture,
      roughness: 0.65,
      metalness: 0.1,
      emissiveMap: this.nightTexture,
      emissive: new THREE.Color(0xfff2b2),
      emissiveIntensity: 0.25,
    });
    this.globeMesh = new THREE.Mesh(globeGeo, this.globeMat);
    this.group.add(this.globeMesh);

    // 2. Clouds layer
    this.cloudsTexture = createCloudsTexture();
    const cloudsGeo = new THREE.SphereGeometry(6.12, 36, 36);
    this.cloudsMat = new THREE.MeshStandardMaterial({
      map: this.cloudsTexture,
      transparent: true,
      opacity: 0.55,
      blending: THREE.NormalBlending,
      roughness: 0.9,
    });
    this.cloudsMesh = new THREE.Mesh(cloudsGeo, this.cloudsMat);
    this.group.add(this.cloudsMesh);

    // 3. Atmosphere glow shell
    const atmosphereGeo = new THREE.SphereGeometry(6.45, 36, 36);
    this.atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    this.atmosphereGlowMesh = new THREE.Mesh(atmosphereGeo, this.atmosphereMat);
    this.group.add(this.atmosphereGlowMesh);

    // 4. Aurora Borealis rings (activated on solar flares or high balance)
    const auroraGeo = new THREE.TorusGeometry(3.2, 0.25, 8, 36);
    this.auroraMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.auroraRings = new THREE.Mesh(auroraGeo, this.auroraMat);
    this.auroraRings.position.y = 5.2;
    this.auroraRings.rotation.x = Math.PI / 2;
    this.group.add(this.auroraRings);

    // 5. Space Station procedural composite model (6 parts)
    this.buildSpaceStation();
    this.group.add(this.spaceStationGroup);

    parentScene.add(this.group);
  }

  private buildSpaceStation() {
    // Part 1: Main pressurized habitat cylinder
    const habGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.9, 12);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.85,
      roughness: 0.2,
    });
    const hab = new THREE.Mesh(habGeo, metalMat);
    hab.rotation.z = Math.PI / 2;
    this.spaceStationGroup.add(hab);

    // Part 2: Central structural truss girder
    const trussGeo = new THREE.BoxGeometry(0.06, 1.8, 0.06);
    const truss = new THREE.Mesh(trussGeo, metalMat);
    this.spaceStationGroup.add(truss);

    // Parts 3 & 4: Left & Right Photovoltaic Solar Arrays
    const panelGeo = new THREE.BoxGeometry(0.35, 0.7, 0.02);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.9,
      roughness: 0.1,
      emissive: new THREE.Color(0x172554),
      emissiveIntensity: 0.4,
    });
    const leftPanel = new THREE.Mesh(panelGeo, panelMat);
    leftPanel.position.set(0, 0.75, 0);
    this.spaceStationGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeo, panelMat);
    rightPanel.position.set(0, -0.75, 0);
    this.spaceStationGroup.add(rightPanel);

    // Part 5: Communications dish
    const dishGeo = new THREE.ConeGeometry(0.14, 0.1, 10, 1, true);
    const dish = new THREE.Mesh(dishGeo, metalMat);
    dish.position.set(0.3, 0, 0.2);
    dish.rotation.x = Math.PI / 4;
    this.spaceStationGroup.add(dish);

    // Part 6: Red/green docking navigation beacon
    const beaconGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(-0.5, 0, 0);
    this.spaceStationGroup.add(beacon);

    this.spaceStationGroup.scale.setScalar(0.7);
  }

  public update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ) {
    const rotSpeed = params.rotationSpeed ?? 1.0;
    const densityFactor = (params.atmosphereDensity ?? 100) / 100;

    // 1. Rotate Earth and clouds according to rotationSpeed parameter
    this.globeMesh.rotation.y += 0.08 * dt * rotSpeed;
    this.cloudsMesh.rotation.y += 0.12 * dt * rotSpeed;
    this.cloudsMesh.rotation.x += 0.02 * dt * rotSpeed;

    // 2. Orbiting space station with rotationSpeed binding
    this.orbitAngle += 0.45 * dt * rotSpeed;
    const orbitRadius = 8.5;
    this.spaceStationGroup.position.set(
      Math.cos(this.orbitAngle) * orbitRadius,
      Math.sin(this.orbitAngle * 0.7) * 2.2,
      Math.sin(this.orbitAngle) * orbitRadius
    );
    this.spaceStationGroup.rotation.y = -this.orbitAngle + Math.PI / 2;

    // 3. Atmosphere Glow & Shell scale bound directly to atmosphereDensity & Oxygen & Pollution
    const atmosScale = 1.0 + (densityFactor - 1.0) * 0.09;
    this.atmosphereGlowMesh.scale.set(atmosScale, atmosScale, atmosScale);

    let baseOpacity = 0.22;
    if (params.oxygen < 15) {
      // Hypoxic: paler, thin violet-gray atmosphere
      this.atmosphereMat.color.setHex(0x9333ea);
      baseOpacity = Math.max(0.06, (params.oxygen / 15) * 0.18);
    } else if (params.airPollution > 50) {
      // Smoggy, hazy yellowish-brown atmosphere
      this.atmosphereMat.color.setHex(0xb45309);
      baseOpacity = 0.32 + (params.airPollution - 50) * 0.005;
    } else {
      // Crisp vibrant azure
      this.atmosphereMat.color.setHex(0x38bdf8);
      baseOpacity = 0.22;
    }
    this.atmosphereMat.opacity = Math.min(0.65, Math.max(0.04, baseOpacity * densityFactor));

    // Clouds density bound to atmosphereDensity
    this.cloudsMat.opacity = Math.min(0.85, Math.max(0.15, 0.5 * densityFactor));

    // 4. Solar flare event auroral response
    if (events.solarFlare) {
      this.auroraMat.opacity = (0.65 + Math.sin(Date.now() * 0.005) * 0.2) * densityFactor;
      this.auroraRings.rotation.z += 0.8 * dt * rotSpeed;
    } else {
      this.auroraMat.opacity = 0;
    }

    // 5. Temperature & Sea Level visual reactions
    const seaScale = 1 + (params.seaLevel / 50) * 0.04;
    this.globeMesh.scale.set(seaScale, seaScale, seaScale);

    // Thermal tint response on globe
    if (params.temperature > 30) {
      this.globeMat.roughness = 0.8; // Dry cracked
    } else if (params.temperature < 0) {
      this.globeMat.roughness = 0.45; // Icy sheen
    } else {
      this.globeMat.roughness = 0.65;
    }

    // Night light intensity based on population
    this.globeMat.emissiveIntensity = 0.1 + (params.population / 100) * 0.4;
  }

  public dispose() {
    this.earthTexture.dispose();
    this.cloudsTexture.dispose();
    this.nightTexture.dispose();

    this.globeMesh.geometry.dispose();
    this.globeMat.dispose();

    this.cloudsMesh.geometry.dispose();
    this.cloudsMat.dispose();

    this.atmosphereGlowMesh.geometry.dispose();
    this.atmosphereMat.dispose();

    this.auroraRings.geometry.dispose();
    this.auroraMat.dispose();

    this.spaceStationGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}
