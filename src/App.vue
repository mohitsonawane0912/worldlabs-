<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  WorldSceneId,
  SimulationParameters,
  DisasterEvents,
  ConditionScores,
  SimulationSpeed,
  TimelinePoint,
  Achievement,
  PresetScenario,
  SavedScenario,
} from './types/simulation';
import {
  DEFAULT_PARAMS_BY_SCENE,
  INITIAL_DISASTERS,
  INITIAL_ACHIEVEMENTS,
  calculateConditions,
  stepSimulation,
  generateExplanations,
  checkAchievements,
  PRESET_SCENARIOS,
} from './engine/simulationEngine';
import { audioSynth } from './utils/audioSynth';

import TopBar from './components/TopBar.vue';
import SimulationCanvas from './components/SimulationCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';
import EffectsDashboard from './components/EffectsDashboard.vue';
import TimelineBar from './components/TimelineBar.vue';
import ScenarioLibraryModal from './components/ScenarioLibraryModal.vue';
import AchievementsModal from './components/AchievementsModal.vue';
import HelpModal from './components/HelpModal.vue';
import FloatingControlPanel from './components/FloatingControlPanel.vue';

// 1. Core State
const currentScene = ref<WorldSceneId>('mini-earth');
const params = ref<SimulationParameters>({ ...DEFAULT_PARAMS_BY_SCENE['mini-earth'] });
const events = ref<DisasterEvents>({ ...INITIAL_DISASTERS });
const speed = ref<SimulationSpeed>(1);
const daysElapsed = ref<number>(0);

// UI & Layout Visibility
const isHudVisible = ref<boolean>(true);
const isFloatingOpen = ref<boolean>(true);
const isMobile = ref<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
const isLeftCollapsed = ref<boolean>(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
const isRightCollapsed = ref<boolean>(true);
const isMuted = ref<boolean>(audioSynth.isMuted);

function toggleFloating() {
  audioSynth.playClick();
  isFloatingOpen.value = !isFloatingOpen.value;
}

function toggleLeftPanel() {
  audioSynth.playClick();
  isLeftCollapsed.value = !isLeftCollapsed.value;
  if (!isLeftCollapsed.value && isMobile.value) {
    isRightCollapsed.value = true;
  }
}

function toggleRightPanel() {
  audioSynth.playClick();
  isRightCollapsed.value = !isRightCollapsed.value;
  if (!isRightCollapsed.value && isMobile.value) {
    isLeftCollapsed.value = true;
  }
}

// Modals
const isScenariosOpen = ref<boolean>(false);
const isAchievementsOpen = ref<boolean>(false);
const isHelpOpen = ref<boolean>(false);

// Achievements
const achievements = ref<Achievement[]>([...INITIAL_ACHIEVEMENTS]);

// History Buffer for sparkline (last 30 samples)
const history = ref<TimelinePoint[]>([]);

// Toast banner for achievements / major events
const toastNotification = ref<string | null>(null);
let toastTimer: number = 0;

function showToast(msg: string) {
  toastNotification.value = msg;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastNotification.value = null;
  }, 4500);
}

// 2. Computed Conditions & Explanations
const conditions = computed<ConditionScores>(() => {
  return calculateConditions(params.value, currentScene.value, events.value);
});

const explanations = computed(() => {
  return generateExplanations(params.value, conditions.value, currentScene.value, events.value);
});

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length);

// 3. Simulation Loop
let lastTime = performance.now();
let simFrameId = 0;

