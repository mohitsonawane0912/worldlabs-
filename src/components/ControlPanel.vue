<script setup lang="ts">
import { ref } from 'vue';
import {
  SimulationParameters,
  DisasterEvents,
  EnergySource,
} from '../types/simulation';
import {
  Sliders,
  Flame,
  CloudRain,
  Sun,
  Zap,
  Wind,
  Shuffle,
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-vue-next';
import { audioSynth } from '../utils/audioSynth';

const props = defineProps<{
  params: SimulationParameters;
  events: DisasterEvents;
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:params', val: SimulationParameters): void;
  (e: 'update:events', val: DisasterEvents): void;
  (e: 'toggle-collapse'): void;
  (e: 'randomize'): void;
  (e: 'save-scenario'): void;
}>();

const activeTab = ref<'climate' | 'physics' | 'society' | 'events'>('climate');

function handleParamChange(key: keyof SimulationParameters, value: any) {
  audioSynth.playSlider();
  emit('update:params', {
    ...props.params,
    [key]: value,
  });
}

function handleEventToggle(key: keyof DisasterEvents) {
  audioSynth.playClick();
  emit('update:events', {
    ...props.events,
    [key]: !props.events[key],
  });
}

function handleEnergyChange(source: EnergySource) {
  audioSynth.playClick();
  emit('update:params', {
    ...props.params,
    energySource: source,
  });
}
</script>

<template>
  <aside
    v-show="!isCollapsed"
    class="absolute top-16 left-3 bottom-14 z-20 flex flex-col w-[310px] sm:w-[340px] max-w-[calc(100vw-24px)] transition-all duration-300"
    aria-label="Simulation Controls"
  >
    <!-- Glassmorphism panel container -->
    <div class="h-full flex flex-col bg-slate-950/85 backdrop-blur-md border border-cyan-950/70 rounded-2xl shadow-2xl overflow-hidden text-white text-xs select-none">
      <!-- Panel Header & Tab Switcher -->
      <div class="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Sliders class="w-4 h-4 text-cyan-400" />
          <span class="font-bold tracking-wide uppercase text-[11px] text-cyan-200">World Controls</span>
        </div>

        <button
          type="button"
          @click="emit('toggle-collapse')"
          class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Collapse control panel"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
      </div>

      <!-- Control Tabs -->
      <nav class="grid grid-cols-4 gap-1 p-2 bg-slate-900/40 border-b border-slate-800/60" aria-label="Control Categories">
        <button
          type="button"
          @click="activeTab = 'climate'"
          :class="[
            'py-1.5 px-1 rounded-lg text-center font-medium text-[11px] transition-colors cursor-pointer',
            activeTab === 'climate' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          Climate
        </button>
        <button
          type="button"
          @click="activeTab = 'physics'"
          :class="[
            'py-1.5 px-1 rounded-lg text-center font-medium text-[11px] transition-colors cursor-pointer',
            activeTab === 'physics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          Physics
        </button>
        <button
          type="button"
          @click="activeTab = 'society'"
          :class="[
            'py-1.5 px-1 rounded-lg text-center font-medium text-[11px] transition-colors cursor-pointer',
            activeTab === 'society' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          Energy
        </button>
        <button
          type="button"
          @click="activeTab = 'events'"
          :class="[
            'py-1.5 px-1 rounded-lg text-center font-medium text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1',
            activeTab === 'events' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold' : 'text-slate-400 hover:text-slate-200',
          ]"
        >
          <Flame class="w-3 h-3 text-rose-400" />
          Events
        </button>
      </nav>

      <!-- Scrollable Controls Body -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- TAB 1: CLIMATE -->
        <div v-show="activeTab === 'climate'" class="space-y-4">
          <!-- Oxygen Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-oxygen" class="font-medium text-slate-300 flex items-center gap-1.5">
                <Wind class="w-3.5 h-3.5 text-cyan-400" />
                <span>Atmospheric Oxygen</span>
              </label>
              <span class="font-mono font-bold text-cyan-300 tabular-nums">{{ params.oxygen }}%</span>
            </div>
            <input
              id="slider-oxygen"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="params.oxygen"
              @input="handleParamChange('oxygen', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% Anoxic</span>
              <span class="text-emerald-400 font-semibold">21% Earth</span>
              <span>100% Hyperoxic</span>
            </div>
          </div>

          <!-- Temperature Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-temperature" class="font-medium text-slate-300 flex items-center gap-1.5">
                <Sun class="w-3.5 h-3.5 text-amber-400" />
                <span>Surface Temperature</span>
              </label>
              <span class="font-mono font-bold text-amber-300 tabular-nums">{{ params.temperature }}°C</span>
            </div>
            <input
              id="slider-temperature"
              type="range"
              min="-50"
              max="70"
              step="1"
              :value="params.temperature"
              @input="handleParamChange('temperature', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50°C Glacial</span>
              <span class="text-cyan-400">15°C Optimal</span>
              <span class="text-rose-400">+70°C Scorching</span>
            </div>
          </div>

          <!-- Rainfall Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-rainfall" class="font-medium text-slate-300 flex items-center gap-1.5">
                <CloudRain class="w-3.5 h-3.5 text-blue-400" />
                <span>Annual Precipitation</span>
              </label>
              <span class="font-mono font-bold text-blue-300 tabular-nums">{{ params.rainfall }}%</span>
            </div>
            <input
              id="slider-rainfall"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="params.rainfall"
              @input="handleParamChange('rainfall', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-blue-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Arid 0%</span>
              <span class="text-blue-400">50% Moderate</span>
              <span>100% Monsoon</span>
            </div>
          </div>
        </div>

        <!-- TAB 2: PHYSICS & SEAS -->
        <div v-show="activeTab === 'physics'" class="space-y-4">
          <!-- Sea Level Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-sealevel" class="font-medium text-slate-300">Sea Level Relative</label>
              <span class="font-mono font-bold text-teal-300 tabular-nums">
                {{ params.seaLevel > 0 ? `+${params.seaLevel}` : params.seaLevel }} m
              </span>
            </div>
            <input
              id="slider-sealevel"
              type="range"
              min="-50"
              max="50"
              step="1"
              :value="params.seaLevel"
              @input="handleParamChange('seaLevel', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-teal-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-50m Ice Age</span>
              <span class="text-teal-400">0m Current</span>
              <span>+50m Inundation</span>
            </div>
          </div>

          <!-- Gravity Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-gravity" class="font-medium text-slate-300">Surface Gravity</label>
              <span class="font-mono font-bold text-purple-300 tabular-nums">{{ params.gravity.toFixed(1) }} m/s²</span>
            </div>
            <input
              id="slider-gravity"
              type="range"
              min="1.0"
              max="25.0"
              step="0.1"
              :value="params.gravity"
              @input="handleParamChange('gravity', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3.7 Mars</span>
              <span class="text-purple-400">9.8 Earth</span>
              <span>24.8 Jupiter</span>
            </div>
          </div>

          <!-- Air Pollution Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-pollution" class="font-medium text-slate-300">Particulate Pollution</label>
              <span class="font-mono font-bold text-orange-400 tabular-nums">{{ Math.round(params.airPollution) }}%</span>
            </div>
            <input
              id="slider-pollution"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="params.airPollution"
              @input="handleParamChange('airPollution', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-orange-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span class="text-emerald-400">0% Pristine</span>
              <span>50% Urban Smog</span>
              <span class="text-rose-400">100% Toxic</span>
            </div>
          </div>
        </div>

        <!-- TAB 3: SOCIETY & ENERGY -->
        <div v-show="activeTab === 'society'" class="space-y-4">
          <!-- Population Activity Slider -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="slider-population" class="font-medium text-slate-300">Population Density</label>
              <span class="font-mono font-bold text-indigo-300 tabular-nums">{{ params.population }}%</span>
            </div>
            <input
              id="slider-population"
              type="range"
              min="0"
              max="100"
              step="1"
              :value="params.population"
              @input="handleParamChange('population', Number(($event.target as HTMLInputElement).value))"
              class="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div class="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Sparse</span>
              <span>Moderate</span>
              <span>Hyper-Dense</span>
            </div>
          </div>

          <!-- Energy Source Selector -->
          <div class="space-y-2">
            <label class="font-medium text-slate-300 flex items-center gap-1.5">
              <Zap class="w-3.5 h-3.5 text-yellow-400" />
              <span>Primary Energy Infrastructure</span>
            </label>
            <div class="grid grid-cols-3 gap-1.5" role="group" aria-label="Energy Source">
              <button
                type="button"
                @click="handleEnergyChange('renewable')"
                :class="[
                  'py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer',
                  params.energySource === 'renewable'
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
                ]"
              >
                <div class="text-[11px]">Renewable</div>
                <div class="text-[9px] text-emerald-400/80">Clean Air</div>
              </button>

              <button
                type="button"
                @click="handleEnergyChange('mixed')"
                :class="[
                  'py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer',
                  params.energySource === 'mixed'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
                ]"
              >
                <div class="text-[11px]">Mixed</div>
                <div class="text-[9px] text-cyan-400/80">Transition</div>
              </button>

              <button
                type="button"
                @click="handleEnergyChange('fossil')"
                :class="[
                  'py-2 px-1.5 rounded-xl text-center border transition-all cursor-pointer',
                  params.energySource === 'fossil'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200',
                ]"
              >
                <div class="text-[11px]">Fossil</div>
                <div class="text-[9px] text-amber-400/80">Emissions</div>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 4: CRISIS & DISASTER EVENTS -->
        <div v-show="activeTab === 'events'" class="space-y-2">
          <p class="text-[11px] text-slate-400">Trigger localized extreme events to examine systemic resilience:</p>

          <div class="space-y-1.5">
            <button
              type="button"
              @click="handleEventToggle('drought')"
              :class="[
                'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                events.drought ? 'bg-amber-950/60 border-amber-500/70 text-amber-200 font-semibold' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50',
              ]"
            >
              <div class="flex items-center gap-2">
                <Sun class="w-4 h-4 text-amber-400" />
                <span>Prolonged Drought</span>
              </div>
              <span :class="['text-[10px] font-mono px-1.5 py-0.5 rounded', events.drought ? 'bg-amber-500/30 text-amber-300' : 'text-slate-500']">
                {{ events.drought ? 'ACTIVE' : 'OFF' }}
              </span>
            </button>

            <button
              type="button"
              @click="handleEventToggle('heavyRain')"
              :class="[
                'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                events.heavyRain ? 'bg-blue-950/60 border-blue-500/70 text-blue-200 font-semibold' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50',
              ]"
            >
              <div class="flex items-center gap-2">
                <CloudRain class="w-4 h-4 text-blue-400" />
                <span>Torrential Heavy Rain</span>
              </div>
              <span :class="['text-[10px] font-mono px-1.5 py-0.5 rounded', events.heavyRain ? 'bg-blue-500/30 text-blue-300' : 'text-slate-500']">
                {{ events.heavyRain ? 'ACTIVE' : 'OFF' }}
              </span>
            </button>

            <button
              type="button"
              @click="handleEventToggle('heatWave')"
              :class="[
                'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                events.heatWave ? 'bg-rose-950/60 border-rose-500/70 text-rose-200 font-semibold' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50',
              ]"
            >
              <div class="flex items-center gap-2">
                <Flame class="w-4 h-4 text-rose-400" />
                <span>Intense Heat Wave</span>
              </div>
              <span :class="['text-[10px] font-mono px-1.5 py-0.5 rounded', events.heatWave ? 'bg-rose-500/30 text-rose-300' : 'text-slate-500']">
                {{ events.heatWave ? 'ACTIVE' : 'OFF' }}
              </span>
            </button>

            <button
              type="button"
              @click="handleEventToggle('meteorShower')"
              :class="[
                'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                events.meteorShower ? 'bg-purple-950/60 border-purple-500/70 text-purple-200 font-semibold' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50',
              ]"
            >
              <div class="flex items-center gap-2">
                <Sparkles class="w-4 h-4 text-purple-400" />
                <span>Meteor Shower</span>
              </div>
              <span :class="['text-[10px] font-mono px-1.5 py-0.5 rounded', events.meteorShower ? 'bg-purple-500/30 text-purple-300' : 'text-slate-500']">
                {{ events.meteorShower ? 'ACTIVE' : 'OFF' }}
              </span>
            </button>

            <button
              type="button"
              @click="handleEventToggle('solarFlare')"
              :class="[
                'w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                events.solarFlare ? 'bg-yellow-950/60 border-yellow-500/70 text-yellow-200 font-semibold' : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50',
              ]"
            >
              <div class="flex items-center gap-2">
                <Zap class="w-4 h-4 text-yellow-400" />
                <span>Solar Flare Storm</span>
              </div>
              <span :class="['text-[10px] font-mono px-1.5 py-0.5 rounded', events.solarFlare ? 'bg-yellow-500/30 text-yellow-300' : 'text-slate-500']">
                {{ events.solarFlare ? 'ACTIVE' : 'OFF' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons at Bottom of Left Panel -->
      <div class="p-3 bg-slate-900/70 border-t border-slate-800 flex items-center gap-2">
        <button
          type="button"
          @click="emit('randomize')"
          class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
          aria-label="Generate random scenario parameters"
        >
          <Shuffle class="w-3.5 h-3.5 text-cyan-400" />
          <span>Randomize</span>
        </button>

        <button
          type="button"
          @click="emit('save-scenario')"
          class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-md shadow-cyan-600/20"
          aria-label="Save current scenario to browser storage"
        >
          <BookmarkPlus class="w-3.5 h-3.5" />
          <span>Save State</span>
        </button>
      </div>
    </div>
  </aside>

  <!-- Open panel button when collapsed -->
  <button
    v-if="isCollapsed"
    type="button"
    @click="emit('toggle-collapse')"
    class="absolute top-16 left-3 z-20 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-800/60 text-cyan-400 hover:text-white shadow-xl backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
    title="Expand Controls"
    aria-label="Expand Controls Panel"
  >
    <ChevronRight class="w-5 h-5" />
  </button>
</template>
