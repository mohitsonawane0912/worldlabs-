<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  PresetScenario,
  SavedScenario,
  SimulationParameters,
  DisasterEvents,
  WorldSceneId,
} from '../types/simulation';
import { PRESET_SCENARIOS } from '../engine/simulationEngine';
import {
  X,
  BookOpen,
  BookmarkCheck,
  Trash2,
  Play,
  Save,
  Globe,
  Sparkles,
  Trees,
  Building2,
  Waves,
} from 'lucide-vue-next';
import { audioSynth } from '../utils/audioSynth';

const props = defineProps<{
  isOpen: boolean;
  currentParams: SimulationParameters;
  currentEvents: DisasterEvents;
  currentSceneId: WorldSceneId;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'load-preset', preset: PresetScenario): void;
  (e: 'load-saved', saved: SavedScenario): void;
}>();

const savedScenarios = ref<SavedScenario[]>([]);
const newScenarioName = ref('');
const activeTab = ref<'presets' | 'saved'>('presets');

function loadSavedFromStorage() {
  try {
    const raw = localStorage.getItem('world_lab_saved_scenarios');
    if (raw) {
      savedScenarios.value = JSON.parse(raw);
    }
  } catch {
    savedScenarios.value = [];
  }
}

onMounted(() => {
  loadSavedFromStorage();
});

function handleSaveCurrent() {
  const name = newScenarioName.value.trim() || `Scenario ${savedScenarios.value.length + 1}`;
  const newEntry: SavedScenario = {
    id: `save-${Date.now()}`,
    name,
    savedAt: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    sceneId: props.currentSceneId,
    parameters: { ...props.currentParams },
    events: { ...props.currentEvents },
  };

  savedScenarios.value.unshift(newEntry);
  localStorage.setItem('world_lab_saved_scenarios', JSON.stringify(savedScenarios.value));
  newScenarioName.value = '';
  audioSynth.playAchievement();
  activeTab.value = 'saved';
}

function handleDeleteSaved(id: string) {
  savedScenarios.value = savedScenarios.value.filter((s) => s.id !== id);
  localStorage.setItem('world_lab_saved_scenarios', JSON.stringify(savedScenarios.value));
  audioSynth.playClick();
}

function getSceneIcon(sceneId: WorldSceneId) {
  switch (sceneId) {
    case 'mini-earth': return Globe;
    case 'forest-valley': return Trees;
    case 'future-city': return Building2;
    case 'ocean-world': return Waves;
    case 'mars-colony': return Sparkles;
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    role="dialog"
    aria-modal="true"
    aria-labelledby="scenario-library-title"
  >
    <div class="w-full max-w-2xl bg-slate-900 border border-cyan-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
      <!-- Modal Header -->
      <div class="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <BookOpen class="w-5 h-5 text-cyan-400" />
          <h2 id="scenario-library-title" class="font-bold text-base text-cyan-100">Scenario Library</h2>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close scenario library"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="px-4 pt-3 border-b border-slate-800 flex gap-2 bg-slate-950/30">
        <button
          type="button"
          @click="activeTab = 'presets'"
          :class="[
            'pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer',
            activeTab === 'presets' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          Curated Presets ({{ PRESET_SCENARIOS.length }})
        </button>

        <button
          type="button"
          @click="activeTab = 'saved'"
          :class="[
            'pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
            activeTab === 'saved' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200',
          ]"
        >
          <BookmarkCheck class="w-3.5 h-3.5" />
          <span>My Saved Scenarios ({{ savedScenarios.length }})</span>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <!-- TAB 1: CURATED PRESETS -->
        <div v-if="activeTab === 'presets'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="sc in PRESET_SCENARIOS"
            :key="sc.id"
            class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-3 group"
          >
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5 font-bold text-sm text-cyan-200">
                  <component :is="getSceneIcon(sc.sceneId)" class="w-4 h-4 text-cyan-400" />
                  <span>{{ sc.name }}</span>
                </div>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/40 text-cyan-300">
                  {{ sc.badge }}
                </span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">{{ sc.description }}</p>
            </div>

            <!-- Parameters brief -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
              <span>O2: {{ sc.parameters.oxygen }}% · {{ sc.parameters.temperature }}°C</span>
              <button
                type="button"
                @click="emit('load-preset', sc)"
                class="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow"
              >
                <Play class="w-3 h-3 fill-current" />
                <span>Launch</span>
              </button>
            </div>
          </div>
        </div>

        <!-- TAB 2: SAVED SCENARIOS -->
        <div v-else class="space-y-4">
          <!-- Save Current Box -->
          <div class="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-2">
            <span class="text-xs font-bold text-cyan-200">Save Current Sandbox State</span>
            <div class="flex gap-2">
              <input
                v-model="newScenarioName"
                type="text"
                placeholder="Give your scenario a name (e.g. Frozen Mars, Solar Flare City)..."
                class="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                @click="handleSaveCurrent"
                class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                <Save class="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <!-- Saved List -->
          <div v-if="savedScenarios.length === 0" class="p-8 text-center text-slate-500 text-xs">
            No custom scenarios saved yet. Tweak parameters and click "Save" above to bookmark your what-if states!
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="save in savedScenarios"
              :key="save.id"
              class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
            >
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <component :is="getSceneIcon(save.sceneId)" class="w-4 h-4 text-cyan-400" />
                  <span class="font-bold text-sm text-cyan-200">{{ save.name }}</span>
                </div>
                <div class="text-[10px] text-slate-500 font-mono">
                  Saved {{ save.savedAt }} · O2: {{ save.parameters.oxygen }}% · {{ save.parameters.temperature }}°C
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="emit('load-saved', save)"
                  class="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Play class="w-3 h-3 fill-current" />
                  <span>Load</span>
                </button>

                <button
                  type="button"
                  @click="handleDeleteSaved(save.id)"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Delete scenario"
                  aria-label="Delete saved scenario"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
