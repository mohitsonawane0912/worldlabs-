import {
  WorldSceneId,
  SimulationParameters,
  DisasterEvents,
  ConditionScores,
  SimulationLog,
  Achievement,
  PresetScenario,
} from '../types/simulation';

export const DEFAULT_PARAMS_BY_SCENE: Record<WorldSceneId, SimulationParameters> = {
  'mini-earth': {
    oxygen: 21,
    temperature: 15,
    rainfall: 50,
    seaLevel: 0,
    gravity: 9.8,
    airPollution: 18,
    population: 65,
    energySource: 'mixed',
    atmosphereDensity: 100,
    rotationSpeed: 1.0,
  },
  'forest-valley': {
    oxygen: 22,
    temperature: 18,
    rainfall: 65,
    seaLevel: 0,
    gravity: 9.8,
    airPollution: 8,
    population: 30,
    energySource: 'renewable',
    atmosphereDensity: 100,
    rotationSpeed: 1.0,
  },
  'future-city': {
    oxygen: 20,
    temperature: 22,
    rainfall: 40,
    seaLevel: 0,
    gravity: 9.8,
    airPollution: 35,
    population: 90,
    energySource: 'mixed',
    atmosphereDensity: 100,
    rotationSpeed: 1.0,
  },
  'ocean-world': {
    oxygen: 21,
    temperature: 12,
    rainfall: 70,
    seaLevel: 5,
    gravity: 10.2,
    airPollution: 12,
    population: 40,
    energySource: 'renewable',
    atmosphereDensity: 105,
    rotationSpeed: 1.0,
  },
  'mars-colony': {
    oxygen: 4,
    temperature: -55,
    rainfall: 2,
    seaLevel: -40,
    gravity: 3.7,
    airPollution: 5,
    population: 15,
    energySource: 'renewable',
    atmosphereDensity: 20,
    rotationSpeed: 1.0,
  },
};

