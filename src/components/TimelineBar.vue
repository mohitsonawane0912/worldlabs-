<script setup lang="ts">
import { computed } from 'vue';
import { SimulationSpeed } from '../types/simulation';
import { Calendar, Clock, Gauge } from 'lucide-vue-next';

const props = defineProps<{
  daysElapsed: number;
  speed: SimulationSpeed;
}>();

// Convert days to years, months, days
const timeFormatted = computed(() => {
  const totalDays = Math.floor(props.daysElapsed);
  const years = Math.floor(totalDays / 365);
  const remainingDays = totalDays % 365;
  const months = Math.floor(remainingDays / 30);
  const days = remainingDays % 30;

  return {
    years,
    months,
    days,
    epochLabel: years === 0 ? 'Initial Epoch' : `Year ${years + 1} Horizon`,
  };
});
</script>

<template>
  <footer
    class="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[800px] h-11 bg-slate-950/85 backdrop-blur-md border border-cyan-950/70 rounded-xl px-4 flex items-center justify-between shadow-2xl text-white text-xs select-none"
    role="contentinfo"
    aria-label="Simulation Timeline"
  >
    <!-- Left: Timeline Clock & Days -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5 text-cyan-300 font-medium">
        <Clock class="w-3.5 h-3.5 text-cyan-400" />
        <span class="font-mono tabular-nums font-bold text-sm">{{ Math.floor(daysElapsed) }}</span>
        <span class="text-slate-400 text-[11px]">simulated days</span>
      </div>

      <div class="hidden sm:flex items-center gap-1 text-slate-400 text-[11px] font-mono border-l border-slate-800 pl-3">
        <Calendar class="w-3 h-3 text-slate-500" />
        <span>{{ timeFormatted.years }}y</span>
        <span>{{ timeFormatted.months }}m</span>
        <span>{{ timeFormatted.days }}d</span>
      </div>
    </div>

    <!-- Center: Timeline progress scrubber visual -->
    <div class="hidden md:flex flex-1 max-w-[280px] mx-4 items-center gap-2">
      <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
          :style="{ width: `${(daysElapsed % 365) / 3.65}%` }"
        ></div>
      </div>
      <span class="text-[9px] font-mono text-slate-500 shrink-0">Cycle</span>
    </div>

    <!-- Right: Epoch & Playback status indicator -->
    <div class="flex items-center gap-2">
      <span class="text-[10px] text-slate-400 hidden sm:inline">{{ timeFormatted.epochLabel }}</span>
      <div class="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono">
        <span
          :class="[
            'w-2 h-2 rounded-full',
            speed === 0 ? 'bg-amber-400' : 'bg-emerald-400',
          ]"
        ></span>
        <span class="text-slate-300 font-semibold">{{ speed === 0 ? 'PAUSED' : `${speed}x RUNNING` }}</span>
      </div>
    </div>
  </footer>
</template>
