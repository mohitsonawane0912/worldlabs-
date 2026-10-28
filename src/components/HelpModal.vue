<script setup lang="ts">
import {
  X,
  HelpCircle,
  Sparkles,
  Keyboard,
  ShieldAlert,
  Flame,
  Wind,
  Globe,
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const shortcuts = [
  { key: 'Space', desc: 'Pause or resume simulation playback' },
  { key: '1 / 2 / 3 / 4', desc: 'Set simulation speed (Pause, 1x, 5x, 20x)' },
  { key: 'H', desc: 'Toggle HUD interface (Cinema / Zen Mode)' },
  { key: 'D', desc: 'Toggle 3D Dynamics floating inspector panel' },
  { key: 'R', desc: 'Reset parameters to scene defaults' },
  { key: 'M', desc: 'Mute or unmute procedural synthesized audio' },
  { key: 'Mouse Drag', desc: 'Rotate 3D camera / orbit world' },
  { key: 'Scroll Wheel', desc: 'Zoom camera in and out' },
];
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-guide-title"
  >
    <div class="w-full max-w-xl bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
      <!-- Modal Header -->
      <div class="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <HelpCircle class="w-5 h-5 text-cyan-400" />
          <h2 id="help-guide-title" class="font-bold text-base text-cyan-100">World Lab Guide & Mechanics</h2>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close help guide"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body Content -->
      <div class="p-5 overflow-y-auto space-y-5 text-xs">
        <!-- Hero invitation -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-emerald-950/40 border border-cyan-700/40 space-y-1.5">
          <div class="flex items-center gap-2 text-cyan-300 font-bold text-sm">
            <Sparkles class="w-4 h-4 text-cyan-400" />
            <span>Welcome to World Lab</span>
          </div>
          <p class="text-slate-300 leading-relaxed text-xs">
            <strong>Choose a world. Change one variable. Watch the chain reaction.</strong>
            World Lab lets you explore systemic ecological, atmospheric, and technological feedback loops across 5 distinct 3D environments.
          </p>
        </div>

        <!-- How Parameters Interact -->
        <div class="space-y-2">
          <h3 class="font-bold text-cyan-200 text-sm flex items-center gap-1.5">
            <Globe class="w-4 h-4 text-cyan-400" />
            <span>Systemic Feedback Loops</span>
          </h3>
          <ul class="space-y-1.5 text-slate-300 leading-relaxed pl-1">
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span><strong>Atmospheric Oxygen:</strong> Reduced oxygen shifts atmospheric sky haze, dampens biological growth, and drops population wellbeing.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
              <span><strong>Temperature & Ice:</strong> Elevated warmth accelerates evaporation and melts polar ice caps; extreme cold locks water into glaciers.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
              <span><strong>Energy Infrastructure:</strong> Transitioning to 100% Renewable energy purifies air pollution over time, whereas Fossil fuels drive greenhouse warming.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0"></span>
              <span><strong>Crisis Multipliers:</strong> Pairing high heat with drought drastically stresses water security and induces coral bleaching and vegetation dieback.</span>
            </li>
          </ul>
        </div>

        <!-- Keyboard Shortcuts -->
        <div class="space-y-2">
          <h3 class="font-bold text-cyan-200 text-sm flex items-center gap-1.5">
            <Keyboard class="w-4 h-4 text-cyan-400" />
            <span>Keyboard Shortcuts</span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              v-for="sc in shortcuts"
              :key="sc.key"
              class="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <span class="text-slate-400 text-[11px]">{{ sc.desc }}</span>
              <kbd class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-cyan-300 font-bold shrink-0">
                {{ sc.key }}
              </kbd>
            </div>
          </div>
        </div>

        <!-- Educational Model Disclaimer -->
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-amber-900/40 flex items-start gap-2.5 text-amber-200/90 leading-relaxed">
          <ShieldAlert class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong class="text-amber-100 font-semibold block mb-0.5">Educational Simulation Disclaimer:</strong>
            World Lab is an educational game sandbox. Results are based on simplified interactive models designed to demonstrate complex systems thinking, not scientifically exact predictions or real-world safety guidance.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