function simLoop() {
  const now = performance.now();
  const dtReal = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (speed.value > 0) {
    // 1 real second = speed.value simulated days
    const deltaDays = dtReal * speed.value;
    daysElapsed.value += deltaDays;

    // Apply continuous feedbacks (pollution decay with renewables, warming with fossils)
    const { nextParams } = stepSimulation(params.value, events.value, deltaDays);
    params.value = nextParams;

    // Record history snapshot every ~5 simulated days
    const currentDayInt = Math.floor(daysElapsed.value);
    const lastRecordedDay = history.value.length > 0 ? history.value[history.value.length - 1].day : -1;
    if (currentDayInt - lastRecordedDay >= 5) {
      history.value.push({
        day: currentDayInt,
        atmosphere: conditions.value.atmosphere,
        ecosystemHealth: conditions.value.ecosystemHealth,
        temperature: params.value.temperature,
        climateBalance: conditions.value.climateBalance,
        wellbeing: conditions.value.populationWellbeing,
      });
      if (history.value.length > 30) {
        history.value.shift();
      }
    }

    // Check achievement triggers
    const updatedAch = checkAchievements(
      achievements.value,
      conditions.value,
      params.value,
      currentScene.value,
      daysElapsed.value,
      events.value
    );

    // Trigger toast if a new achievement unlocked
    updatedAch.forEach((ach, idx) => {
      if (ach.unlocked && !achievements.value[idx].unlocked) {
        showToast(`🏆 Achievement Unlocked: ${ach.title}!`);
        audioSynth.playAchievement();
      }
    });
    achievements.value = updatedAch;
  }

  simFrameId = requestAnimationFrame(simLoop);
}

// 4. Actions
function handleChangeScene(sceneId: WorldSceneId) {
  audioSynth.playClick();
  currentScene.value = sceneId;
  params.value = { ...DEFAULT_PARAMS_BY_SCENE[sceneId] };
  events.value = { ...INITIAL_DISASTERS };
}

function handleSpeedChange(newSpeed: SimulationSpeed) {
  audioSynth.playClick();
  speed.value = newSpeed;
}

function handleResetSimulation() {
  audioSynth.playClick();
  params.value = { ...DEFAULT_PARAMS_BY_SCENE[currentScene.value] };
  events.value = { ...INITIAL_DISASTERS };
  daysElapsed.value = 0;
  history.value = [];
  showToast('Simulation parameters reset to initial equilibrium.');
}

function handleToggleMute() {
  isMuted.value = audioSynth.toggleMute();
}

function handleToggleHud() {
  audioSynth.playClick();
  isHudVisible.value = !isHudVisible.value;
}

function handleRandomizeScenario() {
  audioSynth.playAchievement();
  params.value = {
    oxygen: Math.floor(Math.random() * 35) + 5,
    temperature: Math.floor(Math.random() * 90) - 30,
    rainfall: Math.floor(Math.random() * 100),
    seaLevel: Math.floor(Math.random() * 80) - 40,
    gravity: parseFloat((Math.random() * 18 + 2).toFixed(1)),
    airPollution: Math.floor(Math.random() * 85),
    population: Math.floor(Math.random() * 95) + 5,
    energySource: (['renewable', 'mixed', 'fossil'] as const)[Math.floor(Math.random() * 3)],
  };
  events.value = {
    drought: Math.random() < 0.25,
    heavyRain: Math.random() < 0.25,
    heatWave: Math.random() < 0.25,
    meteorShower: Math.random() < 0.2,
    solarFlare: Math.random() < 0.2,
  };
  showToast('🎲 Randomized parameters applied! Observe the systemic reaction.');
}

function handleLoadPreset(preset: PresetScenario) {
  audioSynth.playClick();
  currentScene.value = preset.sceneId;
  params.value = { ...preset.parameters };
  events.value = {
    ...INITIAL_DISASTERS,
    ...(preset.events || {}),
  };
  daysElapsed.value = 0;
  history.value = [];
  isScenariosOpen.value = false;
  showToast(`Launched preset: ${preset.name}`);
}

function handleLoadSaved(saved: SavedScenario) {
  audioSynth.playClick();
  currentScene.value = saved.sceneId;
  params.value = { ...saved.parameters };
  events.value = { ...saved.events };
  daysElapsed.value = 0;
  history.value = [];
  isScenariosOpen.value = false;
  showToast(`Loaded saved state: ${saved.name}`);
}

// 5. Global Keyboard Shortcuts
function handleKeyDown(e: KeyboardEvent) {
  if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

  if (e.code === 'Space') {
    e.preventDefault();
    speed.value = speed.value === 0 ? 1 : 0;
    audioSynth.playClick();
  } else if (e.key === '1') {
    speed.value = 0;
  } else if (e.key === '2') {
    speed.value = 1;
  } else if (e.key === '3') {
    speed.value = 5;
  } else if (e.key === '4') {
    speed.value = 20;
  } else if (e.key.toLowerCase() === 'h') {
    handleToggleHud();
  } else if (e.key.toLowerCase() === 'd') {
    toggleFloating();
  } else if (e.key.toLowerCase() === 'r') {
    handleResetSimulation();
  } else if (e.key.toLowerCase() === 'm') {
    handleToggleMute();
  } else if (e.key === '?') {
    isHelpOpen.value = true;
  }
}

