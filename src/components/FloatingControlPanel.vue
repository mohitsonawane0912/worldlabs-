<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { SimulationParameters } from '../types/simulation';
import {
  GripHorizontal,
  Sun,
  Wind,
  RotateCw,
  Minus,
  Maximize2,
  X,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-vue-next';
import { audioSynth } from '../utils/audioSynth';

const props = defineProps<{
  params: SimulationParameters;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:params', val: SimulationParameters): void;
  (e: 'close'): void;
}>();

const isMinimized = ref(false);

// Draggable Position State
const posX = ref(typeof window !== 'undefined' ? Math.max(16, (window.innerWidth - 340) / 2) : 100);
const posY = ref(typeof window !== 'undefined' ? window.innerHeight - 250 : 400);
const isDragging = ref(false);
const dragOffset = ref({ x: 0, y: 0 });

function startDrag(e: MouseEvent | TouchEvent) {
  isDragging.value = true;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  dragOffset.value = {
    x: clientX - posX.value,
    y: clientY - posY.value,
  };

  window.addEventListener('mousemove', onDrag);
  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('touchmove', onDrag);
  window.addEventListener('touchend', stopDrag);
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

  const panelWidth = isMinimized.value ? 220 : 340;
  const panelHeight = isMinimized.value ? 50 : 260;

  const maxW = window.innerWidth - panelWidth - 8;
  const maxH = window.innerHeight - panelHeight - 8;

  posX.value = Math.max(8, Math.min(maxW, clientX - dragOffset.value.x));
  posY.value = Math.max(64, Math.min(maxH, clientY - dragOffset.value.y));
}

function stopDrag() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onDrag);
  window.removeEventListener('mouseup', stopDrag);
  window.removeEventListener('touchmove', onDrag);
  window.removeEventListener('touchend', stopDrag);
}

function handleParamChange(key: keyof SimulationParameters, value: number) {
  audioSynth.playSlider();
  emit('update:params', {
    ...props.params,
    [key]: value,
  });
}

function resetLiveControls() {
  audioSynth.playClick();
  emit('update:params', {
    ...props.params,
    temperature: 15,
    atmosphereDensity: 100,
    rotationSpeed: 1.0,
  });
}

function applyPreset(presetType: 'earth' | 'hyperspin' | 'thin-ice' | 'greenhouse') {
  audioSynth.playAchievement();
  if (presetType === 'earth') {
    emit('update:params', {
      ...props.params,
      temperature: 15,
      atmosphereDensity: 100,
      rotationSpeed: 1.0,
    });
  } else if (presetType === 'hyperspin') {
    emit('update:params', {
      ...props.params,
      temperature: 28,
      atmosphereDensity: 110,
      rotationSpeed: 3.5,
    });
  } else if (presetType === 'thin-ice') {
    emit('update:params', {
      ...props.params,
      temperature: -25,
      atmosphereDensity: 30,
      rotationSpeed: 0.5,
    });
  } else if (presetType === 'greenhouse') {
    emit('update:params', {
      ...props.params,
      temperature: 46,
      atmosphereDensity: 180,
      rotationSpeed: 1.5,
    });
  }
}

