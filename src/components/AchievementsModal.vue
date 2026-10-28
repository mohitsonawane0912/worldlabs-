<script setup lang="ts">
import { Achievement } from '../types/simulation';
import {
  X,
  Award,
  Globe,
  Building2,
  Waves,
  Sparkles,
  FlaskConical,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
  achievements: Achievement[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function getIcon(iconName: string) {
  switch (iconName) {
    case 'Globe': return Globe;
    case 'Building2': return Building2;
    case 'Waves': return Waves;
    case 'Sparkles': return Sparkles;
    case 'FlaskConical': return FlaskConical;
    default: return Calendar;
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="achievements-title"
  >
    <div class="w-full max-w-lg bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
      <!-- Modal Header -->
      <div class="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Award class="w-5 h-5 text-amber-400" />
          <h2 id="achievements-title" class="font-bold text-base text-amber-100">Planetary Achievements</h2>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close achievements modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Achievements list -->
      <div class="p-4 space-y-2.5 overflow-y-auto">
        <div
          v-for="ach in achievements"
          :key="ach.id"
          :class="[
            'p-3.5 rounded-xl border transition-all flex items-start gap-3.5',
            ach.unlocked
              ? 'bg-amber-950/20 border-amber-500/40 text-amber-50'
              : 'bg-slate-950/50 border-slate-800 text-slate-400 opacity-70',
          ]"
        >
          <!-- Icon box -->
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
              ach.unlocked
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-800/60 border-slate-700 text-slate-500',
            ]"
          >
            <component :is="getIcon(ach.icon)" class="w-5 h-5" />
          </div>

          <!-- Description & Status -->
          <div class="flex-1 space-y-1">
            <div class="flex items-center justify-between">
              <span :class="['font-bold text-sm', ach.unlocked ? 'text-amber-200' : 'text-slate-300']">
                {{ ach.title }}
              </span>
              <span
                :class="[
                  'text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1',
                  ach.unlocked
                    ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border border-slate-700 text-slate-500',
                ]"
              >
                <CheckCircle2 v-if="ach.unlocked" class="w-3 h-3" />
                <Lock v-else class="w-3 h-3" />
                {{ ach.unlocked ? 'UNLOCKED' : 'LOCKED' }}
              </span>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed">{{ ach.description }}</p>

            <div v-if="ach.unlocked && ach.unlockedAt !== undefined" class="text-[10px] font-mono text-amber-400/80 pt-1">
              Unlocked on Day {{ Math.floor(ach.unlockedAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