function handleWindowResize() {
  const mobile = window.innerWidth < 768;
  isMobile.value = mobile;
  if (mobile) {
    isLeftCollapsed.value = true;
    isRightCollapsed.value = true;
  }
}

onMounted(() => {
  handleWindowResize();
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleWindowResize);
  lastTime = performance.now();
  simFrameId = requestAnimationFrame(simLoop);

  // Initialize initial history sample
  history.value.push({
    day: 0,
    atmosphere: conditions.value.atmosphere,
    ecosystemHealth: conditions.value.ecosystemHealth,
    temperature: params.value.temperature,
    climateBalance: conditions.value.climateBalance,
    wellbeing: conditions.value.populationWellbeing,
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleWindowResize);
  cancelAnimationFrame(simFrameId);
  window.clearTimeout(toastTimer);
});
</script>

<template>
  <div class="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans flex flex-col select-none">
    <!-- Top Navigation Bar -->
    <TopBar
      :current-scene="currentScene"
      :speed="speed"
      :is-muted="isMuted"
      :is-hud-visible="isHudVisible"
      :is-floating-open="isFloatingOpen"
      :unlocked-achievements-count="unlockedCount"
      :total-achievements-count="achievements.length"
      @change-scene="handleChangeScene"
      @change-speed="handleSpeedChange"
      @reset-simulation="handleResetSimulation"
      @toggle-mute="handleToggleMute"
      @toggle-hud="handleToggleHud"
      @toggle-floating="toggleFloating"
      @open-scenarios="isScenariosOpen = true"
      @open-achievements="isAchievementsOpen = true"
      @open-help="isHelpOpen = true"
    />

    <!-- Main Viewport Area -->
    <main class="relative flex-1 w-full h-full overflow-hidden" role="main">
      <!-- 3D Three.js Simulation Canvas -->
      <SimulationCanvas
        :scene-id="currentScene"
        :params="params"
        :events="events"
        :conditions="conditions"
        :speed="speed"
      />

      <!-- Floating 3D Parameter Inspector Panel (Temperature, Atmosphere Density, Rotation Speed) -->
      <FloatingControlPanel
        :is-open="isFloatingOpen && isHudVisible"
        :params="params"
        @update:params="params = $event"
        @close="isFloatingOpen = false"
      />

      <!-- Left Controls Panel -->
      <ControlPanel
        v-if="isHudVisible"
        :params="params"
        :events="events"
        :is-collapsed="isLeftCollapsed"
        @update:params="params = $event"
        @update:events="events = $event"
        @toggle-collapse="toggleLeftPanel"
        @randomize="handleRandomizeScenario"
        @save-scenario="isScenariosOpen = true"
      />

      <!-- Right Effects Dashboard -->
      <EffectsDashboard
        v-if="isHudVisible"
        :conditions="conditions"
        :logs="explanations"
        :history="history"
        :is-collapsed="isRightCollapsed"
        @toggle-collapse="toggleRightPanel"
      />

      <!-- Bottom Timeline Bar -->
      <TimelineBar
        v-if="isHudVisible"
        :days-elapsed="daysElapsed"
        :speed="speed"
      />

      <!-- Toast Notification Badge -->
      <div
        v-if="toastNotification"
        class="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/60 text-cyan-200 text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2"
        role="status"
        aria-live="polite"
      >
        <span>{{ toastNotification }}</span>
      </div>
    </main>

    <!-- Modals -->
    <ScenarioLibraryModal
      :is-open="isScenariosOpen"
      :current-params="params"
      :current-events="events"
      :current-scene-id="currentScene"
      @close="isScenariosOpen = false"
      @load-preset="handleLoadPreset"
      @load-saved="handleLoadSaved"
    />

    <AchievementsModal
      :is-open="isAchievementsOpen"
      :achievements="achievements"
      @close="isAchievementsOpen = false"
    />

    <HelpModal
      :is-open="isHelpOpen"
      @close="isHelpOpen = false"
    />
  </div>
</template>