export const INITIAL_DISASTERS: DisasterEvents = {
  drought: false,
  heavyRain: false,
  heatWave: false,
  meteorShower: false,
  solarFlare: false,
};

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'healthy-earth',
    name: 'Healthy Earth',
    sceneId: 'mini-earth',
    description: 'Equilibrium climate with stable oxygen, mild temperatures, and balanced natural cycles.',
    badge: 'Baseline Equilibrium',
    parameters: {
      oxygen: 21,
      temperature: 15,
      rainfall: 50,
      seaLevel: 0,
      gravity: 9.8,
      airPollution: 12,
      population: 60,
      energySource: 'renewable',
      atmosphereDensity: 100,
      rotationSpeed: 1.0,
    },
  },
  {
    id: 'climate-stress',
    name: 'Climate Stress',
    sceneId: 'mini-earth',
    description: 'Intense warming fueled by fossil fuels, rising sea levels, and atmospheric degradation.',
    badge: 'High Warming',
    parameters: {
      oxygen: 18,
      temperature: 36,
      rainfall: 25,
      seaLevel: 18,
      gravity: 9.8,
      airPollution: 68,
      population: 85,
      energySource: 'fossil',
      atmosphereDensity: 120,
      rotationSpeed: 1.2,
    },
    events: { heatWave: true },
  },
  {
    id: 'flooded-coast',
    name: 'Flooded Coast',
    sceneId: 'ocean-world',
    description: 'Elevated ocean thermal expansion and torrential rainfall pressuring marine and shore shelves.',
    badge: 'Extreme Ocean',
    parameters: {
      oxygen: 20,
      temperature: 24,
      rainfall: 92,
      seaLevel: 32,
      gravity: 9.8,
      airPollution: 22,
      population: 50,
      energySource: 'mixed',
      atmosphereDensity: 110,
      rotationSpeed: 1.1,
    },
    events: { heavyRain: true },
  },
  {
    id: 'clean-energy-future',
    name: 'Clean Energy Future',
    sceneId: 'future-city',
    description: 'A thriving metropolis powered 100% by renewable energy with near-zero particulate pollution.',
    badge: 'Eco-Metropolis',
    parameters: {
      oxygen: 22,
      temperature: 19,
      rainfall: 52,
      seaLevel: 0,
      gravity: 9.8,
      airPollution: 6,
      population: 88,
      energySource: 'renewable',
      atmosphereDensity: 98,
      rotationSpeed: 1.0,
    },
  },
  {
    id: 'low-oxygen-test',
    name: 'Low Oxygen Test',
    sceneId: 'forest-valley',
    description: 'Atmospheric oxygen drops to 11%, testing ecosystem resilience and bio-activity.',
    badge: 'Atmosphere Shock',
    parameters: {
      oxygen: 11,
      temperature: 14,
      rainfall: 45,
      seaLevel: 0,
      gravity: 9.8,
      airPollution: 40,
      population: 35,
      energySource: 'mixed',
      atmosphereDensity: 75,
      rotationSpeed: 0.9,
    },
  },
  {
    id: 'mars-dust-storm',
    name: 'Mars Dust Storm',
    sceneId: 'mars-colony',
    description: 'Peroxide dust storms envelop colony geodesic domes during experimental terraforming.',
    badge: 'Outer Colony',
    parameters: {
      oxygen: 6,
      temperature: -48,
      rainfall: 1,
      seaLevel: -45,
      gravity: 3.7,
      airPollution: 45,
      population: 22,
      energySource: 'renewable',
      atmosphereDensity: 25,
      rotationSpeed: 1.8,
    },
    events: { drought: true, solarFlare: true },
  },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'balanced-planet',
    title: 'Balanced Planet',
    description: 'Maintain all 6 condition scores above 75% simultaneously.',
    icon: 'Globe',
    unlocked: false,
  },
  {
    id: 'green-city',
    title: 'Green City',
    description: 'Run Future City with 100% renewable energy and pollution under 10%.',
    icon: 'Building2',
    unlocked: false,
  },
  {
    id: 'ocean-guardian',
    title: 'Ocean Guardian',
    description: 'Maintain Ocean World ecosystem health above 80% with stable waters.',
    icon: 'Waves',
    unlocked: false,
  },
  {
    id: 'mars-survivor',
    title: 'Mars Pioneer',
    description: 'Reach an energy stability and wellbeing over 70% in Mars Colony.',
    icon: 'Sparkles',
    unlocked: false,
  },
  {
    id: 'curious-scientist',
    title: 'Curious Scientist',
    description: 'Experiment with extreme parameters or activate at least 3 crisis events.',
    icon: 'FlaskConical',
    unlocked: false,
  },
  {
    id: 'time-traveler',
    title: 'Epoch Observer',
    description: 'Advance the simulation beyond 365 simulated days.',
    icon: 'Calendar',
    unlocked: false,
  },
];

/**
 * Transparent calculation of condition scores based on parameters, scene, and active events.
 * Returns normalized 0 to 100 values.
 */
