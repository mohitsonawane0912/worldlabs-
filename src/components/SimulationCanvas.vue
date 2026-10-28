<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import {
  WorldSceneId,
  SimulationParameters,
  DisasterEvents,
  ConditionScores,
  SimulationSpeed,
} from '../types/simulation';
import { SceneManager } from '../three/SceneManager';
import { Flame, Sun, CloudRain, Sparkles, Zap } from 'lucide-vue-next';

const props = defineProps<{
  sceneId: WorldSceneId;
  params: SimulationParameters;
  events: DisasterEvents;
  conditions: ConditionScores;
  speed: SimulationSpeed;
}>();

const canvasMount = ref<HTMLDivElement | null>(null);
let sceneManager: SceneManager | null = null;
let animFrameId = 0;
let lastTickTime = performance.now();

onMounted(() => {
  if (canvasMount.value) {
    sceneManager = new SceneManager(canvasMount.value);

    // Run simulation tick loop linked to simulation speed
    const tickSimulation = () => {
      const now = performance.now();
      const dtReal = Math.min((now - lastTickTime) / 1000, 0.05);
      lastTickTime = now;

      if (sceneManager) {
        // Step Three.js scene models
        sceneManager.stepScene(dtReal, props.params, props.events, props.conditions);
      }

      animFrameId = requestAnimationFrame(tickSimulation);
    };

    lastTickTime = performance.now();
    animFrameId = requestAnimationFrame(tickSimulation);
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrameId);
  if (sceneManager) {
    sceneManager.dispose();
    sceneManager = null;
  }
});

// Watch for scene change
watch(
  () => props.sceneId,
  (newScene) => {
    if (sceneManager) {
      sceneManager.loadScene(newScene);
    }
  }
);

// Watch for parameter updates to adjust Three.js atmospheric lighting & fog
watch(
  () => [props.params, props.events, props.conditions],
  () => {
    if (sceneManager) {
      sceneManager.updateSimulationState(props.params, props.events, props.conditions);
    }
  },
  { deep: true }
);

function getSceneTitle(id: WorldSceneId) {
  switch (id) {
    case 'mini-earth': return 'Mini Earth Planetary System';
    case 'forest-valley': return 'Forest River Ecosystem';
    case 'future-city': return 'Metropolis Cyber-Grid';
    case 'ocean-world': return 'Oceanic Coral & Ice World';
    case 'mars-colony': return 'Martian Terraforming Outpost';
  }
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-slate-950" data-testid="simulation-canvas-container">
    <!-- WebGL Canvas Container -->
    <div ref="canvasMount" class="w-full h-full cursor-grab active:cursor-grabbing select-none" />

    <!-- Top Left Low-Occlusion World Spec Badge -->
    <div class="absolute top-3 left-3 sm:left-4 z-10 pointer-events-none flex flex-col gap-1 select-none">
      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm font-bold text-white tracking-wide drop-shadow-md">
          {{ getSceneTitle(sceneId) }}
        </span>
        <span class="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 backdrop-blur-sm">
          Interactive 3D
        </span>
      </div>
      <span class="text-[10px] text-slate-400 font-medium">
        Drag to orbit · Scroll to zoom
      </span>
    </div>

    <!-- Active Crisis Overlay Badges -->
    <div class="absolute top-3 right-3 sm:right-4 z-10 pointer-events-none flex flex-wrap gap-1.5 max-w-[280px] justify-end select-none">
      <div
        v-if="events.drought"
        class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/80 border border-amber-500/60 text-amber-200 text-[10px] font-semibold backdrop-blur-sm shadow"
      >
        <Sun class="w-3 h-3 text-amber-400" />
        <span>Drought Alert</span>
      </div>

      <div
        v-if="events.heavyRain"
        class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/60 text-blue-200 text-[10px] font-semibold backdrop-blur-sm shadow"
      >
        <CloudRain class="w-3 h-3 text-blue-400" />
        <span>Heavy Rainfall</span>
      </div>

      <div
        v-if="events.heatWave"
        class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500/60 text-rose-200 text-[10px] font-semibold backdrop-blur-sm shadow"
      >
        <Flame class="w-3 h-3 text-rose-400" />
        <span>Heat Wave</span>
      </div>

      <div
        v-if="events.meteorShower"
        class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-950/80 border border-purple-500/60 text-purple-200 text-[10px] font-semibold backdrop-blur-sm shadow"
      >
        <Sparkles class="w-3 h-3 text-purple-400" />
        <span>Meteor Shower</span>
      </div>

      <div
        v-if="events.solarFlare"
        class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-950/80 border border-yellow-500/60 text-yellow-200 text-[10px] font-semibold backdrop-blur-sm shadow"
      >
        <Zap class="w-3 h-3 text-yellow-400" />
        <span>Solar Flare</span>
      </div>
    </div>
  </div>
</template>
