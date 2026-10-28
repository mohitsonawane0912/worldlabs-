<script setup lang="ts">
import { computed } from 'vue';
import {
  WorldSceneId,
  SimulationSpeed,
} from '../types/simulation';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  Award,
  HelpCircle,
  Eye,
  EyeOff,
  Globe,
  Trees,
  Building2,
  Waves,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-vue-next';

const props = defineProps<{
  currentScene: WorldSceneId;
  speed: SimulationSpeed;
  isMuted: boolean;
  isHudVisible: boolean;
  isFloatingOpen: boolean;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
}>();

const emit = defineEmits<{
  (e: 'change-scene', scene: WorldSceneId): void;
  (e: 'change-speed', speed: SimulationSpeed): void;
  (e: 'reset-simulation'): void;
  (e: 'toggle-mute'): void;
  (e: 'toggle-hud'): void;
  (e: 'toggle-floating'): void;
  (e: 'open-scenarios'): void;
  (e: 'open-achievements'): void;
  (e: 'open-help'): void;
}>();

const scenes = [
  { id: 'mini-earth' as const, name: 'Mini Earth', icon: Globe },
  { id: 'forest-valley' as const, name: 'Forest Valley', icon: Trees },
  { id: 'future-city' as const, name: 'Future City', icon: Building2 },
  { id: 'ocean-world' as const, name: 'Ocean World', icon: Waves },
  { id: 'mars-colony' as const, name: 'Mars Colony', icon: Sparkles },
];

const speeds: { val: SimulationSpeed; label: string }[] = [
  { val: 0, label: 'Pause' },
  { val: 1, label: '1x' },
  { val: 5, label: '5x' },
  { val: 20, label: '20x' },
];
</script>

<template>
  <header
    class="w-full h-14 bg-slate-950/85 backdrop-blur-md border-b border-cyan-950/60 px-3 md:px-5 flex items-center justify-between z-30 select-none text-white text-sm"
    role="banner"
  >
    <!-- Left: Brand lockup -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
          <div class="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center font-black text-cyan-400 text-xs">
            WL
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-bold tracking-wider text-base bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              WORLD LAB
            </h1>
            <span class="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
              3D Sandbox
            </span>
          </div>
        </div>
      </div>

      <!-- Scene selector pills -->
      <nav class="hidden lg:flex items-center gap-1 ml-4 bg-slate-900/80 p-1 rounded-xl border border-slate-800" aria-label="World Scenes">
        <button
          v-for="s in scenes"
          :key="s.id"
          type="button"
          @click="emit('change-scene', s.id)"
          :class="[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer',
            currentScene === s.id
              ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60',
          ]"
          :aria-current="currentScene === s.id ? 'page' : undefined"
        >
          <component :is="s.icon" class="w-3.5 h-3.5" />
          <span>{{ s.name }}</span>
        </button>
      </nav>
    </div>

    <!-- Center / Scene Dropdown on Mobile -->
    <div class="lg:hidden">
      <select
        :value="currentScene"
        @change="emit('change-scene', ($event.target as HTMLSelectElement).value as WorldSceneId)"
        class="bg-slate-900 text-cyan-300 text-xs font-medium rounded-lg px-2.5 py-1.5 border border-cyan-800/60 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        aria-label="Select World Scene"
      >
        <option v-for="s in scenes" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
    </div>

    <!-- Right Controls: Speed, Reset, Audio, Library, Achievements, Help -->
    <div class="flex items-center gap-1.5 sm:gap-2">
      <!-- Speed selector -->
      <div class="flex items-center bg-slate-900/90 rounded-lg p-0.5 border border-slate-800" role="group" aria-label="Simulation Speed">
        <button
          v-for="sp in speeds"
          :key="sp.val"
          type="button"
          @click="emit('change-speed', sp.val)"
          :class="[
            'px-2 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer',
            speed === sp.val
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40',
          ]"
          :aria-label="`Set speed to ${sp.label}`"
        >
          <component :is="sp.val === 0 ? Pause : Play" v-if="sp.val === 0 || sp.val === 1" class="w-3 h-3 inline mr-0.5" />
          {{ sp.label }}
        </button>
      </div>

      <!-- Reset button -->
      <button
        type="button"
        @click="emit('reset-simulation')"
        class="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        title="Reset simulation parameters (R)"
        aria-label="Reset simulation"
      >
        <RotateCcw class="w-4 h-4" />
      </button>

      <!-- Floating 3D Dynamics Inspector Toggle -->
      <button
        type="button"
        @click="emit('toggle-floating')"
        :class="[
          'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer',
          isFloatingOpen
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-sm shadow-cyan-500/20'
            : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white',
        ]"
        title="Toggle Floating 3D Dynamics Inspector"
        aria-label="Toggle Floating 3D Dynamics Inspector"
      >
        <SlidersHorizontal class="w-3.5 h-3.5 text-cyan-400" />
        <span class="hidden sm:inline">3D Dynamics</span>
      </button>

      <!-- Scenario Library Modal Toggle -->
      <button
        type="button"
        @click="emit('open-scenarios')"
        class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/40 text-cyan-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        aria-label="Open Preset Scenario Library"
      >
        <BookOpen class="w-3.5 h-3.5 text-cyan-400" />
        <span class="hidden sm:inline">Scenarios</span>
      </button>

      <!-- Achievements button with badge -->
      <button
        type="button"
        @click="emit('open-achievements')"
        class="relative flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        aria-label="View Achievements"
      >
        <Award class="w-3.5 h-3.5 text-amber-400" />
        <span class="hidden md:inline">Badges</span>
        <span class="ml-1 text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-1 py-0.2 rounded border border-amber-500/40">
          {{ unlockedAchievementsCount }}/{{ totalAchievementsCount }}
        </span>
      </button>

      <!-- Sound Mute Toggle -->
      <button
        type="button"
        @click="emit('toggle-mute')"
        :class="[
          'p-2 rounded-lg border transition-colors cursor-pointer',
          isMuted
            ? 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            : 'bg-cyan-950/40 border-cyan-800/40 text-cyan-300 hover:text-cyan-100',
        ]"
        :title="isMuted ? 'Unmute Audio' : 'Mute Audio'"
        :aria-label="isMuted ? 'Unmute procedural audio' : 'Mute procedural audio'"
      >
        <component :is="isMuted ? VolumeX : Volume2" class="w-4 h-4" />
      </button>

      <!-- HUD Toggle (Cinema / Zen Mode) -->
      <button
        type="button"
        @click="emit('toggle-hud')"
        class="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        :title="isHudVisible ? 'Hide HUD (H)' : 'Show HUD (H)'"
        :aria-label="isHudVisible ? 'Hide HUD' : 'Show HUD'"
      >
        <component :is="isHudVisible ? Eye : EyeOff" class="w-4 h-4" />
      </button>

      <!-- Help Modal Toggle -->
      <button
        type="button"
        @click="emit('open-help')"
        class="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        title="Simulation Help and Guide (?)"
        aria-label="Open simulation help"
      >
        <HelpCircle class="w-4 h-4" />
      </button>
    </div>
  </header>
</template>
