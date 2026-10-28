import {
  WorldSceneId,
  SimulationParameters,
  DisasterEvents,
  ConditionScores,
  SimulationLog,
  Achievement,
  PresetScenario,
  CitizenDemographics,
  AtmospherePhysics,
} from '../types/simulation';

export const BASE_POPULATION_BY_SCENE: Record<WorldSceneId, number> = {
  'mini-earth': 8150000000, // 8.15 Billion
  'future-city': 3850000,   // 3.85 Million
  'forest-valley': 14200,   // 14.2 Thousand
  'ocean-world': 8600,      // 8.6 Thousand
  'mars-colony': 1480,      // 1.48 Thousand
};

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
 * Realistic calculation of atmospheric physics & citizen demographic responses.
 */
export function calculateConditions(
  params: SimulationParameters,
  sceneId: WorldSceneId,
  events: DisasterEvents
): ConditionScores {
  const clamp = (val: number, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(val)));
  const isMars = sceneId === 'mars-colony';

  // 1. Realistic Atmospheric Physics
  const densityMultiplier = (params.atmosphereDensity ?? 100) / 100;
  // Standard sea-level pressure is 101.3 kPa, O2 fraction is oxygen/100
  const oxygenPartialPressureKPa = parseFloat(
    ((params.oxygen / 100) * 101.3 * densityMultiplier).toFixed(1)
  );

  // AQI calculation
  let rawAqi = params.airPollution * 4.4;
  if (params.energySource === 'fossil') rawAqi += 35;
  if (params.energySource === 'renewable') rawAqi = Math.max(8, rawAqi - 20);
  if (events.drought && params.rainfall < 20) rawAqi += 40; // dust suspension
  const aqi = Math.min(500, Math.max(5, Math.round(rawAqi)));

  let aqiCategory: AtmospherePhysics['aqiCategory'] = 'Good';
  if (aqi > 300) aqiCategory = 'Hazardous';
  else if (aqi > 200) aqiCategory = 'Very Unhealthy';
  else if (aqi > 100) aqiCategory = 'Unhealthy';
  else if (aqi > 50) aqiCategory = 'Moderate';

  // Surface wetness (0 to 1) for reflections and puddles
  let surfaceWetness = Math.min(1.0, params.rainfall / 100);
  if (events.heavyRain) surfaceWetness = 1.0;
  if (events.drought) surfaceWetness = Math.max(0, surfaceWetness - 0.7);

  const fogDensityPercent = clamp(
    (params.airPollution * 0.5) + (params.rainfall * 0.3) + (densityMultiplier * 20)
  );

  const physics: AtmospherePhysics = {
    oxygenPartialPressureKPa,
    airQualityIndex: aqi,
    aqiCategory,
    fogDensityPercent,
    surfaceWetness,
    lightningActive: events.heavyRain || (params.rainfall > 80 && params.temperature > 18),
  };

  // 2. Scores: Atmosphere Purity
  let atmosphereScore = 0;
  if (isMars) {
    const marsTerraformBenefit = (densityMultiplier * 30) + (params.oxygen / 21) * 45;
    atmosphereScore = clamp(marsTerraformBenefit + (100 - params.airPollution) * 0.25);
    if (events.solarFlare) atmosphereScore -= 15;
  } else {
    // Normal human-breathable range: pO2 ~ 19 to 23 kPa (Earth sea level ~21.2 kPa)
    const pO2Deviation = Math.abs(oxygenPartialPressureKPa - 21.2);
    const pO2Score = Math.max(0, 100 - pO2Deviation * 5.5);
    const aqiPenalty = (aqi / 500) * 65;
    atmosphereScore = clamp(pO2Score - aqiPenalty);
    if (events.solarFlare) atmosphereScore -= 10;
    if (events.meteorShower) atmosphereScore -= 8;
  }

  // 3. Water Availability
  let waterScore = 0;
  if (isMars) {
    waterScore = clamp((params.rainfall * 2.8) + ((params.temperature + 50) * 0.4));
  } else {
    const rainOptimal = 100 - Math.abs(params.rainfall - 60) * 1.2;
    const tempEvapPenalty = params.temperature > 30 ? (params.temperature - 30) * 1.8 : 0;
    waterScore = clamp(rainOptimal - tempEvapPenalty);
    if (events.drought) waterScore -= 35;
    if (events.heatWave) waterScore -= 20;
    if (events.heavyRain) waterScore = clamp(waterScore + 15, 0, 100);
  }

  // 4. Ecosystem Health
  let ecosystemScore = 0;
  if (isMars) {
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

  // 5. Citizen Demographics & Physiological Wellbeing
  const gravityIdeal = isMars ? 3.7 : 9.8;
  const gravityStress = Math.abs(params.gravity - gravityIdeal) * 4.5;

  // Oxygen sufficiency: hypoxia when pO2 < 16 kPa
  let oxygenSufficiency = 100;
  if (oxygenPartialPressureKPa < 16) {
    oxygenSufficiency = Math.max(10, (oxygenPartialPressureKPa / 16) * 75);
  } else if (oxygenPartialPressureKPa > 35) {
    oxygenSufficiency = Math.max(40, 100 - (oxygenPartialPressureKPa - 35) * 2.5);
  }

  const thermalComfort = Math.max(0, 100 - Math.abs(params.temperature - 20) * 2.2);
  const baseWellbeing =
    (atmosphereScore * 0.28) +
    (oxygenSufficiency * 0.32) +
    (thermalComfort * 0.2) +
    (ecosystemScore * 0.2) -
    gravityStress;

  const wellbeingScore = clamp(baseWellbeing);

  // Demographics breakdown
  const basePop = BASE_POPULATION_BY_SCENE[sceneId] || 1000000;
  const popFactor = (params.population / 60);
  const totalCount = Math.round(basePop * popFactor);

  // Respiratory stress calculation based on AQI and oxygen
  const respiratoryStressPercent = clamp((aqi / 500) * 70 + (oxygenSufficiency < 70 ? (70 - oxygenSufficiency) * 0.8 : 0));
  const maskCompliancePercent = clamp(aqi > 100 ? (aqi - 80) * 0.9 : params.oxygen < 16 ? 90 : 15);
  const healthyPercent = clamp(wellbeingScore * 0.9 - respiratoryStressPercent * 0.3);

  let evacuationStatus: CitizenDemographics['evacuationStatus'] = 'normal';
  if (events.meteorShower || aqi > 350 || params.oxygen < 12 || Math.abs(params.seaLevel) > 35) {
    evacuationStatus = 'emergency';
  } else if (events.heatWave || events.heavyRain || aqi > 200) {
    evacuationStatus = 'mandatory';
  } else if (aqi > 120 || events.drought) {
    evacuationStatus = 'advisory';
  }

  const casualtyRatePerDay = evacuationStatus === 'emergency'
    ? Math.round((totalCount * 0.0004))
    : evacuationStatus === 'mandatory'
    ? Math.round((totalCount * 0.00008))
    : Math.round((totalCount * 0.00001));

  // Generate contextual citizen thoughts
  const activeThoughts: string[] = [];
  if (aqiCategory === 'Hazardous' || aqiCategory === 'Very Unhealthy') {
    activeThoughts.push('"The air tastes like metallic smoke. Industrial filters are burning out."');
    activeThoughts.push('"P100 respirators mandatory outdoors. Keep children and elderly inside."');
  } else if (aqiCategory === 'Good') {
    activeThoughts.push('"Brisk, clean air today! Plazas and sky-gardens are full of people."');
  }

  if (oxygenPartialPressureKPa < 14) {
    activeThoughts.push('"Atmospheric hypoxia alarm! Breathing is labored—supplemental O2 active."');
  }

  if (events.heatWave || params.temperature > 34) {
    activeThoughts.push('"Surface heat is overwhelming. Street vapor cooling systems running 24/7."');
  } else if (params.temperature < -10) {
    activeThoughts.push('"Sub-zero freezing winds. Surface transit heated lanes deployed."');
  }

  if (events.heavyRain) {
    activeThoughts.push('"Torrential rain and lightning strikes across the district! Umbrellas out."');
  }

  if (isMars) {
    if (params.oxygen > 12) {
      activeThoughts.push('"Historic moment: Dome airlocks opening for localized agricultural trials!"');
    } else {
      activeThoughts.push('"Martian atmosphere thin and toxic. Full pressurized EVA suits required."');
    }
  }

  if (activeThoughts.length === 0) {
    activeThoughts.push('"Civic systems stable. Life carrying on normally across districts."');
  }

  const demographics: CitizenDemographics = {
    totalCount,
    healthyPercent,
    respiratoryStressPercent,
    maskCompliancePercent,
    evacuationStatus,
    casualtyRatePerDay,
    activeThoughts,
  };

  // 6. Energy Stability
  let energyScore = 80;
  if (params.energySource === 'renewable') {
    energyScore = 92;
    if (events.drought) energyScore -= 5;
  } else if (params.energySource === 'mixed') {
    energyScore = 78;
  } else {
    energyScore = 70 - params.airPollution * 0.15;
  }
  if (events.solarFlare) energyScore -= 28;
  if (events.meteorShower) energyScore -= 15;
  energyScore = clamp(energyScore);

  // 7. Climate Balance
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
    demographics,
    physics,
  };
}

