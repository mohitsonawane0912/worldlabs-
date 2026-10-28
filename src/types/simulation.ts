export type WorldSceneId =
  | 'mini-earth'
  | 'forest-valley'
  | 'future-city'
  | 'ocean-world'
  | 'mars-colony';

export type EnergySource = 'renewable' | 'mixed' | 'fossil';

export type SimulationSpeed = 0 | 1 | 5 | 20;

export interface SimulationParameters {
  oxygen: number; // Percentage: 0 to 100 (Default: 21)
  temperature: number; // Celsius: -50 to +70 (Default: 15)
  rainfall: number; // Percentage/Index: 0 to 100 (Default: 50)
  seaLevel: number; // Meters: -50 to +50 (Default: 0)
  gravity: number; // m/s²: 1.0 to 25.0 (Earth: 9.8)
  airPollution: number; // Percentage: 0 to 100 (Default: 15)
  population: number; // Relative scale: 0 to 100 (Default: 60)
  energySource: EnergySource;
  atmosphereDensity: number; // Percentage: 10 to 200 (Default: 100)
  rotationSpeed: number; // Multiplier: 0.0 to 4.0 (Default: 1.0)
}

export interface DisasterEvents {
  drought: boolean;
  heavyRain: boolean;
  heatWave: boolean;
  meteorShower: boolean;
  solarFlare: boolean;
}

export interface ConditionScores {
  atmosphere: number; // 0 - 100
  ecosystemHealth: number; // 0 - 100
  waterAvailability: number; // 0 - 100
  populationWellbeing: number; // 0 - 100
  energyStability: number; // 0 - 100
  climateBalance: number; // 0 - 100
}

export interface SimulationLog {
  id: string;
  timestamp: number; // simulated day
  type: 'info' | 'warning' | 'alert' | 'success';
  message: string;
}

export interface TimelinePoint {
  day: number;
  atmosphere: number;
  ecosystemHealth: number;
  temperature: number;
  climateBalance: number;
  wellbeing: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface PresetScenario {
  id: string;
  name: string;
  sceneId: WorldSceneId;
  description: string;
  badge: string;
  parameters: SimulationParameters;
  events?: Partial<Disasters>;
}

export interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  sceneId: WorldSceneId;
  parameters: SimulationParameters;
  events: DisasterEvents;
}

export type Disasters = DisasterEvents;