export function calculateConditions(
  params: SimulationParameters,
  sceneId: WorldSceneId,
  events: DisasterEvents
): ConditionScores {
  const clamp = (val: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(val)));

  const isMars = sceneId === 'mars-colony';

  // 1. Atmosphere: Depends heavily on oxygen, pollution, atmosphereDensity, and events
  let atmosphereScore = 0;
  const density = params.atmosphereDensity ?? 100;
  if (isMars) {
    // Mars starts with low native atmosphere; terraforming brings density and oxygen up
    const marsDensityBenefit = (density / 100) * 25;
    atmosphereScore = clamp((params.oxygen / 21) * 50 + marsDensityBenefit + (100 - params.airPollution) * 0.35);
    if (events.solarFlare) atmosphereScore -= 15;
  } else {
    // Earth-like worlds: optimal oxygen ~21%, optimal density ~100%
    const oxygenDeviation = Math.abs(params.oxygen - 21);
    const oxygenHealth = Math.max(0, 100 - oxygenDeviation * 4.5);
    const densityPenalty = Math.abs(density - 100) * 0.22;
    const pollutionPenalty = params.airPollution * 0.65;
    atmosphereScore = clamp(oxygenHealth - pollutionPenalty - densityPenalty);
    if (events.solarFlare) atmosphereScore -= 10;
    if (events.meteorShower) atmosphereScore -= 8;
  }

  // 2. Water Availability: Depends on rainfall, temperature, sea level, drought
  let waterScore = 0;
  if (isMars) {
    waterScore = clamp((params.rainfall * 3) + ((params.temperature + 50) * 0.4));
  } else {
    // Normal water score: optimal rainfall is 50-70%
    const rainOptimal = 100 - Math.abs(params.rainfall - 60) * 1.2;
    const tempEvapPenalty = params.temperature > 30 ? (params.temperature - 30) * 1.8 : 0;
    waterScore = clamp(rainOptimal - tempEvapPenalty);
    if (events.drought) waterScore -= 35;
    if (events.heatWave) waterScore -= 20;
    if (events.heavyRain) waterScore = clamp(waterScore + 15, 0, 100);
  }

  // 3. Ecosystem Health: Dependent on atmosphere, water, temperature, sea level
  let ecosystemScore = 0;
  if (isMars) {
    // Mars biodome ecosystem health relies on colony systems & water
    ecosystemScore = clamp(atmosphereScore * 0.4 + waterScore * 0.4 + (params.energySource === 'renewable' ? 20 : 5));
  } else {
    const idealTemp = 16;
    const tempPenalty = Math.abs(params.temperature - idealTemp) * 1.6;
    const floodPenalty = Math.abs(params.seaLevel) > 15 ? (Math.abs(params.seaLevel) - 15) * 1.2 : 0;
    const baseEco = (atmosphereScore * 0.45) + (waterScore * 0.4) - tempPenalty - floodPenalty;
    ecosystemScore = clamp(baseEco);
    if (events.drought) ecosystemScore -= 20;
    if (events.heatWave) ecosystemScore -= 15;
  }

  // 4. Population Wellbeing: Dependent on oxygen, atmosphere, gravity comfort, pollution, ecosystem
  let wellbeingScore = 0;
  const gravityIdeal = isMars ? 3.7 : 9.8;
  const gravityStress = Math.abs(params.gravity - gravityIdeal) * 4.5;

  let oxygenSufficiency = 100;
  if (params.oxygen < 16) {
    oxygenSufficiency = Math.max(10, (params.oxygen / 16) * 70);
  } else if (params.oxygen > 35) {
    oxygenSufficiency = Math.max(40, 100 - (params.oxygen - 35) * 2);
  }

  const baseWellbeing =
    (atmosphereScore * 0.3) +
    (ecosystemScore * 0.25) +
    (oxygenSufficiency * 0.3) +
    (100 - params.airPollution) * 0.15 -
    gravityStress;

  wellbeingScore = clamp(baseWellbeing);
  if (events.heatWave) wellbeingScore -= 12;
  if (events.meteorShower) wellbeingScore -= 10;

  // 5. Energy Stability: Dependent on energy source, disasters, city demand
  let energyScore = 80;
  if (params.energySource === 'renewable') {
    energyScore = 92;
    if (events.drought) energyScore -= 5; // Hydro drops slightly
  } else if (params.energySource === 'mixed') {
    energyScore = 78;
  } else {
    // Fossil: High initial stability, but degraded by environmental backlash
    energyScore = 70 - params.airPollution * 0.15;
  }
  if (events.solarFlare) energyScore -= 28; // Geomagnetic disruption
  if (events.meteorShower) energyScore -= 15;
  energyScore = clamp(energyScore);

  // 6. Climate Balance: Aggregate balance
  let climateScore = 0;
  if (isMars) {
    climateScore = clamp((atmosphereScore + waterScore + ecosystemScore) / 3);
  } else {
    const tempDeviation = Math.abs(params.temperature - 15);
    const balance =
      100 -
      tempDeviation * 1.5 -
      params.airPollution * 0.3 -
      Math.abs(params.seaLevel) * 0.5 -
      Math.abs(params.rainfall - 50) * 0.3;
    climateScore = clamp(balance);
  }

  return {
    atmosphere: clamp(atmosphereScore),
    ecosystemHealth: clamp(ecosystemScore),
    waterAvailability: clamp(waterScore),
    populationWellbeing: clamp(wellbeingScore),
    energyStability: clamp(energyScore),
    climateBalance: clamp(climateScore),
  };
}