/**
 * Step simulation with dynamic feedback rates.
 */
export function stepSimulation(
  currentParams: SimulationParameters,
  events: DisasterEvents,
  deltaDays: number
): { nextParams: SimulationParameters; eventsTriggered: string[] } {
  const p = { ...currentParams };
  const notifications: string[] = [];

  // Feedback 1: Renewable vs Fossil on air pollution
  if (p.energySource === 'renewable') {
    if (p.airPollution > 5) {
      p.airPollution = Math.max(5, p.airPollution - 0.06 * deltaDays);
    }
  } else if (p.energySource === 'fossil') {
    if (p.airPollution < 95) {
      p.airPollution = Math.min(95, p.airPollution + 0.09 * deltaDays);
    }
    if (p.temperature < 48) {
      p.temperature = Math.min(48, p.temperature + 0.015 * deltaDays);
    }
  }

  // Feedback 2: Thermal expansion
  if (p.temperature > 30) {
    p.seaLevel = Math.min(45, p.seaLevel + 0.02 * deltaDays);
  } else if (p.temperature < -5 && p.seaLevel > -30) {
    p.seaLevel = Math.max(-30, p.seaLevel - 0.015 * deltaDays);
  }

  return {
    nextParams: p,
    eventsTriggered: notifications,
  };
}

