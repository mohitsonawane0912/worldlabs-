import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateConditions,
  stepSimulation,
  generateExplanations,
  checkAchievements,
  DEFAULT_PARAMS_BY_SCENE,
  INITIAL_DISASTERS,
  INITIAL_ACHIEVEMENTS,
} from './simulationEngine.ts';

test('calculateConditions returns baseline high scores for healthy earth', () => {
  const earthParams = DEFAULT_PARAMS_BY_SCENE['mini-earth'];
  const conditions = calculateConditions(earthParams, 'mini-earth', INITIAL_DISASTERS);

  assert.ok(conditions.atmosphere >= 75, `Atmosphere score ${conditions.atmosphere} should be >= 75`);
  assert.ok(conditions.ecosystemHealth >= 70, `Ecosystem health ${conditions.ecosystemHealth} should be >= 70`);
  assert.ok(conditions.waterAvailability >= 70, `Water score ${conditions.waterAvailability} should be >= 70`);
  assert.ok(conditions.populationWellbeing >= 70, `Wellbeing score ${conditions.populationWellbeing} should be >= 70`);
  assert.ok(conditions.climateBalance >= 70, `Climate score ${conditions.climateBalance} should be >= 70`);
});

test('low oxygen significantly decreases atmosphere and population wellbeing', () => {
  const lowO2Params = {
    ...DEFAULT_PARAMS_BY_SCENE['mini-earth'],
    oxygen: 8, // dangerously low
  };
  const conditions = calculateConditions(lowO2Params, 'mini-earth', INITIAL_DISASTERS);

  assert.ok(conditions.atmosphere < 50, `Atmosphere should be heavily penalized (<50), was ${conditions.atmosphere}`);
  assert.ok(conditions.populationWellbeing < 50, `Wellbeing should drop (<50), was ${conditions.populationWellbeing}`);
});

test('high heat plus drought collapses water availability and ecosystem score', () => {
  const hotDroughtParams = {
    ...DEFAULT_PARAMS_BY_SCENE['mini-earth'],
    temperature: 42,
    rainfall: 10,
  };
  const events = { ...INITIAL_DISASTERS, drought: true, heatWave: true };
  const conditions = calculateConditions(hotDroughtParams, 'mini-earth', events);

  assert.ok(conditions.waterAvailability <= 30, `Water availability should be stressed (<=30), was ${conditions.waterAvailability}`);
  assert.ok(conditions.ecosystemHealth <= 40, `Ecosystem should be degraded (<=40), was ${conditions.ecosystemHealth}`);
});

test('renewable energy reduces pollution over time', () => {
  const highPollutionRenewable = {
    ...DEFAULT_PARAMS_BY_SCENE['future-city'],
    airPollution: 50,
    energySource: 'renewable' as const,
  };
  const result = stepSimulation(highPollutionRenewable, INITIAL_DISASTERS, 10);
  assert.ok(result.nextParams.airPollution < 50, 'Pollution should decrease with renewable energy');
});

test('generateExplanations produces plain-language alerts on critical parameters', () => {
  const stressedParams = {
    ...DEFAULT_PARAMS_BY_SCENE['mini-earth'],
    oxygen: 11,
    seaLevel: 25,
  };
  const conditions = calculateConditions(stressedParams, 'mini-earth', INITIAL_DISASTERS);
  const logs = generateExplanations(stressedParams, conditions, 'mini-earth', INITIAL_DISASTERS);

  const hasOxygenWarning = logs.some((l) => l.message.toLowerCase().includes('oxygen'));
  const hasSeaLevelWarning = logs.some((l) => l.message.toLowerCase().includes('sea level'));

  assert.equal(hasOxygenWarning, true, 'Should include plain-language oxygen alert');
  assert.equal(hasSeaLevelWarning, true, 'Should include sea level alert');
});

test('achievements unlock when conditions are satisfied', () => {
  const futureCityParams = {
    ...DEFAULT_PARAMS_BY_SCENE['future-city'],
    energySource: 'renewable' as const,
    airPollution: 5,
  };
  const conditions = calculateConditions(futureCityParams, 'future-city', INITIAL_DISASTERS);
  const updatedAch = checkAchievements(INITIAL_ACHIEVEMENTS, conditions, futureCityParams, 'future-city', 50, INITIAL_DISASTERS);

  const greenCity = updatedAch.find((a) => a.id === 'green-city');
  assert.equal(greenCity?.unlocked, true, 'Green City achievement should unlock');
});

test('thin atmosphere density lowers atmosphere score and triggers alert', () => {
  const thinAtmosphereParams = {
    ...DEFAULT_PARAMS_BY_SCENE['mini-earth'],
    atmosphereDensity: 25,
  };
  const conditions = calculateConditions(thinAtmosphereParams, 'mini-earth', INITIAL_DISASTERS);
  const logs = generateExplanations(thinAtmosphereParams, conditions, 'mini-earth', INITIAL_DISASTERS);

  assert.ok(conditions.atmosphere < 80, 'Atmosphere score should be penalized with thin atmosphere');
  const hasDensityWarning = logs.some((l) => l.message.toLowerCase().includes('thin atmosphere'));
  assert.equal(hasDensityWarning, true, 'Should trigger thin atmosphere alert');
});

test('high rotation speed triggers kinetic explanation', () => {
  const fastRotParams = {
    ...DEFAULT_PARAMS_BY_SCENE['mini-earth'],
    rotationSpeed: 3.0,
  };
  const conditions = calculateConditions(fastRotParams, 'mini-earth', INITIAL_DISASTERS);
  const logs = generateExplanations(fastRotParams, conditions, 'mini-earth', INITIAL_DISASTERS);

  const hasRotLog = logs.some((l) => l.message.toLowerCase().includes('rotational velocity'));
  assert.equal(hasRotLog, true, 'Should log rotational velocity effect');
});

