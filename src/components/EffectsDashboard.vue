<script setup lang="ts">
import { ref, computed } from 'vue';
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
  Users,
  Wind,
  ShieldAlert,
  HeartPulse,
  CloudRain,
  Zap,
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

type DashboardTab = 'civilians' | 'physics' | 'metrics';
const activeTab = ref<DashboardTab>('civilians');

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

const formattedPopulation = computed(() => {
  const count = props.conditions.demographics.totalCount;
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(2)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
});

const evacuationStatusClass = computed(() => {
  const status = props.conditions.demographics.evacuationStatus;
  switch (status) {
    case 'emergency':
      return 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse';
    case 'mandatory':
      return 'bg-amber-950/80 border-amber-500/80 text-amber-300';
    case 'advisory':
      return 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300';
    default:
      return 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300';
  }
});

const aqiBadgeClass = computed(() => {
  const cat = props.conditions.physics.aqiCategory;
  switch (cat) {
    case 'Hazardous':
      return 'bg-purple-950/90 border-purple-500 text-purple-300';
    case 'Very Unhealthy':
      return 'bg-rose-950/90 border-rose-500 text-rose-300';
    case 'Unhealthy':
      return 'bg-orange-950/80 border-orange-500 text-orange-300';
    case 'Moderate':
      return 'bg-amber-950/80 border-amber-500 text-amber-300';
    default:
      return 'bg-emerald-950/70 border-emerald-500 text-emerald-300';
  }
});

const oxygenPhysiology = computed(() => {
  const po2 = props.conditions.physics.oxygenPartialPressureKPa;
  if (po2 < 10) return { label: 'Fatal Asphyxia (<10 kPa)', color: 'text-rose-400', desc: 'Severe brain anoxia; immediate loss of consciousness.' };
  if (po2 < 14) return { label: 'Severe Hypoxia (<14 kPa)', color: 'text-orange-400', desc: 'Impaired cognition, cyanosis, twilight dizziness.' };
  if (po2 < 18) return { label: 'Mild Hypoxia (<18 kPa)', color: 'text-amber-400', desc: 'Shortness of breath during exertion; fatigue.' };
  if (po2 <= 26) return { label: 'Optimal Respiration (18-26 kPa)', color: 'text-emerald-400', desc: 'Normal hemoglobin saturation (~98%).' };
  return { label: 'Hyperoxic Risk (>26 kPa)', color: 'text-purple-400', desc: 'Elevated oxygen radicals; high flammability danger.' };
});