/**
 * Step the simulation forward by delta days.
 * Dynamically updates pollution and temperature feedbacks.
 */
export function stepSimulation(
  currentParams: SimulationParameters,
  events: DisasterEvents,
  deltaDays: number
): { nextParams: SimulationParameters; eventsTriggered: string[] } {
  const p = { ...currentParams };
  const notifications: string[] = [];

  // Feedback 1: Renewable energy gradually purifies air, Fossil adds smog
  if (p.energySource === 'renewable') {
    if (p.airPollution > 5) {
      p.airPollution = Math.max(5, p.airPollution - 0.05 * deltaDays);
    }
  } else if (p.energySource === 'fossil') {
    if (p.airPollution < 95) {
      p.airPollution = Math.min(95, p.airPollution + 0.08 * deltaDays);
    }
    // Greenhouse warming trend
    if (p.temperature < 48) {
      p.temperature = Math.min(48, p.temperature + 0.015 * deltaDays);
    }
  }

  // Feedback 2: Extreme temperature and sea level thermal expansion
  if (p.temperature > 30) {
    p.seaLevel = Math.min(45, p.seaLevel + 0.02 * deltaDays);
  } else if (p.temperature < -5 && p.seaLevel > -30) {
    // Glaciation lockup
    p.seaLevel = Math.max(-30, p.seaLevel - 0.015 * deltaDays);
  }

  // Feedback 3: Low oxygen alert check
  if (p.oxygen < 14) {
    // Very low oxygen
  }

  return {
    nextParams: p,
    eventsTriggered: notifications,
  };
}

/**
 * Generate context-aware observational insights for the player.
 */
