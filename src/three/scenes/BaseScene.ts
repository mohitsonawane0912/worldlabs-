import * as THREE from 'three';
import { SimulationParameters, DisasterEvents, ConditionScores } from '../../types/simulation';

export interface IWorldScene {
  group: THREE.Group;
  init(parentScene: THREE.Scene): void;
  update(
    dt: number,
    params: SimulationParameters,
    events: DisasterEvents,
    conditions: ConditionScores
  ): void;
  dispose(): void;
}