// Format descriptors
const temperatureBadge = computed(() => {
  const t = props.params.temperature;
  if (t < -15) return { label: 'Glacial', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' };
  if (t < 5) return { label: 'Chilly', color: 'text-blue-300 bg-blue-950/60 border-blue-800' };
  if (t <= 24) return { label: 'Temperate', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800' };
  if (t <= 38) return { label: 'Warm', color: 'text-amber-300 bg-amber-950/60 border-amber-800' };
  return { label: 'Scorching', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
});

const densityBadge = computed(() => {
  const d = props.params.atmosphereDensity ?? 100;
  if (d < 40) return { label: 'Near-Vacuum', color: 'text-purple-300 bg-purple-950/60 border-purple-800' };
  if (d < 85) return { label: 'Thin (Low-P)', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-800' };
  if (d <= 125) return { label: '1.0 atm Standard', color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800' };
  if (d <= 165) return { label: 'Dense Mantle', color: 'text-amber-300 bg-amber-950/60 border-amber-800' };
  return { label: 'Super-Dense', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
});

const rotationBadge = computed(() => {
  const r = props.params.rotationSpeed ?? 1.0;
  if (r === 0) return { label: 'Tidally Locked', color: 'text-slate-400 bg-slate-900 border-slate-800' };
  if (r < 0.6) return { label: 'Slow Drift', color: 'text-blue-300 bg-blue-950/60 border-blue-800' };
  if (r <= 1.4) return { label: '1.0x Earth Diurnal', color: 'text-cyan-300 bg-cyan-950/60 border-cyan-800' };
  if (r <= 2.5) return { label: 'Rapid Spin', color: 'text-amber-300 bg-amber-950/60 border-amber-800' };
  return { label: 'Hyper-Kinetic', color: 'text-rose-400 bg-rose-950/60 border-rose-800' };
});

onMounted(() => {
  // Center horizontally on mount
  if (typeof window !== 'undefined') {
    posX.value = Math.max(16, (window.innerWidth - 340) / 2);
    posY.value = Math.max(80, window.innerHeight - 260);
  }
});

onBeforeUnmount(() => {
  stopDrag();
});
</script>

<template>
  <div
    v-if="isOpen"
    :style="{ left: `${posX}px`, top: `${posY}px` }"
    :class="[
      'fixed z-30 select-none transition-shadow',
      isDragging ? 'cursor-grabbing shadow-2xl scale-[1.01]' : 'shadow-xl',
      isMinimized ? 'w-[220px]' : 'w-[320px] sm:w-[350px] max-w-[calc(100vw-20px)]',
    ]"
    role="region"
    aria-label="Floating 3D Parameter Inspector"
  >
    <!-- Glassmorphism Card Frame -->
    <div class="bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl text-white text-xs">
      <!-- Draggable Header -->
      <div
        @mousedown="startDrag"
        @touchstart.passive="startDrag"
        class="px-3 py-2 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border-b border-cyan-900/50 flex items-center justify-between cursor-grab active:cursor-grabbing"
      >
        <div class="flex items-center gap-1.5">
          <GripHorizontal class="w-4 h-4 text-cyan-400/80" />
          <span class="font-bold text-[11px] tracking-wider text-cyan-200 uppercase flex items-center gap-1">
            <Sliders class="w-3.5 h-3.5 text-cyan-400" />
            3D Scene Dynamics
          </span>
        </div>

        <div class="flex items-center gap-1" @mousedown.stop @touchstart.stop>
          <!-- Minimize / Maximize button -->
          <button
            type="button"
            @click="isMinimized = !isMinimized"
            class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            :title="isMinimized ? 'Expand Panel' : 'Minimize Panel'"
            :aria-label="isMinimized ? 'Expand floating inspector' : 'Minimize floating inspector'"
          >
            <component :is="isMinimized ? Maximize2 : Minus" class="w-3.5 h-3.5" />
          </button>

          <!-- Close / Hide button -->
          <button
            type="button"
            @click="emit('close')"
            class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Hide Floating Panel"
            aria-label="Close floating inspector"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Minimized State Brief -->
      <div v-if="isMinimized" class="p-2.5 flex items-center justify-between text-[10px] font-mono">
        <span class="text-amber-300 font-bold">{{ params.temperature }}°C</span>
        <span class="text-cyan-300 font-bold">{{ params.atmosphereDensity ?? 100 }}% atm</span>
        <span class="text-emerald-300 font-bold">{{ (params.rotationSpeed ?? 1.0).toFixed(1) }}x rot</span>
      </div>

      <!-- Expanded State Sliders -->
      <div v-else class="p-3.5 space-y-3.5">
        <!-- 1. TEMPERATURE SLIDER -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="floating-temperature" class="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun class="w-3.5 h-3.5 text-amber-400" />
              <span>Surface Temperature</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span :class="['text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold', temperatureBadge.color]">
                {{ temperatureBadge.label }}
              </span>
              <span class="font-mono font-bold text-amber-300 tabular-nums text-xs">
                {{ params.temperature > 0 ? `+${params.temperature}` : params.temperature }}°C
              </span>
            </div>
          </div>
          <input
            id="floating-temperature"
            type="range"
            min="-50"
            max="70"
            step="1"
            :value="params.temperature"
            @input="handleParamChange('temperature', Number(($event.target as HTMLInputElement).value))"
            class="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>-50°C Ice Melts / Freezes</span>
            <span class="text-amber-400/90">+15°C Optimal</span>
            <span>+70°C Thermal Stress</span>
          </div>
        </div>

        <!-- 2. ATMOSPHERE DENSITY SLIDER -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="floating-density" class="font-semibold text-slate-300 flex items-center gap-1.5">
              <Wind class="w-3.5 h-3.5 text-cyan-400" />
              <span>Atmosphere Density</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span :class="['text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold', densityBadge.color]">
                {{ densityBadge.label }}
              </span>
              <span class="font-mono font-bold text-cyan-300 tabular-nums text-xs">
                {{ params.atmosphereDensity ?? 100 }}%
              </span>
            </div>
          </div>
          <input
            id="floating-density"
            type="range"
            min="10"
            max="200"
            step="1"
            :value="params.atmosphereDensity ?? 100"
            @input="handleParamChange('atmosphereDensity', Number(($event.target as HTMLInputElement).value))"
            class="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>10% Thin Shell & Fog</span>
            <span class="text-cyan-400/90">100% 1.0 atm</span>
            <span>200% Thick Glow Mantle</span>
          </div>
        </div>

        <!-- 3. ROTATION SPEED SLIDER -->
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label for="floating-rotation" class="font-semibold text-slate-300 flex items-center gap-1.5">
              <RotateCw class="w-3.5 h-3.5 text-emerald-400" />
              <span>Rotation & Kinematics</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span :class="['text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold', rotationBadge.color]">
                {{ rotationBadge.label }}
              </span>
              <span class="font-mono font-bold text-emerald-300 tabular-nums text-xs">
                {{ (params.rotationSpeed ?? 1.0).toFixed(1) }}x
              </span>
            </div>
          </div>
          <input
            id="floating-rotation"
            type="range"
            min="0"
            max="4.0"
            step="0.1"
            :value="params.rotationSpeed ?? 1.0"
            @input="handleParamChange('rotationSpeed', Number(($event.target as HTMLInputElement).value))"
            class="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div class="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>0.0x Paused / Locked</span>
            <span class="text-emerald-400/90">1.0x Normal</span>
            <span>4.0x Hyper-Spin</span>
          </div>
        </div>

        <!-- 4. Quick Presets & Reset Row -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-[10px]">
          <div class="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              @click="applyPreset('earth')"
              class="px-2 py-0.8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium cursor-pointer"
              title="Standard Earth parameters"
            >
              Earth 1.0x
            </button>
            <button
              type="button"
              @click="applyPreset('hyperspin')"
              class="px-2 py-0.8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-medium cursor-pointer"
              title="Fast planetary rotation"
            >
              Hyper-Spin
            </button>
            <button
              type="button"
              @click="applyPreset('thin-ice')"
              class="px-2 py-0.8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-medium cursor-pointer"
              title="Cold and low atmospheric pressure"
            >
              Thin Ice
            </button>
          </div>

          <button
            type="button"
            @click="resetLiveControls"
            class="flex items-center gap-1 px-2 py-0.8 rounded-md bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-300 cursor-pointer font-semibold shrink-0"
            title="Reset dynamics to standard"
            aria-label="Reset live dynamics"
          >
            <RotateCcw class="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