export function generateExplanations(
  params: SimulationParameters,
  conditions: ConditionScores,
  sceneId: WorldSceneId,
  events: DisasterEvents
): SimulationLog[] {
  const logs: SimulationLog[] = [];
  const makeId = (msg: string) => msg.slice(0, 24).replace(/\s+/g, '-').toLowerCase();

  if (params.oxygen < 15) {
    logs.push({
      id: makeId('oxygen-low'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Critical: Oxygen has dropped below 15%. Atmospheric haze detected, ecosystem vitality slowing.',
    });
  } else if (params.oxygen > 30) {
    logs.push({
      id: makeId('oxygen-high'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'High oxygen saturation detected: atmospheric reactivity is elevated.',
    });
  }

  const densityVal = params.atmosphereDensity ?? 100;
  if (densityVal < 45 && sceneId !== 'mars-colony') {
    logs.push({
      id: makeId('density-low'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Thin atmosphere detected: low barometric pressure is reducing heat retention and increasing cosmic radiation.',
    });
  } else if (densityVal > 150) {
    logs.push({
      id: makeId('density-high'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'Dense atmospheric mantle: high surface pressure is amplifying greenhouse trapping and horizon diffusion.',
    });
  }

  const rotSpeed = params.rotationSpeed ?? 1.0;
  if (rotSpeed > 2.2) {
    logs.push({
      id: makeId('rotation-fast'),
      timestamp: Date.now(),
      type: 'info',
      message: 'High rotational velocity: Coriolis forces, orbital trajectories, and kinetic systems are surging.',
    });
  } else if (rotSpeed < 0.25) {
    logs.push({
      id: makeId('rotation-slow'),
      timestamp: Date.now(),
      type: 'info',
      message: 'Rotational stabilization: kinetic systems and diurnal planetary cycles have slowed to a crawl.',
    });
  }

  if (params.temperature > 35) {
    logs.push({
      id: makeId('temp-extreme-high'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Intense thermal conditions are accelerating surface evaporation and iceberg melting.',
    });
  } else if (params.temperature < -15 && sceneId !== 'mars-colony') {
    logs.push({
      id: makeId('temp-extreme-low'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'Freezing temperatures are expanding polar ice shelves and reducing liquid water availability.',
    });
  }

  if (params.seaLevel > 15) {
    logs.push({
      id: makeId('sealevel-high'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'Rising sea level is putting coastal zones and low-lying habitats under pressure.',
    });
  }

  if (params.airPollution > 60) {
    logs.push({
      id: makeId('pollution-high'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'High particulate pollution is reducing solar clarity and impacting population wellbeing.',
    });
  }

  if (events.solarFlare) {
    logs.push({
      id: makeId('solar-flare'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Solar flare in progress: geomagnetic flux is disrupting energy stability and ionosphere.',
    });
  }

  if (events.drought && params.rainfall < 30) {
    logs.push({
      id: makeId('severe-drought'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Severe drought conditions: soil moisture depleted and vegetation growth suppressed.',
    });
  }

  if (params.energySource === 'renewable' && params.airPollution < 15) {
    logs.push({
      id: makeId('clean-grid'),
      timestamp: Date.now(),
      type: 'success',
      message: 'Clean renewable grid is maintaining optimal air quality and stable climate cycles.',
    });
  }

  if (sceneId === 'mars-colony' && params.oxygen > 12) {
    logs.push({
      id: makeId('mars-terraforming'),
      timestamp: Date.now(),
      type: 'success',
      message: 'Mars terraforming benchmark: synthetic atmosphere is supporting localized biodome expansion.',
    });
  }

  // Fallback equilibrium log
  if (logs.length === 0) {
    logs.push({
      id: 'steady-state',
      timestamp: Date.now(),
      type: 'info',
      message: 'Planetary systems are operating in stable equilibrium. Adjust parameters to test chain reactions.',
    });
  }

  return logs;
}

/**
 * Check and unlock achievements.
 */
export function checkAchievements(
  currentList: Achievement[],
  conditions: ConditionScores,
  params: SimulationParameters,
  sceneId: WorldSceneId,
  daysElapsed: number,
  events: DisasterEvents
): Achievement[] {
  const activeEventCount = Object.values(events).filter(Boolean).length;

  return currentList.map((ach) => {
    if (ach.unlocked) return ach;

    let unlock = false;
    if (ach.id === 'balanced-planet') {
      unlock = Object.values(conditions).every((val) => val >= 75);
    } else if (ach.id === 'green-city') {
      unlock = sceneId === 'future-city' && params.energySource === 'renewable' && params.airPollution < 10;
    } else if (ach.id === 'ocean-guardian') {
      unlock = sceneId === 'ocean-world' && conditions.ecosystemHealth >= 80 && Math.abs(params.seaLevel) <= 5;
    } else if (ach.id === 'mars-pioneer' || ach.id === 'mars-survivor') {
      unlock = sceneId === 'mars-colony' && conditions.energyStability >= 70 && conditions.populationWellbeing >= 60;
    } else if (ach.id === 'curious-scientist') {
      unlock = activeEventCount >= 3 || params.temperature > 50 || params.oxygen < 8;
    } else if (ach.id === 'time-traveler') {
      unlock = daysElapsed >= 365;
    }

    if (unlock) {
      return {
        ...ach,
        unlocked: true,
        unlockedAt: daysElapsed,
      };
    }
    return ach;
  });
}