// Compute SVG sparkline path from history buffer
const sparklinePath = computed(() => {
  if (!props.history || props.history.length < 2) return '';
  const pts = props.history;
  const w = 280;
  const h = 45;
  const step = w / (pts.length - 1);

  return pts
    .map((p, idx) => {
      const x = idx * step;
      const y = h - 4 - (p.climateBalance / 100) * (h - 8);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
});
</script>

<template>
  <aside
    v-show="!isCollapsed"
    class="absolute top-16 right-3 bottom-14 z-20 flex flex-col w-[320px] sm:w-[360px] max-w-[calc(100vw-24px)] transition-all duration-300"
    aria-label="Realistic Simulation Dynamics Dashboard"
  >
    <div class="h-full flex flex-col bg-slate-950/90 backdrop-blur-md border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden text-white text-xs select-none">
      <!-- Header -->
      <div class="p-3 border-b border-slate-800/80 bg-slate-900/70 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-cyan-400" />
          <span class="font-bold tracking-wide uppercase text-[11px] text-cyan-200">Simulation Realism</span>
        </div>

        <button
          type="button"
          @click="emit('toggle-collapse')"
          class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Collapse realism dashboard"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- Segmented Navigation Tabs -->
      <div class="grid grid-cols-3 gap-1 p-1.5 bg-slate-900/40 border-b border-slate-800/80 text-[10px] font-semibold">
        <button
          type="button"
          @click="activeTab = 'civilians'"
          :class="[
            'py-1.5 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer',
            activeTab === 'civilians'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          ]"
        >
          <Users class="w-3.5 h-3.5 shrink-0" />
          <span>People & Impact</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'physics'"
          :class="[
            'py-1.5 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer',
            activeTab === 'physics'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          ]"
        >
          <Wind class="w-3.5 h-3.5 shrink-0" />
          <span>Atmosphere (pO₂)</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'metrics'"
          :class="[
            'py-1.5 px-1 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer',
            activeTab === 'metrics'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          ]"
        >
          <HeartPulse class="w-3.5 h-3.5 shrink-0" />
          <span>Planetary Status</span>
        </button>
      </div>

      <!-- Main Body Scroll Area -->
      <div class="flex-1 overflow-y-auto p-3 space-y-3.5">
        
        <!-- TAB 1: CIVILIANS & REALISTIC DEMOGRAPHIC IMPACT -->
        <div v-if="activeTab === 'civilians'" class="space-y-3">
          <!-- Population Count & Evacuation Alert Banner -->
          <div :class="['p-2.5 rounded-xl border flex items-center justify-between', evacuationStatusClass]">
            <div>
              <div class="text-[9px] uppercase tracking-wider font-bold opacity-80">Civilian Evacuation Status</div>
              <div class="font-mono font-bold text-sm tracking-wide uppercase">
                {{ conditions.demographics.evacuationStatus }} Protocol
              </div>
            </div>
            <div class="text-right">
              <div class="text-[9px] uppercase tracking-wider font-bold opacity-80">Total Population</div>
              <div class="font-mono font-bold text-sm text-white">
                {{ formattedPopulation }}
              </div>
            </div>
          </div>

          <!-- Demographic Stress Matrix -->
          <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span>Epidemiological & Respiration State</span>
              <span class="font-mono text-[10px] text-cyan-400">{{ conditions.demographics.healthyPercent }}% Healthy</span>
            </div>

            <!-- Healthy vs Respiratory Stress Dual Bar -->
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                class="bg-emerald-500 h-full transition-all duration-300"
                :style="{ width: `${conditions.demographics.healthyPercent}%` }"
                title="Healthy Population"
              ></div>
              <div
                class="bg-rose-500 h-full transition-all duration-300"
                :style="{ width: `${conditions.demographics.respiratoryStressPercent}%` }"
                title="Respiratory Distress"
              ></div>
            </div>

            <div class="grid grid-cols-2 gap-2 pt-1 text-[10px] font-mono">
              <div class="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span class="text-slate-400 block text-[9px]">Mask Adoption</span>
                <span class="text-amber-300 font-bold text-xs">{{ conditions.demographics.maskCompliancePercent }}%</span>
                <span class="text-slate-500 text-[9px] block">N95 / Respirators</span>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-950/70 border border-slate-800/60">
                <span class="text-slate-400 block text-[9px]">Casualty / Distress</span>
                <span :class="['font-bold text-xs', conditions.demographics.casualtyRatePerDay > 0 ? 'text-rose-400' : 'text-emerald-400']">
                  {{ conditions.demographics.casualtyRatePerDay }}/day
                </span>
                <span class="text-slate-500 text-[9px] block">Atmospheric cause</span>
              </div>
            </div>
          </div>

          <!-- Live Civilian Thoughts / Field Reports -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
              <Users class="w-3.5 h-3.5 text-cyan-400" />
              <span>Ground Transmissions (Citizens in 3D View)</span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="(thought, idx) in conditions.demographics.activeThoughts"
                :key="idx"
                class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] leading-relaxed text-slate-300 flex items-start gap-2"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5 animate-pulse"></span>
                <span>{{ thought }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: ATMOSPHERIC PHYSICS & OXYGEN LEVEL -->
        <div v-else-if="activeTab === 'physics'" class="space-y-3">
          <!-- Oxygen Partial Pressure Card -->
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-200 text-[11px]">Oxygen Partial Pressure (pO₂)</span>
              <span class="font-mono text-cyan-300 font-bold text-xs">
                {{ conditions.physics.oxygenPartialPressureKPa }} kPa
              </span>
            </div>

            <!-- Pressure gauge bar: baseline 21.2 kPa at sea level -->
            <div class="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                :style="{ width: `${Math.min(100, (conditions.physics.oxygenPartialPressureKPa / 35) * 100)}%` }"
              ></div>
            </div>

            <!-- Physiological assessment text -->
            <div class="p-2 rounded-lg bg-slate-950/70 border border-slate-800/60 space-y-0.5">
              <div :class="['font-bold text-[10px]', oxygenPhysiology.color]">
                {{ oxygenPhysiology.label }}
              </div>
              <p class="text-[10px] text-slate-400 leading-snug">
                {{ oxygenPhysiology.desc }}
              </p>
            </div>
          </div>

          <!-- Air Quality Index (AQI) Card -->
          <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-slate-200 text-[11px]">Air Quality Index (AQI)</span>
              <span :class="['px-2 py-0.5 rounded font-mono font-bold text-[10px] border', aqiBadgeClass]">
                AQI {{ conditions.physics.airQualityIndex }} · {{ conditions.physics.aqiCategory }}
              </span>
            </div>

            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-emerald-400 via-amber-400 via-rose-500 to-purple-600 transition-all duration-300 rounded-full"
                :style="{ width: `${Math.min(100, (conditions.physics.airQualityIndex / 400) * 100)}%` }"
              ></div>
            </div>
            <p class="text-[10px] text-slate-400">
              Microparticulate PM2.5, ozone, and toxic pollutants impacting human lungs and visible volumetric haze.
            </p>
          </div>

          <!-- Dynamic Weather Physical Sensors -->
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
              <CloudRain class="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span class="text-slate-400 block text-[9px]">Surface Wetness</span>
                <span class="text-sky-300 font-bold text-xs">{{ Math.round(conditions.physics.surfaceWetness * 100) }}%</span>
              </div>
            </div>
            <div class="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
              <Zap class="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span class="text-slate-400 block text-[9px]">Lightning Arc</span>
                <span :class="['font-bold text-xs', conditions.physics.lightningActive ? 'text-amber-300 animate-pulse' : 'text-slate-500']">
                  {{ conditions.physics.lightningActive ? 'ACTIVE DISCHARGE' : 'GROUNDED' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: PLANETARY STATUS & GAUGES -->
        <div v-else-if="activeTab === 'metrics'" class="space-y-3.5">
          <!-- 6 Condition Gauges -->
          <div class="space-y-2">
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
              <span class="text-slate-300 font-medium">Climate Equilibrium Curve</span>
              <span class="font-mono text-[10px] text-pink-400">{{ conditions.climateBalance }}%</span>
            </div>

            <!-- SVG Sparkline -->
            <div class="w-full h-11 bg-slate-950/60 rounded-lg p-1 flex items-center justify-center">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 280 45">
                <path
                  v-if="sparklinePath"
                  :d="sparklinePath"
                  fill="none"
                  stroke="#f472b6"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line x1="0" y1="22.5" x2="280" y2="22.5" stroke="#334155" stroke-dasharray="3 3" stroke-width="0.7" />
              </svg>
            </div>
            <div class="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>Historical Epoch</span>
              <span>Live Delta</span>
            </div>
          </div>

          <!-- Active Environmental Alerts -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-1.5 text-slate-300 text-[11px] font-semibold">
              <ShieldAlert class="w-3.5 h-3.5 text-cyan-400" />
              <span>Active System Alerts</span>
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

      </div>

      <!-- Realism Model Footer -->
      <div class="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[10px] text-slate-400 leading-tight flex items-start gap-1.5">
        <ShieldAlert class="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          <strong class="text-cyan-300 font-semibold">Atmospheric & Demographic Realism Engine:</strong>
          Dalton partial pressure, EPA AQI, and civilian reactive pathfinding.
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
    title="Expand Metrics & Demographics"
    aria-label="Expand Metrics & Demographics Dashboard"
  >
    <ChevronLeft class="w-5 h-5" />
  </button>
</template>