/**
 * Contextual explanatory observations.
 */
export function generateExplanations(
  params: SimulationParameters,
  conditions: ConditionScores,
  sceneId: WorldSceneId,
  events: DisasterEvents
): SimulationLog[] {
  const logs: SimulationLog[] = [];
  const makeId = (msg: string) => msg.slice(0, 24).replace(/\s+/g, '-').toLowerCase();

  const pO2 = conditions.physics.oxygenPartialPressureKPa;
  if (pO2 < 15) {
    logs.push({
      id: makeId('oxygen-hypoxia'),
      timestamp: Date.now(),
      type: 'alert',
      message: `Critical Hypoxia: O2 partial pressure has dropped to ${pO2} kPa (normal: 21.2 kPa). Citizens suffering respiratory distress; automated oxygen dispensers triggered.`,
    });
  } else if (pO2 > 30) {
    logs.push({
      id: makeId('oxygen-hyperoxia'),
      timestamp: Date.now(),
      type: 'warning',
      message: `Hyperoxic Atmosphere: pO2 at ${pO2} kPa. Flammability risk is extremely elevated.`,
    });
  }

  if (conditions.physics.aqiCategory === 'Hazardous') {
    logs.push({
      id: makeId('aqi-hazardous'),
      timestamp: Date.now(),
      type: 'alert',
      message: `Hazardous Air Quality (AQI ${conditions.physics.airQualityIndex}): Toxic particulate smog has overwhelmed civic air filtration. ${conditions.demographics.maskCompliancePercent}% of citizens wearing respirators.`,
    });
  }

  if (params.seaLevel > 15) {
    logs.push({
      id: makeId('sealevel-high'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'Rising sea level is putting coastal zones, harbors, and low-lying habitats under pressure.',
    });
  }

  const densityVal = params.atmosphereDensity ?? 100;
  if (densityVal < 45 && sceneId !== 'mars-colony') {
    logs.push({
      id: makeId('density-low'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Thin atmosphere detected: barometric pressure is dangerously thin, accelerating hypoxia and solar radiation exposure.',
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

  if (events.heavyRain) {
    logs.push({
      id: makeId('heavy-rain'),
      timestamp: Date.now(),
      type: 'warning',
      message: 'Severe Stormfront: Heavy rain, lightning flashes, and localized waterlogging detected across districts.',
    });
  }

  if (events.solarFlare) {
    logs.push({
      id: makeId('solar-flare'),
      timestamp: Date.now(),
      type: 'alert',
      message: 'Solar Flare Storm: High-energy magnetic radiation causing grid brownouts and ionospheric auroras.',
    });
  }

  if (params.energySource === 'renewable' && conditions.physics.airQualityIndex < 40) {
    logs.push({
      id: makeId('clean-grid'),
      timestamp: Date.now(),
      type: 'success',
      message: `Zero-Emission Equilibrium: Clean renewable grid has lowered AQI to ${conditions.physics.airQualityIndex}. Population health at peak vitality.`,
    });
  }

  if (logs.length === 0) {
    logs.push({
      id: 'steady-state',
      timestamp: Date.now(),
      type: 'info',
      message: `District Equilibrium: ${conditions.demographics.totalCount.toLocaleString()} citizens operating under stable climate conditions.`,
    });
  }

  return logs;
}

/**
 * Check achievements.
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
      unlock = conditions.atmosphere >= 75 && conditions.ecosystemHealth >= 75 && conditions.populationWellbeing >= 75;
    } else if (ach.id === 'green-city') {
      unlock = sceneId === 'future-city' && params.energySource === 'renewable' && params.airPollution < 10;
    } else if (ach.id === 'ocean-guardian') {
      unlock = sceneId === 'ocean-world' && conditions.ecosystemHealth >= 80 && Math.abs(params.seaLevel) <= 5;
    } else if (ach.id === 'mars-survivor') {
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
