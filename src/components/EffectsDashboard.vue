<script setup lang="ts">
import { computed } from 'vue';
import {
  ConditionScores,
  SimulationLog,
  TimelinePoint,
} from '../types/simulation';
import {
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldAlert,
} from 'lucide-vue-next';

const props = defineProps<{
  conditions: ConditionScores;
  logs: SimulationLog[];
  history: TimelinePoint[];
  isCollapsed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-collapse'): void;
}>();

const metricList = computed(() => [
  { key: 'atmosphere', label: 'Atmosphere Purity', val: props.conditions.atmosphere, color: '#38bdf8' },
  { key: 'ecosystemHealth', label: 'Ecosystem Vitality', val: props.conditions.ecosystemHealth, color: '#34d399' },
  { key: 'waterAvailability', label: 'Water Security', val: props.conditions.waterAvailability, color: '#60a5fa' },
  { key: 'populationWellbeing', label: 'Civil Wellbeing', val: props.conditions.populationWellbeing, color: '#a78bfa' },
  { key: 'energyStability', label: 'Grid Stability', val: props.conditions.energyStability, color: '#fbbf24' },
  { key: 'climateBalance', label: 'Climate Equilibrium', val: props.conditions.climateBalance, color: '#f472b6' },
]);

function getStatusBadge(val: number) {
  if (val >= 80) return { label: 'Optimal', bg: 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300' };
  if (val >= 50) return { label: 'Moderate', bg: 'bg-cyan-950/70 border-cyan-500/40 text-cyan-300' };
  if (val >= 30) return { label: 'Stressed', bg: 'bg-amber-950/70 border-amber-500/40 text-amber-300' };
  return { label: 'Critical', bg: 'bg-rose-950/70 border-rose-500/40 text-rose-300' };
}

// Compute SVG sparkline path from history buffer
const sparklinePath = computed(() => {
  if (!props.history || props.history.length < 2) return '';
  const pts = props.history;
  const w = 280;
  const h = 50;
  const step = w / (pts.length - 1);

  return pts
    .map((p, idx) => {
      const x = idx * step;
      // Invert Y so 100 is at top (y = 4), 0 is at bottom (y = h - 4)
      const y = h - 4 - (p.climateBalance / 100) * (h - 8);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
});
</script>

<template>
  <aside
    v-show="!isCollapsed"
    class="absolute top-16 right-3 bottom-14 z-20 flex flex-col w-[300px] sm:w-[330px] max-w-[calc(100vw-24px)] transition-all duration-300"
    aria-label="Simulation Effects Dashboard"
  >
    <div class="h-full flex flex-col bg-slate-950/85 backdrop-blur-md border border-cyan-950/70 rounded-2xl shadow-2xl overflow-hidden text-white text-xs select-none">
      <!-- Header -->
      <div class="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-cyan-400" />
          <span class="font-bold tracking-wide uppercase text-[11px] text-cyan-200">Planetary Metrics</span>
        </div>

        <button
          type="button"
          @click="emit('toggle-collapse')"
          class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Collapse effects dashboard"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Main Body -->
      <div class="flex-1 overflow-y-auto p-3.5 space-y-4">
        <!-- 6 Condition Gauges -->
        <div class="space-y-2.5">
          <div
            v-for="m in metricList"
            :key="m.key"
            class="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
          >
            <div class="flex items-center justify-between">
              <span class="text-slate-300 font-medium text-[11px]">{{ m.label }}</span>
              <div class="flex items-center gap-1.5">
                <span :class="['text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border', getStatusBadge(m.val).bg]">
                  {{ getStatusBadge(m.val).label }}
                </span>
                <span class="font-mono font-bold text-white tabular-nums text-xs">{{ m.val }}%</span>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300 rounded-full"
                :style="{ width: `${m.val}%`, backgroundColor: m.color }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Sparkline Timeline Trend -->
        <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-300 font-medium">Climate Equilibrium Trend</span>
            <span class="font-mono text-[10px] text-pink-400">{{ conditions.climateBalance }}%</span>
          </div>

          <!-- SVG Sparkline -->
          <div class="w-full h-12 bg-slate-950/60 rounded-lg p-1 flex items-center justify-center">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 280 50">
              <path
                v-if="sparklinePath"
                :d="sparklinePath"
                fill="none"
                stroke="#f472b6"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line x1="0" y1="25" x2="280" y2="25" stroke="#334155" stroke-dasharray="3 3" stroke-width="0.7" />
            </svg>
          </div>
          <div class="flex justify-between text-[9px] text-slate-500 font-mono">
            <span>Past Epoch</span>
            <span>Current Realtime</span>
          </div>
        </div>

        <!-- Live Chain Reaction Feed -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
            <Sparkles class="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Environmental Reactions</span>
          </div>

          <div class="space-y-1.5">
            <div
              v-for="log in logs"
              :key="log.id"
              :class="[
                'p-2 rounded-xl border text-[11px] leading-relaxed transition-all flex items-start gap-2',
                log.type === 'alert'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : log.type === 'warning'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : log.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300',
              ]"
            >
              <AlertTriangle v-if="log.type === 'alert'" class="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <Info v-else-if="log.type === 'warning'" class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <CheckCircle2 v-else-if="log.type === 'success'" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <Info v-else class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />

              <span>{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Educational Disclaimer Footer -->
      <div class="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[10px] text-slate-400 leading-tight flex items-start gap-1.5">
        <ShieldAlert class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong class="text-slate-300 font-semibold">Simplified game model:</strong>
          Outcomes represent game heuristics for learning chain reactions, not exact scientific forecasts.
        </span>
      </div>
    </div>
  </aside>

  <!-- Open panel button when collapsed -->
  <button
    v-if="isCollapsed"
    type="button"
    @click="emit('toggle-collapse')"
    class="absolute top-16 right-3 z-20 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-800/60 text-cyan-400 hover:text-white shadow-xl backdrop-blur-md cursor-pointer transition-transform hover:scale-105"
    title="Expand Metrics"
    aria-label="Expand Metrics Dashboard"
  >
    <ChevronLeft class="w-5 h-5" />
  </button>
</template>
